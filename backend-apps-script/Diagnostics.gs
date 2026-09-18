// Diagnostics.gs

const Diagnostics = {
  runDiagnostics(reqId) {
    const ss = Database.getSpreadsheet();
    const sheets = ss.getSheets();
    const sheetMap = {};
    sheets.forEach(s => sheetMap[s.getName()] = { exists: true, rows: Math.max(0, s.getLastRow() - 1), columns: s.getLastColumn() });
    
    return {
      ok: true,
      code: 'SUCCESS',
      data: {
        service: 'LAB HUB V2',
        spreadsheet: {
          id: SPREADSHEET_ID,
          name: ss.getName()
        },
        sheets: sheetMap
      }
    };
  }
};
