// Code.gs
// LAB HUB V2 - Backend API Entry Point

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    const action = getAction(e, method);
    
    if (action === 'health') {
      return jsonResponse({ ok: true, code: 'SUCCESS', message: 'OK', data: { status: 'healthy', version: '2.0.0' }, request_id: generateRequestId() });
    }
    
    let body = {};
    if (method === 'POST' && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        return jsonResponse({ ok: false, code: 'INVALID_REQUEST', message: 'Invalid JSON payload' });
      }
    }
    
    const reqAction = body.action || action;
    const reqId = body.request_id || generateRequestId();
    
    switch (reqAction) {
      case 'login': return jsonResponse(Services.login(body.email, body.pin, reqId));
      case 'bootstrap': return jsonResponse(Services.bootstrap(body.teacher_id, reqId));
      case 'borrow': return jsonResponse(Services.borrow(body, reqId));
      case 'return': return jsonResponse(Services.returnBorrow(body, reqId));
      case 'my-dashboard': return jsonResponse(Services.getMyDashboard(body.teacher_id, reqId));
      case 'admin-dashboard': return jsonResponse(Services.getAdminDashboard(body.teacher_id, reqId));
      case 'equipment-request-create': return jsonResponse(Services.createEquipmentRequest(body, reqId));
      case 'equipment-request-approve': return jsonResponse(Services.approveEquipmentRequest(body, reqId));
      case 'equipment-request-reject': return jsonResponse(Services.rejectEquipmentRequest(body, reqId));
      case 'diagnostics': return jsonResponse(Diagnostics.runDiagnostics(reqId));
      default: return jsonResponse({ ok: false, code: 'NOT_FOUND', message: 'Unknown action: ' + reqAction, request_id: reqId });
    }

  } catch (error) {
    return jsonResponse({
      ok: false,
      code: 'SERVER_ERROR',
      message: error.message || 'Internal Server Error',
      request_id: generateRequestId()
    });
  }
}

function getAction(e, method) {
  if (e && e.parameter && e.parameter.action) return e.parameter.action;
  return '';
}

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function generateRequestId() {
  return 'REQ-' + Utilities.getUuid();
}
