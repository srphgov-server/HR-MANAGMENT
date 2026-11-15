/**
 * Google Apps Script - Central Backend Configuration
 * 
 * Instructions:
 * 1. Open your target Google Sheet.
 * 2. Copy the ID from the URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
 * 3. Paste it into SPREADSHEET_ID below.
 */

const CONFIG = {
    // -------------------------------------------------------------
    // PASTE YOUR GOOGLE SPREADSHEET ID HERE:
    // -------------------------------------------------------------
    SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE",

    // System Settings
    APP_NAME: "ApexHR Suite Backend",
    VERSION: "1.0.0",
    DEFAULT_EXPIRY_DAYS: 30,

    // Sheet Name Constants
    SHEETS: {
        USERS: "Users",
        ROLES: "Roles",
        PERMISSIONS: "Permissions",
        EMPLOYEES: "Employees",
        DOCUMENTS: "Documents",
        SKILLS: "Skills",
        EXPERIENCE: "Experience",
        EDUCATION: "Education",
        TRAINING: "Training",
        CONTACTS: "EmergencyContacts",
        DEPENDENTS: "Dependents",
        PERFORMANCE: "Performance",
        CAREER: "CareerDevelopment",
        ASSETS: "Assets",
        NOTES: "Notes",
        ATTENDANCE: "Attendance",
        LEAVE_REQUESTS: "LeaveRequests",
        LEAVE_BALANCES: "LeaveBalances",
        JOB_OPENINGS: "JobOpenings",
        CANDIDATES: "Candidates",
        PAYROLL: "Payroll",
        MASTER_LISTS: "MasterLists",
        SETTINGS: "Settings",
        AUDIT_LOG: "AuditLog"
    }
};
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
/**
 * Google Apps Script - Database Setup & Schema Initialization
 * 
 * Run setupDatabase() once in the Apps Script Editor to automatically generate
 * all 18 sheets, column headers, system roles, default dropdown master data,
 * and optional initial sample records.
 * 
 * Idempotent: Does NOT overwrite existing sheets or data!
 */

