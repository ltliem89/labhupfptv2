// Database.gs
// Handles Google Sheets operations

const SPREADSHEET_ID = '1obaOVTUMB0gw4GovB0wTxI_bLbi_GMYrsUjiOdBv_HY';

const SCHEMAS = {
  ROOMS: ['room_id', 'room_name', 'status', 'created_at', 'updated_at', 'note'],
  SUBJECTS: ['subject_id', 'subject_code', 'subject_name', 'status', 'created_at'],
  CLASSES: ['class_id', 'class_code', 'class_name', 'grade', 'status', 'created_at', 'note'],
  TOPICS: ['topic_id', 'topic_code', 'topic_name', 'subject_id', 'class_id', 'status', 'created_at', 'note'],
  LESSONS: ['lesson_id', 'lesson_code', 'lesson_name', 'topic_id', 'status', 'created_at', 'note'],
  EQUIPMENT: ['equipment_id', 'equipment_code', 'equipment_name', 'room_id', 'total_quantity', 'blocked_quantity', 'status', 'image_url', 'created_by', 'created_at', 'updated_at', 'note'],
  TOPIC_EQUIPMENT: ['mapping_id', 'topic_id', 'equipment_id', 'default_quantity', 'required', 'status', 'created_at'],
  TEACHERS: ['teacher_id', 'email', 'pin', 'display_name', 'role', 'status', 'created_at', 'updated_at', 'note'],
  TEACHER_ROOMS: ['teacher_room_id', 'teacher_id', 'room_id', 'status', 'created_at'],
  BORROW_RECORDS: ['borrow_id', 'client_request_id', 'teacher_id', 'room_id', 'subject_id', 'class_id', 'topic_id', 'lesson_id', 'borrowed_at', 'returned_at', 'status', 'note', 'created_at', 'updated_at'],
  BORROW_ITEMS: ['borrow_item_id', 'borrow_id', 'equipment_id', 'quantity', 'returned_quantity', 'incident_quantity', 'incident_type', 'incident_note', 'status', 'created_at', 'updated_at'],
  EQUIPMENT_REQUESTS: ['request_id', 'requested_by', 'room_id', 'subject_id', 'class_id', 'topic_id', 'equipment_name', 'quantity', 'image_url', 'status', 'created_at', 'updated_at', 'note', 'approved_by', 'approved_at', 'rejected_reason'],
  AUDIT_LOG: ['audit_id', 'actor_id', 'timestamp', 'action', 'entity', 'entity_id', 'request_id', 'before', 'after', 'reason']
};

const Database = {
  getSpreadsheet() {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  },

  getTable(tableName) {
    const sheet = this.getSpreadsheet().getSheetByName(tableName);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
  },
  
  insertRow(tableName, obj) {
    const sheet = this.getSpreadsheet().getSheetByName(tableName);
    if (!sheet) throw new Error('Sheet not found: ' + tableName);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = headers.map(h => obj[h] !== undefined ? obj[h] : '');
    
    sheet.appendRow(rowData);
  },
  
  updateRow(tableName, idField, idValue, obj) {
    const sheet = this.getSpreadsheet().getSheetByName(tableName);
    if (!sheet) throw new Error('Sheet not found: ' + tableName);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf(idField);
    
    if (idIndex === -1) throw new Error('ID field not found in ' + tableName);
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === idValue) {
        const rowData = headers.map((h, colIdx) => obj[h] !== undefined ? obj[h] : data[i][colIdx]);
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowData]);
        return true;
      }
    }
    return false;
  },

  setupLabHub() {
    const ss = this.getSpreadsheet();
    for (const [tableName, columns] of Object.entries(SCHEMAS)) {
      let sheet = ss.getSheetByName(tableName);
      if (!sheet) {
        sheet = ss.insertSheet(tableName);
        sheet.appendRow(columns);
        sheet.getRange(1, 1, 1, columns.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
      } else {
        // Idempotent: check if columns are fully mapped, not implementing complex merge here
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
        if (headers.length === 0 || headers[0] === '') {
          sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
          sheet.getRange(1, 1, 1, columns.length).setFontWeight("bold");
        }
      }
    }
    return { ok: true, message: 'Setup completed' };
  }
};
