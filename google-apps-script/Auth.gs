/**
 * Google Apps Script - Authentication & Session Validation
 */

function handleLogin(data) {
    if (!data.username || !data.passwordHash) {
        return createResponse(false, null, "Username and password hash are required.");
    }

    const usersSheet = getSheet(CONFIG.SHEETS.USERS);
    const users = sheetToObjects(usersSheet);

    const user = users.find(u => 
        (String(u.Username).toLowerCase() === String(data.username).toLowerCase() ||
         String(u.Email).toLowerCase() === String(data.username).toLowerCase()) &&
        String(u.PasswordHash) === String(data.passwordHash) &&
        u.Status === "Active"
    );

    if (!user) {
        logAuditEntry("ANONYMOUS", "Guest", "LOGIN_FAILED", "Auth", data.username, "Failed login attempt for username: " + data.username);
        return createResponse(false, null, "Invalid credentials or account is inactive.");
    }

    // Update LastLogin timestamp
    const nowTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    updateObjectInSheet(usersSheet, "UserID", user.UserID, { LastLogin: nowTimestamp });

    logAuditEntry(user.UserID, user.FullName || user.Username, "LOGIN_SUCCESS", "Auth", user.UserID, "User logged in successfully");

    // Mask password hash before returning
    delete user.PasswordHash;

    const sessionToken = "GAS_TOKEN_" + Utilities.getUuid();

    return createResponse(true, {
        user: user,
        token: sessionToken
    }, "Authentication successful");
}