function setupDatabase() {
    const ss = getSpreadsheet();
    Logger.log("Starting ApexHR Database Initialization for: " + ss.getName());

    const SCHEMAS = {
        Users: [
            "UserID", "Username", "Email", "PasswordHash", "FullName", "RoleID", "EmployeeID",
            "Status", "LastLogin", "CreatedDate", "UpdatedDate"
        ],
        Roles: [
            "RoleID", "RoleName", "Description", "Status", "CreatedDate"
        ],
        Permissions: [
            "PermissionID", "RoleID", "Module", "Action", "Allowed"
        ],
        Employees: [
            "EmployeeID", "EmployeeCode", "FirstName", "MiddleName", "LastName", "PreferredName",
            "Gender", "DateOfBirth", "Nationality", "MaritalStatus", "PersonalEmail", "WorkEmail",
            "Phone", "EmergencyContact", "EmergencyPhone", "Address", "DepartmentID", "PositionID",
            "ManagerID", "EmploymentTypeID", "EmploymentStatusID", "JoinDate", "ConfirmationDate",
            "EndDate", "WorkLocation", "CostCenter", "ProbationStatus", "EmployeePhoto",
            "Status", "CreatedDate", "CreatedBy", "UpdatedDate", "UpdatedBy"
        ],
        Documents: [
            "DocumentID", "EmployeeID", "DocumentTypeID", "DocumentName", "DocumentNumber",
            "IssueDate", "ExpiryDate", "FileURL", "Status", "Remarks", "UploadedBy", "UploadedDate"
        ],
        Skills: [
            "SkillID", "EmployeeID", "SkillType", "SkillName", "SkillLevel",
            "YearsOfExperience", "Certification", "CertificationExpiry", "Remarks", "CreatedDate"
        ],
        Experience: [
            "ExperienceID", "EmployeeID", "Company", "Position", "Department",
            "StartDate", "EndDate", "Responsibilities", "ReasonForLeaving", "ReferenceContact", "Remarks"
        ],
        Education: [
            "EducationID", "EmployeeID", "Institution", "Qualification", "FieldOfStudy",
            "StartDate", "EndDate", "GraduationYear", "Grade", "Certificate", "Remarks"
        ],
        Training: [
            "TrainingID", "EmployeeID", "TrainingName", "Provider", "TrainingType",
            "StartDate", "EndDate", "Certificate", "ExpiryDate", "Status", "Remarks"
        ],
        EmergencyContacts: [
            "ContactID", "EmployeeID", "ContactName", "Relationship",
            "Phone", "Email", "Address", "PrimaryContact", "Remarks"
        ],
        Dependents: [
            "DependentID", "EmployeeID", "Name", "Relationship",
            "DateOfBirth", "Gender", "Phone", "Address", "Beneficiary", "Remarks"
        ],
        Performance: [
            "PerformanceID", "EmployeeID", "ReviewPeriod", "ReviewDate", "Reviewer",
            "Rating", "Strengths", "ImprovementAreas", "Goals", "Comments", "Status"
        ],
        CareerDevelopment: [
            "CareerID", "EmployeeID", "CareerGoals", "DevelopmentPlan", "PromotionHistory",
            "JobChanges", "SuccessionPlan", "NextPosition", "Actions", "CreatedDate"
        ],
        Assets: [
            "AssetID", "EmployeeID", "AssetType", "AssetName", "SerialNumber",
            "IssueDate", "ReturnDate", "Condition", "Status", "Remarks"
        ],
        Notes: [
            "NoteID", "EmployeeID", "NoteType", "Note", "CreatedBy", "CreatedDate", "Confidential"
        ],
        Attendance: [
            "AttendanceID", "EmployeeID", "Date", "ClockIn", "ClockOut", "TotalHours", "WorkLocation", "Status", "Remarks"
        ],
        LeaveRequests: [
            "RequestID", "EmployeeID", "LeaveType", "StartDate", "EndDate", "TotalDays", "Reason", "AppliedDate", "Status", "ApprovedBy", "ApprovedDate", "Remarks"
        ],
        LeaveBalances: [
            "EmployeeID", "AnnualEntitled", "AnnualTaken", "SickEntitled", "SickTaken", "CasualEntitled", "CasualTaken", "UnpaidTaken"
        ],
        JobOpenings: [
            "JobID", "JobTitle", "DepartmentID", "EmploymentType", "Positions", "ApplicantsCount", "MinExperience", "SalaryMin", "SalaryMax", "ClosingDate", "Status", "Description", "Requirements"
        ],
        Candidates: [
            "CandidateID", "JobID", "FullName", "Email", "Phone", "CurrentRole", "ExperienceYears", "AppliedDate", "Stage", "Rating", "ResumeURL", "Notes"
        ],
        Payroll: [
            "PayrollID", "MonthYear", "EmployeeID", "BaseSalary", "HousingAllowance", "TransportAllowance", "Bonus", "GrossSalary", "TaxDeduction", "PensionDeduction", "HealthInsurance", "TotalDeductions", "NetSalary", "PaymentStatus", "PaymentDate", "BankName", "AccountNumber"
        ],
        MasterLists: [
            "ListID", "Category", "ItemCode", "ItemValue", "DisplayOrder", "IsDefault", "IsActive", "CreatedDate"
        ],
        Settings: [
            "SettingKey", "SettingValue", "Description", "UpdatedDate"
        ],
        AuditLog: [
            "LogID", "UserID", "UserName", "Action", "Module", "RecordID", "Description", "Timestamp", "IPAddress"
        ]
    };

    // 1. Create sheets and headers
    Object.keys(SCHEMAS).forEach(sheetName => {
        let sheet = ss.getSheetByName(sheetName);
        const headers = SCHEMAS[sheetName];

        if (!sheet) {
            sheet = ss.insertSheet(sheetName);
            Logger.log("Created sheet: " + sheetName);
        }

        // Add headers if sheet is newly created or empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(headers);
            // Format header row
            const headerRange = sheet.getRange(1, 1, 1, headers.length);
            headerRange.setFontWeight("bold");
            headerRange.setBackground("#1e293b");
            headerRange.setFontColor("#ffffff");
            sheet.setFrozenRows(1);
        }
    });

    // 2. Seed Essential Roles & Master Lists if empty
    seedInitialMasterData(ss);

    // 3. Seed Sample Employees & Sub-records if empty
    seedSampleRecords(ss);

    Logger.log("ApexHR Database setup completed successfully!");
    return "ApexHR Database initialized with all tables and sample records.";
}

