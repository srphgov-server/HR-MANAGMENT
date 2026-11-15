/**
 * Google Apps Script - Employee Profile Sub-Record Handlers
 */

function handleSaveSubRecord(payload) {
    const subType = String(payload.subType || "").toLowerCase();
    const record = payload.record;

    if (!subType || !record || !record.EmployeeID) {
        return createResponse(false, null, "subType, record, and EmployeeID are required.");
    }

    const map = {
        documents: { sheetName: CONFIG.SHEETS.DOCUMENTS, idCol: "DocumentID", prefix: "DOC-" },
        skills: { sheetName: CONFIG.SHEETS.SKILLS, idCol: "SkillID", prefix: "SKL-" },
        experience: { sheetName: CONFIG.SHEETS.EXPERIENCE, idCol: "ExperienceID", prefix: "EXP-" },
        education: { sheetName: CONFIG.SHEETS.EDUCATION, idCol: "EducationID", prefix: "EDU-" },
        training: { sheetName: CONFIG.SHEETS.TRAINING, idCol: "TrainingID", prefix: "TRN-" },
        contacts: { sheetName: CONFIG.SHEETS.CONTACTS, idCol: "ContactID", prefix: "CNT-" },
        dependents: { sheetName: CONFIG.SHEETS.DEPENDENTS, idCol: "DependentID", prefix: "DEP-" },
        performance: { sheetName: CONFIG.SHEETS.PERFORMANCE, idCol: "PerformanceID", prefix: "PRF-" },
        career: { sheetName: CONFIG.SHEETS.CAREER, idCol: "CareerID", prefix: "CAR-" },
        assets: { sheetName: CONFIG.SHEETS.ASSETS, idCol: "AssetID", prefix: "AST-" },
        notes: { sheetName: CONFIG.SHEETS.NOTES, idCol: "NoteID", prefix: "NOT-" }
    };

    const target = map[subType];
    if (!target) {
        return createResponse(false, null, "Unsupported sub-record type: " + subType);
    }

    const sheet = getSheet(target.sheetName);
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    if (!record[target.idCol]) {
        record[target.idCol] = generateNextId(sheet, target.prefix, target.idCol);
        record.CreatedDate = today;
        appendObjectToSheet(sheet, record);
        logAuditEntry("ADMIN", "Admin", "ADD_" + subType.toUpperCase(), target.sheetName, record[target.idCol], "Added record for " + record.EmployeeID);
    } else {
        updateObjectInSheet(sheet, target.idCol, record[target.idCol], record);
        logAuditEntry("ADMIN", "Admin", "UPDATE_" + subType.toUpperCase(), target.sheetName, record[target.idCol], "Updated record for " + record.EmployeeID);
    }

    return createResponse(true, record, "Sub-record saved successfully");
}

function handleDeleteSubRecord(payload) {
    const subType = String(payload.subType || "").toLowerCase();
    const id = payload.id;

    if (!subType || !id) {
        return createResponse(false, null, "subType and id are required.");
    }

    const map = {
        documents: { sheetName: CONFIG.SHEETS.DOCUMENTS, idCol: "DocumentID" },
        skills: { sheetName: CONFIG.SHEETS.SKILLS, idCol: "SkillID" },
        experience: { sheetName: CONFIG.SHEETS.EXPERIENCE, idCol: "ExperienceID" },
        education: { sheetName: CONFIG.SHEETS.EDUCATION, idCol: "EducationID" },
        training: { sheetName: CONFIG.SHEETS.TRAINING, idCol: "TrainingID" },
        contacts: { sheetName: CONFIG.SHEETS.CONTACTS, idCol: "ContactID" },
        dependents: { sheetName: CONFIG.SHEETS.DEPENDENTS, idCol: "DependentID" },
        performance: { sheetName: CONFIG.SHEETS.PERFORMANCE, idCol: "PerformanceID" },
        career: { sheetName: CONFIG.SHEETS.CAREER, idCol: "CareerID" },
        assets: { sheetName: CONFIG.SHEETS.ASSETS, idCol: "AssetID" },
        notes: { sheetName: CONFIG.SHEETS.NOTES, idCol: "NoteID" }
    };

    const target = map[subType];
    if (!target) {
        return createResponse(false, null, "Unsupported sub-record type: " + subType);
    }

    const sheet = getSheet(target.sheetName);
    deleteRowFromSheet(sheet, target.idCol, id);
    logAuditEntry("ADMIN", "Admin", "DELETE_" + subType.toUpperCase(), target.sheetName, id, "Deleted record " + id);

    return createResponse(true, null, "Sub-record deleted successfully");
}
