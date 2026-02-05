/**
 * Handles manual entry submission.
 * Reads data from 'Input_Manual' sheet which should look like a form.
 */
function submitManualEntry() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName(SHEET_NAMES.INPUT_MANUAL);
  
  const ui = SpreadsheetApp.getUi();
  
  // Define where the form fields are
  // Example Layout:
  // B2: Date
  // B3: Name
  // B4: Type (Tithe, Thanksgiving, Mission, etc.)
  // B5: Amount
  // B6: Category (General/Special) -> Dropdown
  // B7: Method (Cash/Check)
  
  const date = formSheet.getRange("B2").getValue();
  const name = formSheet.getRange("B3").getValue();
  const type = formSheet.getRange("B4").getValue();
  const amount = formSheet.getRange("B5").getValue();
  const category = formSheet.getRange("B6").getValue(); // 'General' or 'Special'
  const method = formSheet.getRange("B7").getValue();
  
  if (!date || !name || !amount) {
    ui.alert('Please fill in Date, Name, and Amount.');
    return;
  }
  
  let targetSheetName = SHEET_NAMES.DATA_GENERAL;
  if (category === 'Special') {
    targetSheetName = SHEET_NAMES.DATA_SPECIAL;
  }
  
  const targetSheet = ss.getSheetByName(targetSheetName);
  
  targetSheet.appendRow([
    date,
    name,
    type,
    amount,
    method,
    "", // Note
    new Date()
  ]);
  
  // Clear non-fixed fields? or keep Date?
  formSheet.getRange("B3").clearContent(); // Name
  formSheet.getRange("B5").clearContent(); // Amount
  // Keep Date and Category for faster sequential entry usually
  
  ui.alert('Saved!');
}
