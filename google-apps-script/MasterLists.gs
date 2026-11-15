/**
 * Google Apps Script - Dynamic Master Lists & Dropdown Options
 */

function handleGetMasterLists() {
    const sheet = getSheet(CONFIG.SHEETS.MASTER_LISTS);
    const items = sheetToObjects(sheet);
    return createResponse(true, items, "Master lists loaded");
}

function handleSaveMasterListItem(data) {
    if (!data.Category || !data.ItemValue) {
        return createResponse(false, null, "Category and ItemValue are required.");
    }

    const sheet = getSheet(CONFIG.SHEETS.MASTER_LISTS);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    if (!data.ListID) {
        data.ListID = generateNextId(sheet, "LST-", "ListID");
        data.CreatedDate = today;
        appendObjectToSheet(sheet, data);
        logAuditEntry("ADMIN", "Admin", "CREATE_LIST_OPTION", "MasterLists", data.ListID, "Created option " + data.ItemValue + " in " + data.Category);
    } else {
        updateObjectInSheet(sheet, "ListID", data.ListID, data);
        logAuditEntry("ADMIN", "Admin", "UPDATE_LIST_OPTION", "MasterLists", data.ListID, "Updated option " + data.ItemValue + " in " + data.Category);
    }

    return createResponse(true, data, "Dropdown option saved successfully");
}

function handleDeleteMasterListItem(data) {
    if (!data.id) {
        return createResponse(false, null, "ListID is required.");
    }

    const sheet = getSheet(CONFIG.SHEETS.MASTER_LISTS);
    deleteRowFromSheet(sheet, "ListID", data.id);
    logAuditEntry("ADMIN", "Admin", "DELETE_LIST_OPTION", "MasterLists", data.id, "Deleted dropdown option " + data.id);

    return createResponse(true, null, "Dropdown option deleted successfully");
}
