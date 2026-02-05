# Implementation Plan - Church Finance Automation

## Goal Description
Automate the manual process of organizing church offerings, reducing work for the 4-person financial team. Move from local Files (Excel/Word) to a collaborative Google Sheets + Apps Script environment.

## User Review Required
> [!IMPORTANT]
> **Full Migration to Sheets Recommended**: The user proposed copying data back to Excel (`2026- 재정보고서.xlsx`). I recommend **fully migrating the reporting to Google Sheets** to eliminate this manual step. The plan below assumes we work primarily in Sheets, with optional Excel export if strictly necessary.

## Proposed Strategy

### 1. Unified Database (Google Sheets)
Instead of separate Word and Excel files, we will use a single "Master Spreadsheet" with the following structured tabs:
- **`Dashboard`**: Main interface for users to run scripts (buttons) and see status.
- **`Input_Bank`**: Raw import area for the Hana Bank Excel file.
- **`Input_Manual`**: Entry form for physical offerings (Tithe, Thanksgiving, etc.), optimized for 4 concurrent users using specific ranges or a web form.
- **`Data_General`**: Consolidated database for General accounts.
- **`Data_Special`**: Consolidated database for Special accounts.
- **`Report_Print`**: Auto-filled templates ready for printing (replacing the Word docs).

### 2. Automation Logic (Google Apps Script)

#### Component: Bank Import (`ImportService.gs`)
- **Function**: `processBankFile()`
- **Logic**: Reads the uploaded/pasted Bank Excel data. Filters for relevant transaction types. Auto-matches names to registered church members if a member DB exists.

#### Component: Data Entry & Processing (`EntryService.gs`)
- **Function**: `aggregateData()`
- **Logic**: Combines 'Online' (Bank) and 'Offline' (Manual) data. Categorizes them (General/Special). Appends clean records to `Data_General` and `Data_Special`.

#### Component: Reporting (`ReportService.gs`)
- **Function**: `generateWeeklyReport()`
- **Logic**: Calculates subtotals (Cash, Checks, Online). Fills the `Report_Print` tab.
- **Output**: Can export to PDF or print directly.

## Workflow Optimization
| Current Step | Automated Step |
| :--- | :--- |
| Login & Download Bank Excel | *Still Manual (Security)* - but file is just dropped into Drive/Sheet. |
| Re-type into Word (Deposit Statement) | **Automated**: Script parses Bank Excel & generates Statement. |
| Manual Count & Classification | Manual Count needed, but entry is direct into Sheet Forms. |
| Re-type into Final Excel | **Automated**: Data flows from Input -> Final Report tabs automatically. |
| Calculate Subtotals | **Automated**: Formulas/Pivot Tables handle all math. |

## Verification Plan
### Automated Tests
- Create mock "Bank Export" data to test the parser.
- Verify sums match (Total Input = General Total + Special Total).
