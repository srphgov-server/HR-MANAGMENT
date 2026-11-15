/**
 * ApexHR Suite - Google Apps Script Master API Router
 * 
 * Central HTTP router receiving incoming requests from the HR frontend web application.
 */

function doGet(e) {
    try {
        const action = (e && e.parameter && e.parameter.action) || "ping";

        switch (action) {
            case "ping":
                return createResponse(true, {
                    name: CONFIG.APP_NAME,
                    version: CONFIG.VERSION,
                    status: "ONLINE",
                    serverTime: new Date().toISOString()
                }, "Connected to Google Apps Script HR API");

            case "getDashboardStats":
                return handleGetDashboardStats();

            case "getEmployees":
                return handleGetEmployees(e);

            case "getEmployee":
                return handleGetEmployee({ id: e.parameter.id });

            case "getMasterLists":
                return handleGetMasterLists();

            case "getUsers":
                return handleGetUsers();

            case "getAuditLogs":
                return handleGetAuditLogs();

            case "getSettings":
                return handleGetSettings();

            case "getAttendance":
                return handleGetGenericSheet(CONFIG.SHEETS.ATTENDANCE);

            case "getLeaveRequests":
                return handleGetGenericSheet(CONFIG.SHEETS.LEAVE_REQUESTS);

            case "getLeaveBalances":
                return handleGetGenericSheet(CONFIG.SHEETS.LEAVE_BALANCES);

            case "getJobOpenings":
                return handleGetGenericSheet(CONFIG.SHEETS.JOB_OPENINGS);

            case "getCandidates":
                return handleGetGenericSheet(CONFIG.SHEETS.CANDIDATES);

            case "getPayrollRecords":
                return handleGetGenericSheet(CONFIG.SHEETS.PAYROLL);

            default:
                return createResponse(false, null, "Unrecognized GET action: " + action);
        }
    } catch (error) {
        Logger.log("doGet error: " + error.toString());
        return createResponse(false, null, error.message || error.toString());
    }
}

function doPost(e) {
    try {
        let body = {};
        if (e && e.postData && e.postData.contents) {
            body = JSON.parse(e.postData.contents);
        }

        const action = body.action || "unknown";
        const data = body.data || {};

        switch (action) {
            case "login":
                return handleLogin(data);

            case "createEmployee":
            case "saveEmployee":
                return handleSaveEmployee(data);

            case "updateEmployeePhoto":
                return handleUpdateEmployeePhoto(data);

            case "deleteEmployee":
                return handleDeleteEmployee(data);

            case "saveSubRecord":
                return handleSaveSubRecord(data);

            case "deleteSubRecord":
                return handleDeleteSubRecord(data);

            case "saveMasterListItem":
                return handleSaveMasterListItem(data);

            case "deleteMasterListItem":
                return handleDeleteMasterListItem(data);

            case "saveUser":
                return handleSaveUser(data);

            case "saveSettings":
                return handleSaveSettings(data);

            case "saveAttendance":
                return handleSaveGenericRecord(CONFIG.SHEETS.ATTENDANCE, "AttendanceID", "ATT-", data);

            case "deleteAttendance":
                return handleDeleteGenericRecord(CONFIG.SHEETS.ATTENDANCE, "AttendanceID", data.id);

            case "saveLeaveRequest":
                return handleSaveGenericRecord(CONFIG.SHEETS.LEAVE_REQUESTS, "RequestID", "LEV-", data);

            case "updateLeaveStatus":
                return handleUpdateLeaveStatus(data);

            case "saveLeaveBalance":
                return handleSaveLeaveBalance(data);

            case "saveJobOpening":
                return handleSaveGenericRecord(CONFIG.SHEETS.JOB_OPENINGS, "JobID", "JOB-", data);

            case "deleteJobOpening":
                return handleDeleteGenericRecord(CONFIG.SHEETS.JOB_OPENINGS, "JobID", data.id);

            case "saveCandidate":
                return handleSaveGenericRecord(CONFIG.SHEETS.CANDIDATES, "CandidateID", "CAN-", data);

            case "updateCandidateStage":
                return handleUpdateCandidateStage(data);

            case "deleteCandidate":
                return handleDeleteGenericRecord(CONFIG.SHEETS.CANDIDATES, "CandidateID", data.id);

            case "savePayrollRecord":
                return handleSaveGenericRecord(CONFIG.SHEETS.PAYROLL, "PayrollID", "PAY-", data);

            case "updatePayrollStatus":
                return handleUpdatePayrollStatus(data);

            case "setupDatabase":
                const setupResult = setupDatabase();
                return createResponse(true, setupResult, "Database setup executed successfully");

            default:
                return createResponse(false, null, "Unrecognized POST action: " + action);
        }
    } catch (error) {
        Logger.log("doPost error: " + error.toString());
        return createResponse(false, null, error.message || error.toString());
    }
}

/**
 * Aggregates KPI statistics and charts for dashboard
 */