function seedInitialMasterData(ss) {
    const rolesSheet = ss.getSheetByName("Roles");
    if (rolesSheet.getLastRow() <= 1) {
        const roles = [
            ["ROL-001", "Super Admin", "Unrestricted administrative authority across all modules", "Active", "2026-01-01"],
            ["ROL-002", "HR Admin", "Full HR management, employee records, document verification and master lists", "Active", "2026-01-01"],
            ["ROL-003", "HR Officer", "Day-to-day employee updates, document logging, and training administration", "Active", "2026-01-01"],
            ["ROL-004", "Manager", "Supervise department employees and direct report approvals", "Active", "2026-01-01"],
            ["ROL-005", "Employee", "Self-service profile and document viewer", "Active", "2026-01-01"],
            ["ROL-006", "Viewer", "Read-only access across standard directories and reports", "Active", "2026-01-01"]
        ];
        roles.forEach(r => rolesSheet.appendRow(r));
    }

    const usersSheet = ss.getSheetByName("Users");
    if (usersSheet.getLastRow() <= 1) {
        // Password hash for admin123
        const adminHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
        usersSheet.appendRow([
            "USR-000001", "superadmin", "admin@company.com", adminHash,
            "Sarah Jenkins (Super Admin)", "ROL-001", "EMP-000001", "Active",
            "2026-09-08 09:30:00", "2026-01-01", "2026-01-01"
        ]);
    }

    const listsSheet = ss.getSheetByName("MasterLists");
    if (listsSheet.getLastRow() <= 1) {
        const masterItems = [
            ["LST-001", "Department", "DEP_HR", "Human Resources", 1, false, true, "2026-01-01"],
            ["LST-002", "Department", "DEP_ENG", "Engineering & IT", 2, false, true, "2026-01-01"],
            ["LST-003", "Department", "DEP_FIN", "Finance & Accounting", 3, false, true, "2026-01-01"],
            ["LST-004", "Department", "DEP_OPS", "Operations", 4, false, true, "2026-01-01"],
            ["LST-005", "Department", "DEP_SALES", "Sales & Marketing", 5, false, true, "2026-01-01"],
            ["LST-010", "Position", "POS_HRD", "HR Director", 1, false, true, "2026-01-01"],
            ["LST-011", "Position", "POS_HRO", "Senior HR Officer", 2, false, true, "2026-01-01"],
            ["LST-012", "Position", "POS_SWE", "Lead Software Architect", 3, false, true, "2026-01-01"],
            ["LST-013", "Position", "POS_DEV", "Full Stack Developer", 4, false, true, "2026-01-01"],
            ["LST-014", "Position", "POS_ACC", "Chief Financial Officer", 5, false, true, "2026-01-01"],
            ["LST-020", "EmploymentType", "TYP_PERM", "Permanent", 1, true, true, "2026-01-01"],
            ["LST-021", "EmploymentType", "TYP_CONT", "Contract", 2, false, true, "2026-01-01"],
            ["LST-030", "EmploymentStatus", "STS_ACT", "Active", 1, true, true, "2026-01-01"],
            ["LST-031", "EmploymentStatus", "STS_PRB", "Probation", 2, false, true, "2026-01-01"],
            ["LST-032", "EmploymentStatus", "STS_LEV", "On Leave", 3, false, true, "2026-01-01"],
            ["LST-040", "Gender", "GEN_M", "Male", 1, false, true, "2026-01-01"],
            ["LST-041", "Gender", "GEN_F", "Female", 2, false, true, "2026-01-01"],
            ["LST-050", "SkillLevel", "SKL_BEG", "Beginner", 1, false, true, "2026-01-01"],
            ["LST-051", "SkillLevel", "SKL_INT", "Intermediate", 2, true, true, "2026-01-01"],
            ["LST-052", "SkillLevel", "SKL_ADV", "Advanced", 3, false, true, "2026-01-01"],
            ["LST-053", "SkillLevel", "SKL_EXP", "Expert", 4, false, true, "2026-01-01"],
            ["LST-060", "DocumentType", "DOC_PAS", "Passport", 1, false, true, "2026-01-01"],
            ["LST-061", "DocumentType", "DOC_NAT", "National ID Card", 2, false, true, "2026-01-01"],
            ["LST-062", "DocumentType", "DOC_CON", "Employment Contract", 3, false, true, "2026-01-01"],
            ["LST-064", "DocumentType", "DOC_WRK", "Work Permit / Visa", 4, false, true, "2026-01-01"]
        ];
        masterItems.forEach(i => listsSheet.appendRow(i));
    }
}

