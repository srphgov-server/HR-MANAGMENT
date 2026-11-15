/**
 * Google Apps Script - Database Utility & Helper Functions
 */

function getSpreadsheet() {
    if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "PASTE_GOOGLE_SHEET_ID_HERE") {
        return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    }
    // Fallback if script is directly bound to the sheet container
    return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        throw new Error("Sheet [" + sheetName + "] not found. Please run setupDatabase() first.");
    }
    return sheet;
}

/**
 * Converts a 2D sheet range into an Array of JSON Objects based on header row
 */
function sheetToObjects(sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0];
    const results = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // Check if row has any non-empty cell
        const hasData = row.some(cell => cell !== "" && cell !== null && cell !== undefined);
        if (!hasData) continue;

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            let val = row[j];
            // Format dates cleanly to ISO string
            if (val instanceof Date) {
                val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
            }
            obj[headers[j]] = val;
        }
        results.push(obj);
    }

    return results;
}

/**
 * Appends an object as a new row in a sheet conforming to header order
 */
function appendObjectToSheet(sheet, obj) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => {
        const val = obj[header];
        return val !== undefined ? val : "";
    });
    sheet.appendRow(row);
    return obj;
}

/**
 * Updates an existing row in a sheet matched by its unique ID
 */
function updateObjectInSheet(sheet, idColumn, idValue, updatedFields) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return false;

    const headers = data[0];
    const idColIdx = headers.indexOf(idColumn);
    if (idColIdx === -1) {
        throw new Error("ID column [" + idColumn + "] not found in sheet [" + sheet.getName() + "].");
    }

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIdx]) === String(idValue)) {
            const rowNum = i + 1;
            headers.forEach((header, colIdx) => {
                if (updatedFields[header] !== undefined) {
                    sheet.getRange(rowNum, colIdx + 1).setValue(updatedFields[header]);
                }
            });
            return true;
        }
    }
    return false;
}

/**
 * Deletes a row permanently from a sheet matched by unique ID
 */
function deleteRowFromSheet(sheet, idColumn, idValue) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return false;

    const headers = data[0];
    const idColIdx = headers.indexOf(idColumn);
    if (idColIdx === -1) return false;

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIdx]) === String(idValue)) {
            sheet.deleteRow(i + 1);
            return true;
        }
    }
    return false;
}

/**
 * Generates an auto-incremented surrogate key (e.g. EMP-000006)
 */
function generateNextId(sheet, prefix, idColumn) {
    const data = sheetToObjects(sheet);
    let maxNum = 0;

    data.forEach(item => {
        const idStr = String(item[idColumn] || "");
        if (idStr.startsWith(prefix)) {
            const numPart = parseInt(idStr.replace(prefix, ""), 10);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        }
    });

    const nextNum = maxNum + 1;
    return prefix + Utilities.formatString("%06d", nextNum);
}

/**
 * Generates standard JSON response with CORS headers
 */
function createResponse(success, data, message) {
    const payload = {
        success: !!success,
        data: data !== undefined ? data : null,
        message: message || (success ? "Operation completed successfully" : "Request failed"),
        timestamp: new Date().toISOString()
    };

    return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
}
