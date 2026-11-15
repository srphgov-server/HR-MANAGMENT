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
