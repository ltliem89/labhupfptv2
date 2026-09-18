// Services.gs
// Business logic for LAB HUB V2

const Services = {
  login(email, pin, reqId) {
    const teachers = Database.getTable('TEACHERS');
    const teacher = teachers.find(t => String(t.email).toLowerCase() === String(email).toLowerCase() && String(t.pin) === String(pin));
    
    if (!teacher || teacher.status !== 'ACTIVE') {
      return { ok: false, code: 'AUTH_INVALID', message: 'Tài khoản không hợp lệ' };
    }
    
    const teacherRooms = Database.getTable('TEACHER_ROOMS')
      .filter(tr => tr.teacher_id === teacher.teacher_id && tr.status === 'ACTIVE')
      .map(tr => tr.room_id);
      
    // Write Audit
    Database.insertRow('AUDIT_LOG', {
      audit_id: Utilities.getUuid(),
      actor_id: teacher.teacher_id,
      timestamp: new Date().toISOString(),
      action: 'LOGIN',
      entity: 'TEACHERS',
      entity_id: teacher.teacher_id,
      request_id: reqId,
      before: '',
      after: '',
      reason: 'Đăng nhập hệ thống'
    });
      
    return {
      ok: true,
      code: 'SUCCESS',
      data: {
        token: Utilities.getUuid(), // Simple token for this demo
        expires_at: new Date(Date.now() + 12 * 3600000).toISOString(),
        actor: {
          teacher_id: teacher.teacher_id,
          email: teacher.email,
          display_name: teacher.display_name,
          role: teacher.role,
          status: teacher.status,
          room_ids: teacherRooms
        }
      }
    };
  },

  bootstrap(teacherId, reqId) {
    const actorRow = Database.getTable('TEACHERS').find(t => t.teacher_id === teacherId);
    if (!actorRow) return { ok: false, code: 'FORBIDDEN', message: 'Unauthorized' };
    
    const role = actorRow.role;
    const myRooms = Database.getTable('TEACHER_ROOMS')
      .filter(tr => tr.teacher_id === teacherId && tr.status === 'ACTIVE')
      .map(tr => tr.room_id);
    
    const rooms = Database.getTable('ROOMS').filter(r => r.status === 'ACTIVE');
    const accessibleRooms = role === 'ADMIN' ? rooms : rooms.filter(r => myRooms.includes(r.room_id));
    
    // Inventory calculation
    const equipment = Database.getTable('EQUIPMENT').filter(e => e.status === 'ACTIVE');
    const accessibleEq = role === 'ADMIN' ? equipment : equipment.filter(e => myRooms.includes(e.room_id));
    
    const borrowRecords = Database.getTable('BORROW_RECORDS').filter(r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN');
    const activeBorrowIds = borrowRecords.map(r => r.borrow_id);
    
    const borrowItems = Database.getTable('BORROW_ITEMS').filter(i => activeBorrowIds.includes(i.borrow_id));
    
    const borrowedCount = {};
    borrowItems.forEach(item => {
      const remaining = Math.max(0, Number(item.quantity) - Number(item.returned_quantity || 0));
      borrowedCount[item.equipment_id] = (borrowedCount[item.equipment_id] || 0) + remaining;
    });
    
    const mergedInventory = accessibleEq.map(e => {
      const total = Number(e.total_quantity) || 0;
      const blocked = Number(e.blocked_quantity) || 0;
      const borrowed = borrowedCount[e.equipment_id] || 0;
      const available = Math.max(0, total - borrowed - blocked);
      return {
        ...e,
        total_quantity: total,
        blocked_quantity: blocked,
        borrowed_quantity: borrowed,
        available_quantity: available
      };
    });

    return {
      ok: true,
      code: 'SUCCESS',
      data: {
        rooms: accessibleRooms,
        subjects: Database.getTable('SUBJECTS').filter(s => s.status === 'ACTIVE'),
        classes: Database.getTable('CLASSES').filter(c => c.status === 'ACTIVE'),
        topics: Database.getTable('TOPICS').filter(t => t.status === 'ACTIVE'),
        lessons: Database.getTable('LESSONS').filter(l => l.status === 'ACTIVE'),
        equipment: mergedInventory,
        topic_equipment: Database.getTable('TOPIC_EQUIPMENT').filter(te => te.status === 'ACTIVE'),
      }
    };
  },

  borrow(body, reqId) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
    } catch (e) {
      return { ok: false, code: 'SYSTEM_BUSY', message: 'Hệ thống đang bận, vui lòng thử lại sau.' };
    }

    try {
      // Idempotency check
      const existing = Database.getTable('BORROW_RECORDS').find(r => r.client_request_id === body.client_request_id);
      if (existing) {
        return { ok: true, code: 'SUCCESS', data: existing };
      }

      // Check stock
      const equipment = Database.getTable('EQUIPMENT');
      const borrowRecords = Database.getTable('BORROW_RECORDS').filter(r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN');
      const activeBorrowIds = borrowRecords.map(r => r.borrow_id);
      const borrowItems = Database.getTable('BORROW_ITEMS').filter(i => activeBorrowIds.includes(i.borrow_id));
      
      const borrowedCount = {};
      borrowItems.forEach(item => {
        const remaining = Math.max(0, Number(item.quantity) - Number(item.returned_quantity || 0));
        borrowedCount[item.equipment_id] = (borrowedCount[item.equipment_id] || 0) + remaining;
      });

      for (let reqItem of body.items) {
        const eq = equipment.find(e => e.equipment_id === reqItem.equipment_id);
        if (!eq) throw new Error("Equipment not found");
        const total = Number(eq.total_quantity) || 0;
        const blocked = Number(eq.blocked_quantity) || 0;
        const borrowed = borrowedCount[eq.equipment_id] || 0;
        const available = Math.max(0, total - borrowed - blocked);
        if (reqItem.quantity > available) {
          return { ok: false, code: 'INSUFFICIENT_STOCK', message: `Không đủ số lượng thiết bị: ${eq.equipment_name}` };
        }
      }

      // Insert record
      const now = new Date().toISOString();
      const borrowId = 'BR-' + Utilities.getUuid().substring(0, 8).toUpperCase();
      
      const newRecord = {
        borrow_id: borrowId,
        client_request_id: body.client_request_id,
        teacher_id: body.teacher_id,
        room_id: body.room_id,
        subject_id: body.subject_id,
        class_id: body.class_id,
        topic_id: body.topic_id,
        lesson_id: body.lesson_id,
        borrowed_at: now,
        status: 'BORROWED',
        note: body.note || '',
        created_at: now,
        updated_at: now
      };
      Database.insertRow('BORROW_RECORDS', newRecord);

      body.items.forEach(item => {
        Database.insertRow('BORROW_ITEMS', {
          borrow_item_id: 'BI-' + Utilities.getUuid().substring(0,8).toUpperCase(),
          borrow_id: borrowId,
          equipment_id: item.equipment_id,
          quantity: item.quantity,
          returned_quantity: 0,
          incident_quantity: 0,
          incident_type: 'NORMAL',
          incident_note: '',
          status: 'BORROWED',
          created_at: now,
          updated_at: now
        });
      });

      Database.insertRow('AUDIT_LOG', {
        audit_id: Utilities.getUuid(),
        actor_id: body.teacher_id,
        timestamp: now,
        action: 'BORROW',
        entity: 'BORROW_RECORDS',
        entity_id: borrowId,
        request_id: reqId,
        before: '',
        after: JSON.stringify(newRecord),
        reason: 'Mượn thiết bị'
      });

      return { ok: true, code: 'SUCCESS', data: newRecord };
    } catch(err) {
      return { ok: false, code: 'ERROR', message: err.message };
    } finally {
      lock.releaseLock();
    }
  },

  returnBorrow(body, reqId) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      
      const record = Database.getTable('BORROW_RECORDS').find(r => r.borrow_id === body.borrow_id);
      if (!record) return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy phiếu mượn' };
      if (record.status === 'RETURNED') return { ok: true, code: 'SUCCESS', data: record };

      const items = Database.getTable('BORROW_ITEMS').filter(i => i.borrow_id === body.borrow_id);
      const providedMap = {};
      (body.items || []).forEach(i => { providedMap[i.borrow_item_id] = i; });

      let allReturned = true;
      const now = new Date().toISOString();

      items.forEach(item => {
        const input = providedMap[item.borrow_item_id];
        let retQty = Number(item.quantity);
        
        if (input && input.returned_quantity !== undefined) {
          retQty = Number(input.returned_quantity);
        }
        
        if (retQty < Number(item.quantity)) {
          allReturned = false;
        }

        Database.updateRow('BORROW_ITEMS', 'borrow_item_id', item.borrow_item_id, {
          returned_quantity: retQty,
          status: retQty >= Number(item.quantity) ? 'RETURNED' : 'BORROWED',
          updated_at: now
        });
      });

      const newStatus = allReturned ? 'RETURNED' : 'PARTIAL_RETURN';
      const updateData = { status: newStatus, updated_at: now };
      if (allReturned) updateData.returned_at = now;
      
      Database.updateRow('BORROW_RECORDS', 'borrow_id', body.borrow_id, updateData);

      Database.insertRow('AUDIT_LOG', {
        audit_id: Utilities.getUuid(),
        actor_id: body.teacher_id,
        timestamp: now,
        action: allReturned ? 'RETURN' : 'PARTIAL_RETURN',
        entity: 'BORROW_RECORDS',
        entity_id: body.borrow_id,
        request_id: reqId,
        before: '',
        after: JSON.stringify(updateData),
        reason: 'Trả thiết bị'
      });

      return { ok: true, code: 'SUCCESS', data: { ...record, ...updateData } };
    } catch(err) {
      return { ok: false, code: 'ERROR', message: err.message };
    } finally {
      lock.releaseLock();
    }
  },

  getMyDashboard(teacherId, reqId) {
    const allRecords = Database.getTable('BORROW_RECORDS').filter(r => r.teacher_id === teacherId);
    const allItems = Database.getTable('BORROW_ITEMS');
    const activeBorrows = allRecords.filter(r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN');
    
    // Add logic to populate details
    return {
      ok: true,
      code: 'SUCCESS',
      data: {
        counts: {
          total_borrow_records: allRecords.length,
          active_borrow_records: activeBorrows.length,
          overdue_records: 0,
        },
        active_borrows: activeBorrows.map(r => ({
          ...r, 
          items: allItems.filter(i => i.borrow_id === r.borrow_id)
        })),
        all_records: allRecords.map(r => ({
          ...r,
          items: allItems.filter(i => i.borrow_id === r.borrow_id)
        }))
      }
    };
  },

  getAdminDashboard(teacherId, reqId) {
    return { ok: true, code: 'SUCCESS', data: {} };
  },

  createEquipmentRequest(body, reqId) {
    return { ok: false, code: 'NOT_IMPLEMENTED', message: 'Tính năng đề xuất thiết bị đang phát triển' };
  },

  approveEquipmentRequest(body, reqId) {
    return { ok: false, code: 'NOT_IMPLEMENTED', message: 'Tính năng duyệt thiết bị đang phát triển' };
  },

  rejectEquipmentRequest(body, reqId) {
    return { ok: false, code: 'NOT_IMPLEMENTED', message: 'Tính năng từ chối thiết bị đang phát triển' };
  }
};