function handleGetDashboardStats() {
    const empSheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
    const docSheet = getSheet(CONFIG.SHEETS.DOCUMENTS);

    const employees = sheetToObjects(empSheet);
    const documents = sheetToObjects(docSheet);

    const totalEmployees = employees.length;
    let activeEmployees = 0;
    let onProbation = 0;
    let onLeave = 0;

    const byDepartment = {};
    const byGender = {};
    const byType = {};
    const byStatus = {};

    employees.forEach(emp => {
        const status = emp.EmploymentStatusID || emp.Status || "Active";
        if (status === "Active") activeEmployees++;
        if (status === "Probation") onProbation++;
        if (status === "On Leave") onLeave++;

        const dept = emp.DepartmentID || "Unassigned";
        byDepartment[dept] = (byDepartment[dept] || 0) + 1;

        const gender = emp.Gender || "Unspecified";
        byGender[gender] = (byGender[gender] || 0) + 1;

        const type = emp.EmploymentTypeID || "Permanent";
        byType[type] = (byType[type] || 0) + 1;

        byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Process Document Expirations
    const now = new Date();
    const expirations = [];

    documents.forEach(doc => {
        if (doc.ExpiryDate) {
            const expDate = new Date(doc.ExpiryDate);
            const emp = employees.find(e => e.EmployeeID === doc.EmployeeID);
            const diffTime = expDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let expStatus = "Valid";
            if (diffDays < 0) expStatus = "Expired";
            else if (diffDays <= (CONFIG.DEFAULT_EXPIRY_DAYS || 30)) expStatus = "Expiring Soon";

            expirations.push({
                employeeId: doc.EmployeeID,
                employeeName: emp ? (emp.FirstName + " " + emp.LastName) : "Unknown",
                documentName: doc.DocumentName || doc.DocumentTypeID,
                expiryDate: doc.ExpiryDate,
                daysRemaining: diffDays,
                status: expStatus
            });
        }
    });

    expirations.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const stats = {
        kpis: {
            totalEmployees: totalEmployees,
            activeEmployees: activeEmployees,
            newEmployees: Math.min(totalEmployees, 2),
            onProbation: onProbation,
            onLeave: onLeave,
            contractsExpiring: expirations.filter(x => x.status === "Expiring Soon").length,
            documentsExpiring: expirations.filter(x => x.status === "Expiring Soon" || x.status === "Expired").length,
            vacantPositions: 2
        },
        charts: {
            byDepartment: byDepartment,
            byGender: byGender,
            byType: byType,
            byStatus: byStatus,
            joinTrend: {
                "Q1": Math.floor(totalEmployees * 0.25),
                "Q2": Math.floor(totalEmployees * 0.5),
                "Q3": totalEmployees
            }
        },
        upcomingExpirations: expirations
    };

    return createResponse(true, stats, "Dashboard statistics loaded");
}

function handleGetSettings() {
    const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
    const rows = sheetToObjects(sheet);
    const settingsMap = {};
    rows.forEach(r => {
        settingsMap[r.SettingKey] = r.SettingValue;
    });
    return createResponse(true, settingsMap, "Settings loaded");
}

function handleSaveSettings(data) {
    const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    Object.keys(data).forEach(key => {
        const updated = updateObjectInSheet(sheet, "SettingKey", key, {
            SettingValue: data[key],
            UpdatedDate: today
        });
        if (!updated) {
            appendObjectToSheet(sheet, {
                SettingKey: key,
                SettingValue: data[key],
                Description: "System configuration parameter",
                UpdatedDate: today
            });
        }
    });

    return createResponse(true, data, "Settings saved successfully");
}

function handleGetGenericSheet(sheetName) {
    const sheet = getSheet(sheetName);
    const records = sheetToObjects(sheet);
    return createResponse(true, records, sheetName + " loaded successfully");
}

function handleSaveGenericRecord(sheetName, idField, prefix, data) {
    const sheet = getSheet(sheetName);
    if (!data[idField]) {
        data[idField] = generateNextId(sheet, prefix, 6);
        appendObjectToSheet(sheet, data);
    } else {
        updateObjectInSheet(sheet, idField, data[idField], data);
    }
    return createResponse(true, data, "Record saved successfully");
}

function handleDeleteGenericRecord(sheetName, idField, id) {
    const sheet = getSheet(sheetName);
    const deleted = deleteObjectInSheet(sheet, idField, id);
    if (deleted) {
        return createResponse(true, { id: id }, "Record deleted");
    }
    return createResponse(false, null, "Record not found to delete");
}

function handleUpdateLeaveStatus(data) {
    const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const updated = updateObjectInSheet(sheet, "RequestID", data.id, {
        Status: data.status,
        ApprovedBy: data.approver || "Admin",
        ApprovedDate: today,
        Remarks: data.remarks || ""
    });
    return createResponse(updated, { id: data.id, status: data.status }, "Leave status updated");
}

function handleSaveLeaveBalance(data) {
    const sheet = getSheet(CONFIG.SHEETS.LEAVE_BALANCES);
    const updated = updateObjectInSheet(sheet, "EmployeeID", data.EmployeeID, data);
    if (!updated) {
        appendObjectToSheet(sheet, data);
    }
    return createResponse(true, data, "Leave balance updated");
}

function handleUpdateCandidateStage(data) {
    const sheet = getSheet(CONFIG.SHEETS.CANDIDATES);
    const updated = updateObjectInSheet(sheet, "CandidateID", data.id, {
        Stage: data.stage,
        Notes: data.notes || ""
    });
    return createResponse(updated, { id: data.id, stage: data.stage }, "Candidate stage updated");
}

function handleUpdatePayrollStatus(data) {
    const sheet = getSheet(CONFIG.SHEETS.PAYROLL);
    const updated = updateObjectInSheet(sheet, "PayrollID", data.id, {
        PaymentStatus: data.status,
        PaymentDate: data.paymentDate || ""
    });
    return createResponse(updated, { id: data.id, status: data.status }, "Payroll status updated");
}
