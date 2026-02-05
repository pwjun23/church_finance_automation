/**
 * Processes the bank data pasted into 'Input_Bank'.
 * Expects columns usually found in Hana Bank Excel exports:
 * Date, Summary, Withdrawal, Deposit, Balance, Branch, Etc.
 * We focus on 'Date', 'Name' (from Summary), and 'Deposit'.
 */
function processBankData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = ss.getSheetByName(SHEET_NAMES.INPUT_BANK);
  const targetSheet = ss.getSheetByName(SHEET_NAMES.DATA_GENERAL); // Default to General for sorting
  
  const ui = SpreadsheetApp.getUi();
  
  // 1. Get Data
  // Assuming user pastes data starting at A1. We look for headers in Row 1.
  const dataRange = inputSheet.getDataRange();
  const values = dataRange.getValues();
  
  if (values.length < 2) {
    ui.alert('No data found in Input_Bank.');
    return;
  }
  
  // 2. Identify Column Indices (Simple heuristic or fixed)
  // Adjust these indices based on the actual Hana Bank file structure
  // For now, let's assume: A=Date, B=Summary(Name), D=Deposit Amount
  const dateIdx = 0; 
  const nameIdx = 1; 
  const depositIdx = 3; // Example: Input, Name, ... Deposit
  
  const newRows = [];
  
  // 3. Loop through rows (skip header)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const date = row[dateIdx];
    let rawName = row[nameIdx];
    const amount = row[depositIdx];
    
    // Skip empty or withdrawal rows (assuming deposit > 0)
    if (!amount || amount <= 0 || amount === '') continue;
    
    // Clean Name (Remove numbers, brackets if necessary - e.g. "HongGilDong(1/6)")
    // Logic: If name has "HongGilDong(1/6)", we parse name and note?
    // User requirement: "Online vs Offline" distinction.
    
    let cleanName = rawName;
    let note = "Online Transfer";
    
    // Add to list
    newRows.push([
      date,
      cleanName,
      "Tithe", // Default type, user needs to categorize? Or logic involves auto-categorization map?
      amount,
      "Online",
      note,
      new Date()
    ]);
  }
  
  // 4. Confirm and Save
  if (newRows.length > 0) {
    // Optional: Ask user to categorizing before saving?
    // For automation, we dump to DB and then user reviews? 
    // Or we dump to a 'Staging' area. 
    // For now, appending to Data_General with "Uncategorized" type could be safer.
    
    // Let's modify the push above to use "General" as placeholder or check a mapping sheet.
    // Simplicity: Append to General DB.
    
    targetSheet.getRange(targetSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    
    // Clear Input
    inputSheet.clearContents();
    ui.alert(`${newRows.length} entries processed and moved to Data_General.`);
  } else {
    ui.alert('No valid deposit entries found.');
  }
}
