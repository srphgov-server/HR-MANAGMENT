/**
 * Google Apps Script - User Management & System Roles
 */

function handleGetUsers() {
    const usersSheet = getSheet(CONFIG.SHEETS.USERS);
    const rolesSheet = getSheet(CONFIG.SHEETS.ROLES);

    const users = sheetToObjects(usersSheet);
    const roles = sheetToObjects(rolesSheet);

    // Strip password hashes before returning
    const safeUsers = users.map(u => {
        const copy = Object.assign({}, u);
        delete copy.PasswordHash;
        return copy;
    });

    return createResponse(true, safeUsers, "Users loaded", { roles: roles });
}

function handleSaveUser(data) {
    if (!data.Username || !data.Email) {
        return createResponse(false, null, "Username and Email are required.");
    }

    const sheet = getSheet(CONFIG.SHEETS.USERS);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    if (!data.UserID) {
        // Verify unique username
        const existing = sheetToObjects(sheet).find(u => String(u.Username).toLowerCase() === String(data.Username).toLowerCase());
        if (existing) {
            return createResponse(false, null, "Username already exists. Please choose a different username.");
        }

        data.UserID = generateNextId(sheet, "USR-", "UserID");
        data.CreatedDate = today;
        data.Status = data.Status || "Active";
        appendObjectToSheet(sheet, data);
        logAuditEntry("ADMIN", "Admin", "CREATE_USER", "Users", data.UserID, "Created user " + data.Username);
    } else {
        data.UpdatedDate = today;
        updateObjectInSheet(sheet, "UserID", data.UserID, data);
        logAuditEntry("ADMIN", "Admin", "UPDATE_USER", "Users", data.UserID, "Updated user " + data.Username);
    }

    delete data.PasswordHash;
    return createResponse(true, data, "User account saved successfully");
}
