/**
 * Google Apps Script - Employee Core Management
 */

function handleGetEmployees(e) {
    const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const employees = sheetToObjects(sheet);
    return createResponse(true, employees, "Employees loaded successfully");
}

function handleGetEmployee(data) {
    const empId = data.id;
    if (!empId) {
        return createResponse(false, null, "Employee ID is required.");
    }

    const empSheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const employees = sheetToObjects(empSheet);
    const employee = employees.find(e => e.EmployeeID === empId);

    if (!employee) {
        return createResponse(false, null, "Employee [" + empId + "] was not found.");
    }

    // Load related sub-tables by EmployeeID
    const docSheet = getSheet(CONFIG.SHEETS.DOCUMENTS);
    const sklSheet = getSheet(CONFIG.SHEETS.SKILLS);
    const expSheet = getSheet(CONFIG.SHEETS.EXPERIENCE);
    const eduSheet = getSheet(CONFIG.SHEETS.EDUCATION);
    const trnSheet = getSheet(CONFIG.SHEETS.TRAINING);
    const cntSheet = getSheet(CONFIG.SHEETS.CONTACTS);
    const depSheet = getSheet(CONFIG.SHEETS.DEPENDENTS);
    const prfSheet = getSheet(CONFIG.SHEETS.PERFORMANCE);
    const carSheet = getSheet(CONFIG.SHEETS.CAREER);
    const astSheet = getSheet(CONFIG.SHEETS.ASSETS);
    const notSheet = getSheet(CONFIG.SHEETS.NOTES);

    const filterByEmpId = (sheet) => sheetToObjects(sheet).filter(item => item.EmployeeID === empId);

    const fullProfile = {
        employee: employee,
        documents: filterByEmpId(docSheet),
        skills: filterByEmpId(sklSheet),
        experience: filterByEmpId(expSheet),
        education: filterByEmpId(eduSheet),
        training: filterByEmpId(trnSheet),
        contacts: filterByEmpId(cntSheet),
        dependents: filterByEmpId(depSheet),
        performance: filterByEmpId(prfSheet),
        career: filterByEmpId(carSheet),
        assets: filterByEmpId(astSheet),
        notes: filterByEmpId(notSheet)
    };

    return createResponse(true, fullProfile, "Employee profile loaded");
}

function handleSaveEmployee(data) {
    const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    // Backend Validation
    if (!data.FirstName || !data.LastName) {
        return createResponse(false, null, "First and Last Name are required.");
    }
    if (!data.DepartmentID || !data.PositionID) {
        return createResponse(false, null, "Department and Position are required.");
    }
    if (!data.WorkEmail && !data.PersonalEmail) {
        return createResponse(false, null, "At least one valid email address is required.");
    }

    let isNew = false;
    if (!data.EmployeeID) {
        isNew = true;
        data.EmployeeID = generateNextId(sheet, "EMP-", "EmployeeID");
        data.CreatedDate = today;
        data.CreatedBy = "Admin";
        data.Status = data.Status || "Active";
        appendObjectToSheet(sheet, data);
        logAuditEntry("ADMIN", "Admin", "CREATE_EMPLOYEE", "Employees", data.EmployeeID, "Created employee " + data.FirstName + " " + data.LastName);
    } else {
        data.UpdatedDate = today;
        data.UpdatedBy = "Admin";
        const updated = updateObjectInSheet(sheet, "EmployeeID", data.EmployeeID, data);
        if (!updated) {
            return createResponse(false, null, "Could not locate employee to update.");
        }
        logAuditEntry("ADMIN", "Admin", "UPDATE_EMPLOYEE", "Employees", data.EmployeeID, "Updated employee " + data.FirstName + " " + data.LastName);
    }

    return createResponse(true, data, isNew ? "Employee created successfully" : "Employee updated successfully");
}

function handleDeleteEmployee(data) {
    if (!data.id) {
        return createResponse(false, null, "Employee ID is required.");
    }

    const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    if (data.permanent) {
        deleteRowFromSheet(sheet, "EmployeeID", data.id);
        logAuditEntry("ADMIN", "Admin", "PURGE_EMPLOYEE", "Employees", data.id, "Permanently deleted employee record");
        return createResponse(true, null, "Employee record permanently removed.");
    } else {
        // Soft delete / resign
        updateObjectInSheet(sheet, "EmployeeID", data.id, {
            Status: "Resigned",
            EmploymentStatusID: "Resigned",
            UpdatedDate: today,
            UpdatedBy: "Admin"
        });
        logAuditEntry("ADMIN", "Admin", "ARCHIVE_EMPLOYEE", "Employees", data.id, "Archived employee status to Resigned");
        return createResponse(true, null, "Employee marked as Resigned/Archived.");
    }
}

function handleUpdateEmployeePhoto(data) {
    const empId = data.EmployeeID || data.id;
    if (!empId) {
        return createResponse(false, null, "Employee ID is required.");
    }
    const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const photo = data.EmployeePhoto !== undefined ? data.EmployeePhoto : (data.photo !== undefined ? data.photo : "");
    const updated = updateObjectInSheet(sheet, "EmployeeID", empId, {
        EmployeePhoto: photo,
        UpdatedDate: today,
        UpdatedBy: "Admin"
    });
    if (!updated) {
        return createResponse(false, null, "Employee [" + empId + "] was not found.");
    }
    logAuditEntry("ADMIN", "Admin", "UPDATE_PHOTO", "Employees", empId, "Updated profile photo for " + empId);
    return createResponse(true, { EmployeeID: empId, EmployeePhoto: photo }, "Profile photo updated successfully");
}
