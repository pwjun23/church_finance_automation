/**
 * Generates the Weekly Report.
 * Aggregates data from Data_General and Data_Special for a specific week.
 */
function generateReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reportSheet = ss.getSheetByName(SHEET_NAMES.REPORT_PRINT);
  
  if (!reportSheet) {
    SpreadsheetApp.getUi().alert('Report sheet not found. Please run setup first.');
    return;
  }
  
  // 1. Determine Date Range (e.g., this week)
  // For simplicity, we filter by a date entered in the Report Sheet or ask via Prompt
  // Let's assume Report Sheet B1 has the Start Date and B2 has End Date.
  
  let startDate = reportSheet.getRange("B1").getValue();
  let endDate = reportSheet.getRange("B2").getValue();
  
  if (!startDate || !endDate) {
    // Default to last 7 days if empty
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    
    reportSheet.getRange("B1").setValue(startDate);
    reportSheet.getRange("B2").setValue(endDate);
  }
  
  // 2. Fetch Data
  const generalData = getFilteredData(SHEET_NAMES.DATA_GENERAL, startDate, endDate);
  const specialData = getFilteredData(SHEET_NAMES.DATA_SPECIAL, startDate, endDate);
  
  // 3. Aggregate (Group by Type)
  const generalSummary = aggregateByType(generalData);
  const specialSummary = aggregateByType(specialData);
  
  // 4. Print to Sheet (Simple Clear & Paste for now)
  // User wants "Printable". We'll layout a simple table.
  
  // Clear previous report area (keeping header rows 1-4)
  reportSheet.getRange("A5:F100").clearContent();
  
  let currentRow = 5;
  
  // Section: General
  reportSheet.getRange(currentRow, 1).setValue("===== 일반 회계 (General) =====").setFontWeight("bold");
  currentRow++;
  currentRow = printSummary(reportSheet, generalSummary, currentRow);
  
  currentRow++;
  // Section: Special
  reportSheet.getRange(currentRow, 1).setValue("===== 특별 회계 (Special) =====").setFontWeight("bold");
  currentRow++;
  currentRow = printSummary(reportSheet, specialSummary, currentRow);
  
  SpreadsheetApp.getUi().alert('Report Generated Successfully!');
}

/**
 * Helper to get data between dates.
 * Assumes Col A is Date.
 */
function getFilteredData(sheetName, start, end) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const filtered = [];
  
  // Skip Header
  for (let i = 1; i < data.length; i++) {
    const date = new Date(data[i][0]);
    if (date >= start && date <= end) {
      filtered.push(data[i]);
    }
  }
  return filtered;
}

/**
 * Helper to group by Type (Col Index 2) and sum Amount (Col Index 3).
 */
function aggregateByType(dataRows) {
  const summary = {}; // { "Tithe": {online: 0, offline: 0, total: 0}, ... }
  
  dataRows.forEach(row => {
    const type = row[2]; // Type
    const amount = Number(row[3]);
    const method = row[4]; // Online or Offline/Cash/Check check?
    
    if (!summary[type]) {
      summary[type] = { count: 0, online: 0, offline: 0, total: 0 };
    }
    
    summary[type].count++;
    summary[type].total += amount;
    
    if (method === 'Online' || method === '이체' || String(method).includes('Online')) {
      summary[type].online += amount;
    } else {
      summary[type].offline += amount;
    }
  });
  
  return summary;
}

/**
 * Helper to print summary object to sheet.
 */
function printSummary(sheet, summaryObj, startRow) {
  let r = startRow;
  
  // Header
  sheet.getRange(r, 1, 1, 5).setValues([["유형 (Type)", "건수 (Count)", "온라인 (Online)", "오프라인 (Offline)", "합계 (Total)"]]);
  sheet.getRange(r, 1, 1, 5).setBackground("#EEE").setFontWeight("bold");
  r++;
  
  let grandTotal = 0;
  
  for (const [type, stats] of Object.entries(summaryObj)) {
    sheet.getRange(r, 1, 1, 5).setValues([[
      type, stats.count, stats.online, stats.offline, stats.total
    ]]);
    grandTotal += stats.total;
    r++;
  }
  
  // Total Row
  sheet.getRange(r, 1).setValue("총 합계 (Grand Total)").setFontWeight("bold");
  sheet.getRange(r, 5).setValue(grandTotal).setFontWeight("bold");
  r++;
  
  return r;
}