function seedSampleRecords(ss) {
    const empSheet = ss.getSheetByName("Employees");
    if (empSheet.getLastRow() <= 1) {
        const sampleEmployees = [
            [
                "EMP-000001", "CORP-0101", "Sarah", "Louise", "Jenkins", "Sarah", "Female", "1987-04-12", "American", "Married",
                "sarah.jenkins.personal@example.com", "s.jenkins@company.com", "+1 (555) 234-5678", "Robert Jenkins", "+1 (555) 987-6543",
                "742 Evergreen Terrace, Seattle, WA", "Human Resources", "HR Director", "Executive Board", "Permanent", "Active",
                "2021-03-15", "2021-06-15", "", "Headquarters (Seattle)", "CC-HR-001", "Confirmed",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
                "Active", "2021-03-15", "SYSTEM", "2026-08-10", "superadmin"
            ],
            [
                "EMP-000002", "CORP-0102", "Marcus", "Alexander", "Vance", "Marcus", "Male", "1992-08-23", "Canadian", "Single",
                "marcus.vance88@example.com", "m.vance@company.com", "+1 (555) 345-6789", "Helen Vance", "+1 (555) 876-5432",
                "1200 West Georgia St, Vancouver, BC", "Human Resources", "Senior HR Officer", "Sarah Jenkins", "Permanent", "Active",
                "2023-01-10", "2023-04-10", "", "Headquarters (Seattle)", "CC-HR-001", "Confirmed",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                "Active", "2023-01-10", "superadmin", "2026-07-20", "superadmin"
            ],
            [
                "EMP-000003", "CORP-0205", "David", "Chul", "Kim", "Dave", "Male", "1989-11-05", "South Korean", "Married",
                "davekim.tech@example.com", "d.kim@company.com", "+1 (555) 456-7890", "Ji-woo Kim", "+1 (555) 765-4321",
                "450 106th Ave NE, Bellevue, WA", "Engineering & IT", "Lead Software Architect", "Sarah Jenkins", "Permanent", "Active",
                "2022-05-01", "2022-08-01", "", "Tech Hub (Bellevue)", "CC-ENG-101", "Confirmed",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                "Active", "2022-05-01", "superadmin", "2026-08-01", "superadmin"
            ],
            [
                "EMP-000004", "CORP-0210", "Elena", "Sofia", "Rostova", "Elena", "Female", "1995-02-18", "Spanish", "Single",
                "elena.rostova@example.com", "e.rostova@company.com", "+1 (555) 567-8901", "Carmen Rostova", "+1 (555) 654-3210",
                "88 Pine St, New York, NY", "Engineering & IT", "Full Stack Developer", "David Kim", "Contract", "Probation",
                "2026-07-01", "2026-10-01", "2027-06-30", "Remote (New York)", "CC-ENG-102", "In Progress",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                "Probation", "2026-07-01", "superadmin", "2026-07-01", "superadmin"
            ],
            [
                "EMP-000005", "CORP-0301", "Amara", "Kofi", "Osei", "Amara", "Female", "1991-09-30", "Ghanaian", "Married",
                "amara.osei@example.com", "a.osei@company.com", "+1 (555) 678-9012", "Kwame Osei", "+1 (555) 543-2109",
                "300 S Michigan Ave, Chicago, IL", "Finance & Accounting", "Chief Financial Officer", "Executive Board", "Permanent", "Active",
                "2023-09-15", "2023-12-15", "", "Finance Center (Chicago)", "CC-FIN-201", "Confirmed",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
                "Active", "2023-09-15", "superadmin", "2026-06-12", "superadmin"
            ]
        ];
        sampleEmployees.forEach(e => empSheet.appendRow(e));

        // Sample documents
        const docSheet = ss.getSheetByName("Documents");
        docSheet.appendRow([
            "DOC-000001", "EMP-000003", "Work Permit / Visa", "H1B Specialty Visa Authorization", "EAC-22-901-5412",
            "2023-10-01", "2026-09-25", "https://example.com/visa.pdf", "Expiring Soon", "Renewal submitted", "m.vance", "2023-10-02"
        ]);
        docSheet.appendRow([
            "DOC-000002", "EMP-000004", "Work Permit / Visa", "Temporary Work Visa Authorization", "V-9988123-NY",
            "2025-06-01", "2026-08-31", "https://example.com/visa2.pdf", "Expired", "Awaiting update", "m.vance", "2025-06-05"
        ]);

        // Sample Skills
        const sklSheet = ss.getSheetByName("Skills");
        sklSheet.appendRow(["SKL-000001", "EMP-000003", "Cloud", "Kubernetes & Docker", "Expert", 9, "CKA", "2027-04-15", "Core infra designer", "2022-05-10"]);
        sklSheet.appendRow(["SKL-000002", "EMP-000001", "Strategy", "Global Talent Operations", "Expert", 14, "SHRM-SCP", "2028-12-31", "Senior HR leader", "2021-03-20"]);

        // Sample Audit Log
        const logSheet = ss.getSheetByName("AuditLog");
        logSheet.appendRow(["LOG-000001", "USR-000001", "Sarah Jenkins", "SYSTEM_SETUP", "System", "DATABASE", "Database initialized with setupDatabase()", new Date().toISOString(), "127.0.0.1"]);
    }
}
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