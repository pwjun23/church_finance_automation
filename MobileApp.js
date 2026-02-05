/**
 * Mobile Web App Logic
 */

// Serve the HTML page
function doGet(e) {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('교회 헌금 입력')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Process form submission from Mobile App
 */
function processMobileForm(data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Determine Target Sheet
    // Assuming Category map:
    // General: 십일조, 감사, 주일
    // Special: 선교, 건축, etc.
    // We need a helper to map Type -> Sheet, or just default to General/Special based on user input logic?
    // For now, let's look at the implementation plan schema or user logic.
    // User said: "General: 십의 일조, 감사, 주일(예배,아동부 예배)"
    // "Special: 선교, 장학, 건축, 일천번제, 특별, 목적"

    const generalTypes = ['십일조', '감사', '주일', '주일(아동부)'];
    const sheetName = generalTypes.includes(data.type) ? 'Data_General' : 'Data_Special';
    const targetSheet = ss.getSheetByName(sheetName);

    // 2. Parse Names
    // User: "홍길동,이순신" -> Name1: 홍길동, Name2: 홍길동,이순신
    const rawNames = data.name.trim();
    const names = rawNames.split(',').map(s => s.trim());

    const mainName = names[0]; // First name
    const fullNameStr = rawNames; // Full string

    // 3. Append Row
    // Schema: Date, Name(Rep), Name(Full), Type, Amount, Method, Timestamp
    // Note: Previous schema was simpler. We might need to adjust DataEntry.js or just use existing cols.
    // Existing schema in Code.js: ['Date', 'Name', 'Type', 'Amount', 'Method', 'Note', 'Timestamp']
    // We can use 'Name' for Rep Name, and 'Note' for Full Name list? Or 'Name' for Full List?
    // "Name 1, Name 2 cell" -> The user implies NEW columns or specific mapping. 
    // Let's use:
    // Col B: Main Name
    // Col F (Note): Full Name List 
    // OR insert a new column? 
    // Given current fixed layout in Code.js setup, let's put:
    // Name = Main Name
    // Note = Full Name String

    targetSheet.appendRow([
        data.date,          // Date
        mainName,           // Name (Representative)
        data.type,          // Type
        data.amount,        // Amount
        'Offline',          // Method (Always Offline/Cash per request)
        fullNameStr,        // Note (Full Name List)
        new Date()          // Timestamp
    ]);

    return { success: true };
}

/**
 * Get today's entries for a specific type to display in the list
 */
function getEntriesList(dateStr, type) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Determine Sheet
    const generalTypes = ['십일조', '감사', '주일', '주일(아동부)'];
    const sheetName = generalTypes.includes(type) ? 'Data_General' : 'Data_Special';
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) return { entries: [], total: 0 };

    const data = sheet.getDataRange().getValues();
    const entries = [];
    let total = 0;

    // Skip Header (Row 1)
    // Columns: 0=Date, 1=Name, 2=Type, 3=Amount, ... 5=Note(FullNames)

    // Simple Date comparison strings (YYYY-MM-DD)
    // data[row][0] might be Date object

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let rowDate = row[0];

        // Normalize Date to YYYY-MM-DD
        if (rowDate instanceof Date) {
            rowDate = Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
        }

        if (rowDate === dateStr && row[2] === type) {
            entries.push({
                name: row[5] || row[1], // Show Full Name list if available, else Rep Name
                amount: row[3]
            });
            total += Number(row[3] || 0);
        }
    }

    // Sort by recent? (End of array is recent). Reverse to show newest top?
    return {
        entries: entries.reverse(),
        total: total
    };
}
