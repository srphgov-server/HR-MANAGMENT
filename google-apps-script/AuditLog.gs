/**
 * Google Apps Script - Security Audit Logging
 */

function logAuditEntry(userId, userName, action, module, recordId, description) {
    try {
        const sheet = getSheet(CONFIG.SHEETS.AUDIT_LOG);
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        const logId = generateNextId(sheet, "LOG-", "LogID");

        const entry = {
            LogID: logId,
            UserID: userId || "SYSTEM",
            UserName: userName || "System",
            Action: action,
            Module: module,
            RecordID: recordId || "",
            Description: description || "",
            Timestamp: timestamp,
            IPAddress: "GoogleAppsScript"
        };

        appendObjectToSheet(sheet, entry);
    } catch (e) {
        Logger.log("Audit log failed: " + e.message);
    }
}

function handleGetAuditLogs() {
    const sheet = getSheet(CONFIG.SHEETS.AUDIT_LOG);
    const logs = sheetToObjects(sheet);
    // Return last 100 in reverse chronological order
    logs.reverse();
    return createResponse(true, logs.slice(0, 100), "Audit logs retrieved");
}
