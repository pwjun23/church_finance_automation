/**
 * Church Finance Automation Script
 * 
 * @OnlyCurrentDoc
 */

// Global Constants for Sheet Names
const SHEET_NAMES = {
  DASHBOARD: 'Dashboard',
  INPUT_BANK: 'Input_Bank',     // Paste Bank Excel data here
  INPUT_MANUAL: 'Input_Manual', // Manual entry form
  DATA_GENERAL: 'Data_General', // Database for General Offering
  DATA_SPECIAL: 'Data_Special', // Database for Special Offering
  REPORT_PRINT: 'Report_Print'  // Final printable report
};

/**
 * Creates the custom menu when the spreadsheet is opened.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⛪ 재정 관리 (Finance)')
    .addItem('1. 초기 설정 (Initialize)', 'setupSheets')
    .addSeparator()
    .addItem('2. 은행 자료 처리 (Process Bank Data)', 'processBankData')
    .addItem('3. 수기 입력 저장 (Submit Manual Entry)', 'submitManualEntry')
    .addSeparator()
    .addItem('4. 보고서 생성 (Generate Report)', 'generateReport')
    .addToUi();
}

/**
 * Creates the necessary sheets if they don't exist.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Sheets
  Object.values(SHEET_NAMES).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === SHEET_NAMES.DATA_GENERAL || sheetName === SHEET_NAMES.DATA_SPECIAL) {
        // Add Headers for Database
        sheet.appendRow(['Date', 'Name', 'Type', 'Amount', 'Method', 'Note', 'Timestamp']);
        sheet.setFrozenRows(1);
      }
    }
  });
  
  SpreadsheetApp.getUi().alert('모든 시트가 준비되었습니다. (All sheets are ready.)');
}
