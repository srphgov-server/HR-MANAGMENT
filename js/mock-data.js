/**
 * HR Management System - Demo & Sample Dataset
 * 
 * This dataset enables the application to function immediately in preview / demo mode
 * when the Google Apps Script Web App URL has not yet been connected.
 * In production mode, all operations read/write to Google Sheets.
 */

const SAMPLE_DATA = {
    // -------------------------------------------------------------
    // Master Lists / Dynamic Dropdowns
    // -------------------------------------------------------------
    masterLists: [
        // Departments
        { ListID: "LST-001", Category: "Department", ItemCode: "DEP_HR", ItemValue: "Human Resources", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-002", Category: "Department", ItemCode: "DEP_ENG", ItemValue: "Engineering & IT", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-003", Category: "Department", ItemCode: "DEP_FIN", ItemValue: "Finance & Accounting", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-004", Category: "Department", ItemCode: "DEP_OPS", ItemValue: "Operations", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-005", Category: "Department", ItemCode: "DEP_SALES", ItemValue: "Sales & Marketing", DisplayOrder: 5, IsDefault: false, IsActive: true },

        // Positions
        { ListID: "LST-010", Category: "Position", ItemCode: "POS_HRD", ItemValue: "HR Director", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-011", Category: "Position", ItemCode: "POS_HRO", ItemValue: "Senior HR Officer", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-012", Category: "Position", ItemCode: "POS_SWE", ItemValue: "Lead Software Architect", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-013", Category: "Position", ItemCode: "POS_DEV", ItemValue: "Full Stack Developer", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-014", Category: "Position", ItemCode: "POS_ACC", ItemValue: "Chief Financial Officer", DisplayOrder: 5, IsDefault: false, IsActive: true },
        { ListID: "LST-015", Category: "Position", ItemCode: "POS_SAL", ItemValue: "Enterprise Account Executive", DisplayOrder: 6, IsDefault: false, IsActive: true },

        // Employment Types
        { ListID: "LST-020", Category: "EmploymentType", ItemCode: "TYP_PERM", ItemValue: "Permanent", DisplayOrder: 1, IsDefault: true, IsActive: true },
        { ListID: "LST-021", Category: "EmploymentType", ItemCode: "TYP_CONT", ItemValue: "Contract", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-022", Category: "EmploymentType", ItemCode: "TYP_TEMP", ItemValue: "Temporary", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-023", Category: "EmploymentType", ItemCode: "TYP_INT", ItemValue: "Intern", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-024", Category: "EmploymentType", ItemCode: "TYP_CON", ItemValue: "Consultant", DisplayOrder: 5, IsDefault: false, IsActive: true },

        // Employment Status
        { ListID: "LST-030", Category: "EmploymentStatus", ItemCode: "STS_ACT", ItemValue: "Active", DisplayOrder: 1, IsDefault: true, IsActive: true },
        { ListID: "LST-031", Category: "EmploymentStatus", ItemCode: "STS_PRB", ItemValue: "Probation", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-032", Category: "EmploymentStatus", ItemCode: "STS_LEV", ItemValue: "On Leave", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-033", Category: "EmploymentStatus", ItemCode: "STS_RSG", ItemValue: "Resigned", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-034", Category: "EmploymentStatus", ItemCode: "STS_TRM", ItemValue: "Terminated", DisplayOrder: 5, IsDefault: false, IsActive: true },

        // Genders
        { ListID: "LST-040", Category: "Gender", ItemCode: "GEN_M", ItemValue: "Male", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-041", Category: "Gender", ItemCode: "GEN_F", ItemValue: "Female", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-042", Category: "Gender", ItemCode: "GEN_O", ItemValue: "Other", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-043", Category: "Gender", ItemCode: "GEN_X", ItemValue: "Prefer not to say", DisplayOrder: 4, IsDefault: true, IsActive: true },

        // Skill Levels
        { ListID: "LST-050", Category: "SkillLevel", ItemCode: "SKL_BEG", ItemValue: "Beginner", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-051", Category: "SkillLevel", ItemCode: "SKL_INT", ItemValue: "Intermediate", DisplayOrder: 2, IsDefault: true, IsActive: true },
        { ListID: "LST-052", Category: "SkillLevel", ItemCode: "SKL_ADV", ItemValue: "Advanced", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-053", Category: "SkillLevel", ItemCode: "SKL_EXP", ItemValue: "Expert", DisplayOrder: 4, IsDefault: false, IsActive: true },

        // Document Types
        { ListID: "LST-060", Category: "DocumentType", ItemCode: "DOC_PAS", ItemValue: "Passport", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-061", Category: "DocumentType", ItemCode: "DOC_NAT", ItemValue: "National ID Card", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-062", Category: "DocumentType", ItemCode: "DOC_CON", ItemValue: "Employment Contract", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-063", Category: "DocumentType", ItemCode: "DOC_OFR", ItemValue: "Offer Letter", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-064", Category: "DocumentType", ItemCode: "DOC_WRK", ItemValue: "Work Permit / Visa", DisplayOrder: 5, IsDefault: false, IsActive: true },
        { ListID: "LST-065", Category: "DocumentType", ItemCode: "DOC_CER", ItemValue: "Certificates / Degree", DisplayOrder: 6, IsDefault: false, IsActive: true },
        { ListID: "LST-066", Category: "DocumentType", ItemCode: "DOC_OTH", ItemValue: "Other HR Document", DisplayOrder: 7, IsDefault: true, IsActive: true },

        // Training Types
        { ListID: "LST-070", Category: "TrainingType", ItemCode: "TRN_INT", ItemValue: "Internal Training", DisplayOrder: 1, IsDefault: true, IsActive: true },
        { ListID: "LST-071", Category: "TrainingType", ItemCode: "TRN_EXT", ItemValue: "External Workshop", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-072", Category: "TrainingType", ItemCode: "TRN_ONL", ItemValue: "Online Certification", DisplayOrder: 3, IsDefault: false, IsActive: true },

        // Relationships
        { ListID: "LST-080", Category: "Relationship", ItemCode: "REL_SPO", ItemValue: "Spouse", DisplayOrder: 1, IsDefault: false, IsActive: true },
        { ListID: "LST-081", Category: "Relationship", ItemCode: "REL_PAR", ItemValue: "Parent", DisplayOrder: 2, IsDefault: false, IsActive: true },
        { ListID: "LST-082", Category: "Relationship", ItemCode: "REL_CHI", ItemValue: "Child", DisplayOrder: 3, IsDefault: false, IsActive: true },
        { ListID: "LST-083", Category: "Relationship", ItemCode: "REL_SIB", ItemValue: "Sibling", DisplayOrder: 4, IsDefault: false, IsActive: true },
        { ListID: "LST-084", Category: "Relationship", ItemCode: "REL_OTH", ItemValue: "Other Contact", DisplayOrder: 5, IsDefault: true, IsActive: true }
    ],

    // -------------------------------------------------------------
    // Roles & Access Control
    // -------------------------------------------------------------
    roles: [
        { RoleID: "ROL-001", RoleName: "Super Admin", Description: "Unrestricted administrative authority across all modules", Status: "Active" },
        { RoleID: "ROL-002", RoleName: "HR Admin", Description: "Full HR management, employee records, document verification and master lists", Status: "Active" },
        { RoleID: "ROL-003", RoleName: "HR Officer", Description: "Day-to-day employee updates, document logging, and training administration", Status: "Active" },
        { RoleID: "ROL-004", RoleName: "Manager", Description: "Supervise department employees and direct report approvals", Status: "Active" },
        { RoleID: "ROL-005", RoleName: "Employee", Description: "Self-service profile and document viewer", Status: "Active" },
        { RoleID: "ROL-006", RoleName: "Viewer", Description: "Read-only access across standard directories and reports", Status: "Active" }
    ],

    // -------------------------------------------------------------
    // Users
    // Password Hash is SHA-256 for: "admin123" -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
    // -------------------------------------------------------------
    users: [
        {
            UserID: "USR-000001",
            Username: "superadmin",
            Email: "admin@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "Sarah Jenkins (Super Admin)",
            RoleID: "ROL-001",
            EmployeeID: "EMP-000001",
            Status: "Active",
            LastLogin: "2026-09-08 09:30:00",
            CreatedDate: "2026-01-01"
        },
        {
            UserID: "USR-000002",
            Username: "hradmin",
            Email: "hr.admin@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "Marcus Vance (HR Admin)",
            RoleID: "ROL-002",
            EmployeeID: "EMP-000002",
            Status: "Active",
            LastLogin: "2026-09-07 16:45:00",
            CreatedDate: "2026-01-10"
        },
        {
            UserID: "USR-000003",
            Username: "manager",
            Email: "david.kim@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "David Kim (Lead Architect)",
            RoleID: "ROL-004",
            EmployeeID: "EMP-000003",
            Status: "Active",
            LastLogin: "2026-09-06 11:20:00",
            CreatedDate: "2026-02-01"
        },
        {
            UserID: "USR-000004",
            Username: "hrofficer",
            Email: "hr.officer@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "Jessica Wong (HR Officer)",
            RoleID: "ROL-003",
            EmployeeID: "EMP-000002",
            Status: "Active",
            LastLogin: "2026-09-05 14:15:00",
            CreatedDate: "2026-02-15"
        },
        {
            UserID: "USR-000005",
            Username: "employee",
            Email: "emily.watson@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "Emily Watson (UX Designer)",
            RoleID: "ROL-005",
            EmployeeID: "EMP-000004",
            Status: "Active",
            LastLogin: "2026-09-04 10:00:00",
            CreatedDate: "2026-03-01"
        },
        {
            UserID: "USR-000006",
            Username: "viewer",
            Email: "auditor@company.com",
            PasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
            FullName: "Arthur Pendelton (Auditor)",
            RoleID: "ROL-006",
            EmployeeID: "EMP-000005",
            Status: "Active",
            LastLogin: "2026-09-03 15:30:00",
            CreatedDate: "2026-03-10"
        }
    ],

    // -------------------------------------------------------------
    // Core Employees (5 Diverse Samples)
    // -------------------------------------------------------------
    employees: [
        {
            EmployeeID: "EMP-000001",
            EmployeeCode: "CORP-0101",
            FirstName: "Sarah",
            MiddleName: "Louise",
            LastName: "Jenkins",
            PreferredName: "Sarah",
            Gender: "Female",
            DateOfBirth: "1987-04-12",
            Nationality: "American",
            MaritalStatus: "Married",
            PersonalEmail: "sarah.jenkins.personal@example.com",
            WorkEmail: "s.jenkins@company.com",
            Phone: "+1 (555) 234-5678",
            EmergencyContact: "Robert Jenkins",
            EmergencyPhone: "+1 (555) 987-6543",
            Address: "742 Evergreen Terrace, Seattle, WA 98101",
            DepartmentID: "Human Resources",
            PositionID: "HR Director",
            ManagerID: "Self / Executive Board",
            EmploymentTypeID: "Permanent",
            EmploymentStatusID: "Active",
            JoinDate: "2021-03-15",
            ConfirmationDate: "2021-06-15",
            EndDate: "",
            WorkLocation: "Headquarters (Seattle)",
            CostCenter: "CC-HR-001",
            ProbationStatus: "Confirmed",
            EmployeePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
            Status: "Active",
            CreatedDate: "2021-03-15",
            CreatedBy: "SYSTEM",
            UpdatedDate: "2026-08-10",
            UpdatedBy: "superadmin"
        },
        {
            EmployeeID: "EMP-000002",
            EmployeeCode: "CORP-0102",
            FirstName: "Marcus",
            MiddleName: "Alexander",
            LastName: "Vance",
            PreferredName: "Marcus",
            Gender: "Male",
            DateOfBirth: "1992-08-23",
            Nationality: "Canadian",
            MaritalStatus: "Single",
            PersonalEmail: "marcus.vance88@example.com",
            WorkEmail: "m.vance@company.com",
            Phone: "+1 (555) 345-6789",
            EmergencyContact: "Helen Vance",
            EmergencyPhone: "+1 (555) 876-5432",
            Address: "1200 West Georgia St, Vancouver, BC V6E 4R2",
            DepartmentID: "Human Resources",
            PositionID: "Senior HR Officer",
            ManagerID: "Sarah Jenkins",
            EmploymentTypeID: "Permanent",
            EmploymentStatusID: "Active",
            JoinDate: "2023-01-10",
            ConfirmationDate: "2023-04-10",
            EndDate: "",
            WorkLocation: "Headquarters (Seattle)",
            CostCenter: "CC-HR-001",
            ProbationStatus: "Confirmed",
            EmployeePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
            Status: "Active",
            CreatedDate: "2023-01-10",
            CreatedBy: "superadmin",
            UpdatedDate: "2026-07-20",
            UpdatedBy: "superadmin"
        },
        {
            EmployeeID: "EMP-000003",
            EmployeeCode: "CORP-0205",
            FirstName: "David",
            MiddleName: "Chul",
            LastName: "Kim",
            PreferredName: "Dave",
            Gender: "Male",
            DateOfBirth: "1989-11-05",
            Nationality: "South Korean",
            MaritalStatus: "Married",
            PersonalEmail: "davekim.tech@example.com",
            WorkEmail: "d.kim@company.com",
            Phone: "+1 (555) 456-7890",
            EmergencyContact: "Ji-woo Kim",
            EmergencyPhone: "+1 (555) 765-4321",
            Address: "450 106th Ave NE, Bellevue, WA 98004",
            DepartmentID: "Engineering & IT",
            PositionID: "Lead Software Architect",
            ManagerID: "Sarah Jenkins",
            EmploymentTypeID: "Permanent",
            EmploymentStatusID: "Active",
            JoinDate: "2022-05-01",
            ConfirmationDate: "2022-08-01",
            EndDate: "",
            WorkLocation: "Tech Hub (Bellevue)",
            CostCenter: "CC-ENG-101",
            ProbationStatus: "Confirmed",
            EmployeePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
            Status: "Active",
            CreatedDate: "2022-05-01",
            CreatedBy: "superadmin",
            UpdatedDate: "2026-08-01",
            UpdatedBy: "d.kim"
        },
        {
            EmployeeID: "EMP-000004",
            EmployeeCode: "CORP-0210",
            FirstName: "Elena",
            MiddleName: "Sofia",
            LastName: "Rostova",
            PreferredName: "Elena",
            Gender: "Female",
            DateOfBirth: "1995-02-18",
            Nationality: "Spanish",
            MaritalStatus: "Single",
            PersonalEmail: "elena.rostova@example.com",
            WorkEmail: "e.rostova@company.com",
            Phone: "+1 (555) 567-8901",
            EmergencyContact: "Carmen Rostova",
            EmergencyPhone: "+1 (555) 654-3210",
            Address: "88 Pine St, New York, NY 10005",
            DepartmentID: "Engineering & IT",
            PositionID: "Full Stack Developer",
            ManagerID: "David Kim",
            EmploymentTypeID: "Contract",
            EmploymentStatusID: "Probation",
            JoinDate: "2026-07-01",
            ConfirmationDate: "2026-10-01",
            EndDate: "2027-06-30",
            WorkLocation: "Remote (New York)",
            CostCenter: "CC-ENG-102",
            ProbationStatus: "In Progress",
            EmployeePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            Status: "Probation",
            CreatedDate: "2026-07-01",
            CreatedBy: "m.vance",
            UpdatedDate: "2026-07-01",
            UpdatedBy: "m.vance"
        },
        {
            EmployeeID: "EMP-000005",
            EmployeeCode: "CORP-0301",
            FirstName: "Amara",
            MiddleName: "Kofi",
            LastName: "Osei",
            PreferredName: "Amara",
            Gender: "Female",
            DateOfBirth: "1991-09-30",
            Nationality: "Ghanaian",
            MaritalStatus: "Married",
            PersonalEmail: "amara.osei@example.com",
            WorkEmail: "a.osei@company.com",
            Phone: "+1 (555) 678-9012",
            EmergencyContact: "Kwame Osei",
            EmergencyPhone: "+1 (555) 543-2109",
            Address: "300 S Michigan Ave, Chicago, IL 60604",
            DepartmentID: "Finance & Accounting",
            PositionID: "Chief Financial Officer",
            ManagerID: "Self / Board",
            EmploymentTypeID: "Permanent",
            EmploymentStatusID: "Active",
            JoinDate: "2023-09-15",
            ConfirmationDate: "2023-12-15",
            EndDate: "",
            WorkLocation: "Finance Center (Chicago)",
            CostCenter: "CC-FIN-201",
            ProbationStatus: "Confirmed",
            EmployeePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
            Status: "Active",
            CreatedDate: "2023-09-15",
            CreatedBy: "superadmin",
            UpdatedDate: "2026-06-12",
            UpdatedBy: "superadmin"
        }
    ],

    // -------------------------------------------------------------
    // Documents (With various expiry states for alert verification)
    // -------------------------------------------------------------
    documents: [
        {
            DocumentID: "DOC-000001",
            EmployeeID: "EMP-000001",
            DocumentTypeID: "Employment Contract",
            DocumentName: "Executive Employment Agreement",
            DocumentNumber: "EXE-2021-001",
            IssueDate: "2021-03-15",
            ExpiryDate: "2031-03-15",
            FileURL: "https://example.com/docs/sarah-contract.pdf",
            Status: "Valid",
            Remarks: "Permanent executive indefinite tenure",
            UploadedBy: "superadmin",
            UploadedDate: "2021-03-15"
        },
        {
            DocumentID: "DOC-000002",
            EmployeeID: "EMP-000003",
            DocumentTypeID: "Work Permit / Visa",
            DocumentName: "H1B Specialty Visa Authorization",
            DocumentNumber: "EAC-22-901-5412",
            IssueDate: "2023-10-01",
            ExpiryDate: "2026-09-25", // Expiring within 20 days!
            FileURL: "https://example.com/docs/dave-visa.pdf",
            Status: "Expiring Soon",
            Remarks: "Renewal petition submitted to USCIS",
            UploadedBy: "m.vance",
            UploadedDate: "2023-10-02"
        },
        {
            DocumentID: "DOC-000003",
            EmployeeID: "EMP-000004",
            DocumentTypeID: "Work Permit / Visa",
            DocumentName: "Temporary Work Visa Authorization",
            DocumentNumber: "V-9988123-NY",
            IssueDate: "2025-06-01",
            ExpiryDate: "2026-08-31", // Already Expired!
            FileURL: "https://example.com/docs/elena-visa.pdf",
            Status: "Expired",
            Remarks: "Awaiting updated stamp from consulate",
            UploadedBy: "m.vance",
            UploadedDate: "2025-06-05"
        },
        {
            DocumentID: "DOC-000004",
            EmployeeID: "EMP-000002",
            DocumentTypeID: "National ID Card",
            DocumentName: "Canadian Passport Scan",
            DocumentNumber: "ZC-881204",
            IssueDate: "2020-05-12",
            ExpiryDate: "2030-05-12",
            FileURL: "https://example.com/docs/marcus-id.pdf",
            Status: "Valid",
            Remarks: "Verified by HR",
            UploadedBy: "superadmin",
            UploadedDate: "2023-01-11"
        }
    ],

    // -------------------------------------------------------------
    // Skills
    // -------------------------------------------------------------
    skills: [
        { SkillID: "SKL-000001", EmployeeID: "EMP-000001", SkillType: "Strategic Management", SkillName: "Talent Acquisition & Global HR Ops", SkillLevel: "Expert", YearsOfExperience: 14, Certification: "SHRM-SCP", CertificationExpiry: "2028-12-31", Remarks: "Certified Senior Professional in HR", CreatedDate: "2021-03-20" },
        { SkillID: "SKL-000002", EmployeeID: "EMP-000003", SkillType: "Cloud & Systems", SkillName: "Kubernetes & Cloud Microservices", SkillLevel: "Expert", YearsOfExperience: 9, Certification: "CKA (Certified Kubernetes Admin)", CertificationExpiry: "2027-04-15", Remarks: "Core infrastructure designer", CreatedDate: "2022-05-10" },
        { SkillID: "SKL-000003", EmployeeID: "EMP-000003", SkillType: "Programming", SkillName: "Golang & TypeScript", SkillLevel: "Advanced", YearsOfExperience: 8, Certification: "AWS Solutions Architect Pro", CertificationExpiry: "2026-11-20", Remarks: "System architect lead", CreatedDate: "2022-05-10" },
        { SkillID: "SKL-000004", EmployeeID: "EMP-000004", SkillType: "Frontend", SkillName: "React, Vue & Modern CSS", SkillLevel: "Advanced", YearsOfExperience: 5, Certification: "Meta Front-End Professional", CertificationExpiry: "2029-01-01", Remarks: "Design system contributor", CreatedDate: "2026-07-02" },
        { SkillID: "SKL-000005", EmployeeID: "EMP-000005", SkillType: "Finance", SkillName: "Corporate Financial Modeling & GAAP", SkillLevel: "Expert", YearsOfExperience: 12, Certification: "CPA / CFA", CertificationExpiry: "2030-12-31", Remarks: "Audit and forecasting leader", CreatedDate: "2023-09-20" }
    ],

    // -------------------------------------------------------------
    // Work Experience
    // -------------------------------------------------------------
    experience: [
        {
            ExperienceID: "EXP-000001",
            EmployeeID: "EMP-000003",
            Company: "CloudScale Networks Inc.",
            Position: "Senior Distributed Systems Engineer",
            Department: "Infrastructure Platform",
            StartDate: "2018-03-01",
            EndDate: "2022-04-15",
            Responsibilities: "Led migration of 200+ microservices to multi-region cloud cluster.",
            ReasonForLeaving: "Joined company to build next-generation enterprise products.",
            ReferenceContact: "Michael Vance, VP of Tech (+1 555-404-001)",
            Remarks: "Outstanding technical contributor"
        },
        {
            ExperienceID: "EXP-000002",
            EmployeeID: "EMP-000001",
            Company: "Pacific Rim Enterprises",
            Position: "Senior People Operations Manager",
            Department: "Human Capital",
            StartDate: "2014-06-01",
            EndDate: "2021-02-28",
            Responsibilities: "Managed scaling the engineering headcount from 80 to 500 team members.",
            ReasonForLeaving: "Career progression to HR Director.",
            ReferenceContact: "Eleanor Vance, Board Member",
            Remarks: "High impact leadership"
        }
    ],

    // -------------------------------------------------------------
    // Education
    // -------------------------------------------------------------
    education: [
        {
            EducationID: "EDU-000001",
            EmployeeID: "EMP-000003",
            Institution: "University of Washington",
            Qualification: "Master of Science (M.S.)",
            FieldOfStudy: "Computer Science & Engineering",
            StartDate: "2011-09-01",
            EndDate: "2013-06-15",
            GraduationYear: 2013,
            Grade: "3.92 / 4.0",
            Certificate: "M.S. CSE Diploma",
            Remarks: "Focus on Distributed Systems & Algorithms"
        },
        {
            EducationID: "EDU-000002",
            EmployeeID: "EMP-000001",
            Institution: "Columbia University",
            Qualification: "Master of Arts (M.A.)",
            FieldOfStudy: "Organizational Psychology",
            StartDate: "2009-09-01",
            EndDate: "2011-05-20",
            GraduationYear: 2011,
            Grade: "Summa Cum Laude",
            Certificate: "Columbia M.A. Degree",
            Remarks: "Published research on distributed team dynamics"
        }
    ],

    // -------------------------------------------------------------
    // Training & Certifications
    // -------------------------------------------------------------
    training: [
        {
            TrainingID: "TRN-000001",
            EmployeeID: "EMP-000003",
            TrainingName: "Advanced Zero-Trust Cloud Security",
            Provider: "Cloud Security Alliance",
            TrainingType: "Online Certification",
            StartDate: "2025-01-10",
            EndDate: "2025-02-28",
            Certificate: "CERT-CSA-2025-09",
            ExpiryDate: "2028-02-28",
            Status: "Completed",
            Remarks: "Comprehensive credential in IAM and Zero Trust"
        },
        {
            TrainingID: "TRN-000002",
            EmployeeID: "EMP-000002",
            TrainingName: "Global Labor Law Compliance 2026",
            Provider: "Society of Corporate Compliance",
            TrainingType: "External Workshop",
            StartDate: "2026-03-01",
            EndDate: "2026-03-05",
            Certificate: "COMP-2026-881",
            ExpiryDate: "2027-03-05",
            Status: "Completed",
            Remarks: "Annual compliance refresher"
        }
    ],

    // -------------------------------------------------------------
    // Emergency Contacts
    // -------------------------------------------------------------
    contacts: [
        { ContactID: "CNT-000001", EmployeeID: "EMP-000001", ContactName: "Robert Jenkins", Relationship: "Spouse", Phone: "+1 (555) 987-6543", Email: "r.jenkins@example.com", Address: "742 Evergreen Terrace, Seattle, WA", PrimaryContact: "Yes", Remarks: "Call primary first in any emergency" },
        { ContactID: "CNT-000002", EmployeeID: "EMP-000003", ContactName: "Ji-woo Kim", Relationship: "Spouse", Phone: "+1 (555) 765-4321", Email: "jiwoo.kim@example.com", Address: "450 106th Ave NE, Bellevue, WA", PrimaryContact: "Yes", Remarks: "Preferred primary emergency contact" }
    ],

    // -------------------------------------------------------------
    // Family / Dependents
    // -------------------------------------------------------------
    dependents: [
        { DependentID: "DEP-000001", EmployeeID: "EMP-000001", Name: "Lucas Jenkins", Relationship: "Child", DateOfBirth: "2018-09-14", Gender: "Male", Phone: "N/A", Address: "742 Evergreen Terrace, Seattle, WA", Beneficiary: "Yes (50%)", Remarks: "Enrolled in medical health plan" },
        { DependentID: "DEP-000002", EmployeeID: "EMP-000001", Name: "Robert Jenkins", Relationship: "Spouse", DateOfBirth: "1985-11-20", Gender: "Male", Phone: "+1 (555) 987-6543", Address: "742 Evergreen Terrace, Seattle, WA", Beneficiary: "Yes (50%)", Remarks: "Designated primary life insurance beneficiary" }
    ],

    // -------------------------------------------------------------
    // Performance Appraisals
    // -------------------------------------------------------------
    performance: [
        {
            PerformanceID: "PRF-000001",
            EmployeeID: "EMP-000003",
            ReviewPeriod: "FY2025 Annual Review",
            ReviewDate: "2025-12-15",
            Reviewer: "Sarah Jenkins",
            Rating: "Exceptional (5.0 / 5.0)",
            Strengths: "Superb architecture vision, zero downtime migrations, outstanding mentorship of junior developers.",
            ImprovementAreas: "Delegate operational ticket triage to junior team leads.",
            Goals: "Design unified multi-tenant identity microservice for Q3.",
            Comments: "Top tier performer. Recommended for principal compensation tier.",
            Status: "Approved"
        }
    ],

    // -------------------------------------------------------------
    // Career Development
    // -------------------------------------------------------------
    career: [
        {
            CareerID: "CAR-000001",
            EmployeeID: "EMP-000003",
            CareerGoals: "Advance towards VP of Engineering / Chief Technology Officer role.",
            DevelopmentPlan: "Executive leadership training, budgeting masterclass, and board-level briefing sessions.",
            PromotionHistory: "Promoted from Staff Engineer to Lead Software Architect in 2024.",
            JobChanges: "Transitioned from feature team to architecture steering committee.",
            SuccessionPlan: "Identified as primary successor for VP of Tech.",
            NextPosition: "Principal Fellow / VP of Technology",
            Actions: "Enrolled in Executive Leadership cohort commencing Q4 2026.",
            CreatedDate: "2026-01-15"
        }
    ],

    // -------------------------------------------------------------
    // Company Assets
    // -------------------------------------------------------------
    assets: [
        { AssetID: "AST-000001", EmployeeID: "EMP-000003", AssetType: "Laptop", AssetName: "MacBook Pro 16\" M3 Max (64GB RAM)", SerialNumber: "C02XYZ123M3P", IssueDate: "2024-01-10", ReturnDate: "", Condition: "Excellent", Status: "Assigned", Remarks: "Encrypted SSD with MDM" },
        { AssetID: "AST-000002", EmployeeID: "EMP-000003", AssetType: "Security Token", AssetName: "YubiKey 5 NFC Bio", SerialNumber: "YK-9912048", IssueDate: "2022-05-02", ReturnDate: "", Condition: "Good", Status: "Assigned", Remarks: "Primary MFA hardware key" },
        { AssetID: "AST-000003", EmployeeID: "EMP-000001", AssetType: "Laptop", AssetName: "Dell XPS 15 9530 (32GB RAM)", SerialNumber: "DL-881204-XPS", IssueDate: "2023-04-12", ReturnDate: "", Condition: "Excellent", Status: "Assigned", Remarks: "Asset tracked under IT inventory" }
    ],

    // -------------------------------------------------------------
    // HR Confidential Notes (Protected)
    // -------------------------------------------------------------
    notes: [
        {
            NoteID: "NOT-000001",
            EmployeeID: "EMP-000004",
            NoteType: "Probation Milestone",
            Note: "Mid-probation 45-day check-in completed. Elena has exceeded expectations on the UI rebuild task. Manager David Kim recommends early confirmation.",
            CreatedBy: "Marcus Vance (HR Admin)",
            CreatedDate: "2026-08-15 14:20:00",
            Confidential: true
        }
    ],

    // -------------------------------------------------------------
    // System Settings
    // -------------------------------------------------------------
    settings: {
        organizationName: "Apex Corporate Technologies Group",
        organizationLogo: "",
        organizationAddress: "1000 Enterprise Plaza, Suite 400, Seattle, WA 98101",
        defaultCountry: "United States",
        dateFormat: "YYYY-MM-DD",
        currency: "USD ($)",
        timeZone: "America/Los_Angeles (PST)",
        employeeIdFormat: "EMP-000000",
        docExpiryWarningDays: 30,
        sessionTimeoutMins: 60,
        paginationSize: 10
    },

    // -------------------------------------------------------------
    // Audit Trail
    // -------------------------------------------------------------
    auditLogs: [
        { LogID: "LOG-000001", UserID: "USR-000001", UserName: "Sarah Jenkins", Action: "SYSTEM_INIT", Module: "System", RecordID: "SYS", Description: "System initialized with database schema and security policies", Timestamp: "2026-09-08 08:00:00", IPAddress: "127.0.0.1" },
        { LogID: "LOG-000002", UserID: "USR-000001", UserName: "Sarah Jenkins", Action: "LOGIN_SUCCESS", Module: "Auth", RecordID: "USR-000001", Description: "User superadmin logged in successfully", Timestamp: "2026-09-08 09:30:00", IPAddress: "192.168.1.10" }
    ],

    // -------------------------------------------------------------
    // Attendance & Time Tracking
    // -------------------------------------------------------------
    attendance: [
        { AttendanceID: "ATT-000001", EmployeeID: "EMP-000001", Date: "2026-11-15", ClockIn: "08:52", ClockOut: "17:35", TotalHours: 8.7, WorkLocation: "Office HQ", Status: "Present", Remarks: "Architecture review meeting" },
        { AttendanceID: "ATT-000002", EmployeeID: "EMP-000002", Date: "2026-11-15", ClockIn: "08:58", ClockOut: "17:05", TotalHours: 8.1, WorkLocation: "Office HQ", Status: "Present", Remarks: "Onboarding session conducted" },
        { AttendanceID: "ATT-000003", EmployeeID: "EMP-000003", Date: "2026-11-15", ClockIn: "09:35", ClockOut: "18:15", TotalHours: 8.6, WorkLocation: "Office HQ", Status: "Late", Remarks: "Traffic delay on I-5" },
        { AttendanceID: "ATT-000004", EmployeeID: "EMP-000004", Date: "2026-11-15", ClockIn: "08:45", ClockOut: "17:45", TotalHours: 9.0, WorkLocation: "Office HQ", Status: "Present", Remarks: "Q4 financial closing" },
        { AttendanceID: "ATT-000005", EmployeeID: "EMP-000005", Date: "2026-11-15", ClockIn: "09:00", ClockOut: "17:30", TotalHours: 8.5, WorkLocation: "Remote (WFH)", Status: "Work From Home", Remarks: "Approved sprint work from home" },
        { AttendanceID: "ATT-000006", EmployeeID: "EMP-000006", Date: "2026-11-15", ClockIn: "", ClockOut: "", TotalHours: 0, WorkLocation: "Office HQ", Status: "On Leave", Remarks: "Annual leave approved" },

        { AttendanceID: "ATT-000007", EmployeeID: "EMP-000001", Date: "2026-11-14", ClockIn: "08:50", ClockOut: "17:40", TotalHours: 8.8, WorkLocation: "Office HQ", Status: "Present", Remarks: "Regular shift" },
        { AttendanceID: "ATT-000008", EmployeeID: "EMP-000002", Date: "2026-11-14", ClockIn: "09:05", ClockOut: "17:15", TotalHours: 8.1, WorkLocation: "Office HQ", Status: "Late", Remarks: "10 mins late" },
        { AttendanceID: "ATT-000009", EmployeeID: "EMP-000003", Date: "2026-11-14", ClockIn: "08:40", ClockOut: "18:00", TotalHours: 9.3, WorkLocation: "Office HQ", Status: "Present", Remarks: "Client presentation" },
        { AttendanceID: "ATT-000010", EmployeeID: "EMP-000004", Date: "2026-11-14", ClockIn: "08:55", ClockOut: "17:30", TotalHours: 8.5, WorkLocation: "Office HQ", Status: "Present", Remarks: "Regular shift" },
        { AttendanceID: "ATT-000011", EmployeeID: "EMP-000005", Date: "2026-11-14", ClockIn: "08:50", ClockOut: "17:30", TotalHours: 8.6, WorkLocation: "Office HQ", Status: "Present", Remarks: "Regular shift" },
        { AttendanceID: "ATT-000012", EmployeeID: "EMP-000006", Date: "2026-11-14", ClockIn: "08:45", ClockOut: "17:15", TotalHours: 8.5, WorkLocation: "Office HQ", Status: "Present", Remarks: "Regular shift" },

        { AttendanceID: "ATT-000013", EmployeeID: "EMP-000001", Date: "2026-11-13", ClockIn: "08:55", ClockOut: "17:30", TotalHours: 8.5, WorkLocation: "Remote (WFH)", Status: "Work From Home", Remarks: "Remote Friday" },
        { AttendanceID: "ATT-000014", EmployeeID: "EMP-000002", Date: "2026-11-13", ClockIn: "08:45", ClockOut: "17:10", TotalHours: 8.4, WorkLocation: "Office HQ", Status: "Present", Remarks: "Regular shift" },
        { AttendanceID: "ATT-000015", EmployeeID: "EMP-000005", Date: "2026-11-13", ClockIn: "09:00", ClockOut: "13:00", TotalHours: 4.0, WorkLocation: "Office HQ", Status: "Half Day", Remarks: "Medical appointment in afternoon" }
    ],

    // -------------------------------------------------------------
    // Leave Management
    // -------------------------------------------------------------
    leaveBalances: [
        { EmployeeID: "EMP-000001", AnnualEntitled: 20, AnnualTaken: 5, SickEntitled: 12, SickTaken: 2, CasualEntitled: 5, CasualTaken: 1, UnpaidTaken: 0 },
        { EmployeeID: "EMP-000002", AnnualEntitled: 18, AnnualTaken: 4, SickEntitled: 12, SickTaken: 1, CasualEntitled: 5, CasualTaken: 2, UnpaidTaken: 0 },
        { EmployeeID: "EMP-000003", AnnualEntitled: 18, AnnualTaken: 6, SickEntitled: 12, SickTaken: 0, CasualEntitled: 5, CasualTaken: 1, UnpaidTaken: 0 },
        { EmployeeID: "EMP-000004", AnnualEntitled: 25, AnnualTaken: 7, SickEntitled: 12, SickTaken: 1, CasualEntitled: 5, CasualTaken: 0, UnpaidTaken: 0 },
        { EmployeeID: "EMP-000005", AnnualEntitled: 15, AnnualTaken: 3, SickEntitled: 12, SickTaken: 3, CasualEntitled: 5, CasualTaken: 1, UnpaidTaken: 0 },
        { EmployeeID: "EMP-000006", AnnualEntitled: 22, AnnualTaken: 8, SickEntitled: 12, SickTaken: 2, CasualEntitled: 5, CasualTaken: 0, UnpaidTaken: 0 }
    ],

    leaveRequests: [
        {
            RequestID: "LEV-000001",
            EmployeeID: "EMP-000006",
            LeaveType: "Annual Leave",
            StartDate: "2026-11-15",
            EndDate: "2026-11-18",
            TotalDays: 4,
            Reason: "Family vacation trip to Hawaii",
            AppliedDate: "2026-11-01",
            Status: "Approved",
            ApprovedBy: "David Chen (CFO)",
            ApprovedDate: "2026-11-03",
            Remarks: "Approved with handover to Operations Supervisor"
        },
        {
            RequestID: "LEV-000002",
            EmployeeID: "EMP-000005",
            LeaveType: "Sick Leave",
            StartDate: "2026-11-20",
            EndDate: "2026-11-21",
            TotalDays: 2,
            Reason: "Scheduled minor outpatient surgery",
            AppliedDate: "2026-11-14",
            Status: "Pending",
            ApprovedBy: "",
            ApprovedDate: "",
            Remarks: "Doctor note attached"
        },
        {
            RequestID: "LEV-000003",
            EmployeeID: "EMP-000003",
            LeaveType: "Annual Leave",
            StartDate: "2026-12-22",
            EndDate: "2026-12-29",
            TotalDays: 6,
            Reason: "Year-end holiday break",
            AppliedDate: "2026-11-10",
            Status: "Pending",
            ApprovedBy: "",
            ApprovedDate: "",
            Remarks: "Coverage arranged with Enterprise team"
        },
        {
            RequestID: "LEV-000004",
            EmployeeID: "EMP-000001",
            LeaveType: "Casual Leave",
            StartDate: "2026-10-18",
            EndDate: "2026-10-18",
            TotalDays: 1,
            Reason: "Personal business / banking errands",
            AppliedDate: "2026-10-12",
            Status: "Approved",
            ApprovedBy: "David Chen (CFO)",
            ApprovedDate: "2026-10-13",
            Remarks: "One day casual leave approved"
        },
        {
            RequestID: "LEV-000005",
            EmployeeID: "EMP-000002",
            LeaveType: "Annual Leave",
            StartDate: "2026-09-01",
            EndDate: "2026-09-04",
            TotalDays: 4,
            Reason: "Late summer family retreat",
            AppliedDate: "2026-08-20",
            Status: "Approved",
            ApprovedBy: "Sarah Jenkins (Director)",
            ApprovedDate: "2026-08-22",
            Remarks: "All tasks delegated smoothly"
        },
        {
            RequestID: "LEV-000006",
            EmployeeID: "EMP-000004",
            LeaveType: "Casual Leave",
            StartDate: "2026-08-10",
            EndDate: "2026-08-11",
            TotalDays: 2,
            Reason: "Urgent personal family commitment",
            AppliedDate: "2026-08-05",
            Status: "Approved",
            ApprovedBy: "CEO Office",
            ApprovedDate: "2026-08-06",
            Remarks: "Approved"
        }
    ],

    // -------------------------------------------------------------
    // Recruitment & ATS (Applicant Tracking System)
    // -------------------------------------------------------------
    jobOpenings: [
        {
            JobID: "JOB-000001",
            JobTitle: "Senior DevOps & Cloud Architect",
            DepartmentID: "Engineering & IT",
            EmploymentType: "Permanent",
            Positions: 2,
            ApplicantsCount: 6,
            MinExperience: "5+ Years",
            SalaryMin: 120000,
            SalaryMax: 145000,
            ClosingDate: "2026-12-15",
            Status: "Open",
            Description: "Lead our cloud transformation, CI/CD pipeline modernization, Kubernetes infrastructure, and security automation.",
            Requirements: "Kubernetes, Terraform, AWS/GCP, Docker, Python/Go, 5+ years in high-availability systems."
        },
        {
            JobID: "JOB-000002",
            JobTitle: "Talent Acquisition Specialist",
            DepartmentID: "Human Resources",
            EmploymentType: "Permanent",
            Positions: 1,
            ApplicantsCount: 4,
            MinExperience: "3+ Years",
            SalaryMin: 65000,
            SalaryMax: 80000,
            ClosingDate: "2026-11-30",
            Status: "Open",
            Description: "Drive technical and executive sourcing, candidate screening, interview coordination, and employer branding.",
            Requirements: "3+ years technical recruiting experience, LinkedIn Recruiter mastery, ATS workflows."
        },
        {
            JobID: "JOB-000003",
            JobTitle: "Enterprise Account Executive",
            DepartmentID: "Sales & Marketing",
            EmploymentType: "Permanent",
            Positions: 1,
            ApplicantsCount: 5,
            MinExperience: "4+ Years",
            SalaryMin: 90000,
            SalaryMax: 115000,
            ClosingDate: "2026-12-31",
            Status: "Open",
            Description: "Expand enterprise B2B SaaS accounts, conduct product demonstrations, negotiate 6-figure contracts.",
            Requirements: "Track record of quota attainment ($1M+ ARR), strong presentation and consultative selling."
        },
        {
            JobID: "JOB-000004",
            JobTitle: "Financial Analyst & Controller",
            DepartmentID: "Finance & Accounting",
            EmploymentType: "Permanent",
            Positions: 1,
            ApplicantsCount: 3,
            MinExperience: "3+ Years",
            SalaryMin: 75000,
            SalaryMax: 90000,
            ClosingDate: "2026-11-25",
            Status: "In Review",
            Description: "Financial modeling, quarterly forecast variance analysis, OPEX budgeting, and board reporting.",
            Requirements: "CPA or CFA in progress, advanced Excel/SQL, corporate FP&A experience."
        },
        {
            JobID: "JOB-000005",
            JobTitle: "Logistics Operations Coordinator",
            DepartmentID: "Operations",
            EmploymentType: "Contract",
            Positions: 1,
            ApplicantsCount: 2,
            MinExperience: "2+ Years",
            SalaryMin: 55000,
            SalaryMax: 68000,
            ClosingDate: "2026-10-31",
            Status: "Filled",
            Description: "Oversee supply chain fulfillment, warehouse inventory control, and regional carrier compliance.",
            Requirements: "ERP inventory tools, vendor logistics contracts, analytical problem solving."
        }
    ],

    candidates: [
        {
            CandidateID: "CAN-000001",
            JobID: "JOB-000001",
            FullName: "Alexander Sterling",
            Email: "alex.sterling@techmail.io",
            Phone: "+1 (555) 438-9201",
            CurrentRole: "DevOps Engineer at CloudScale",
            ExperienceYears: 6,
            AppliedDate: "2026-11-05",
            Stage: "Interview",
            Rating: 5,
            ResumeURL: "https://example.com/resumes/alexander-sterling.pdf",
            Notes: "Exemplary technical screening. Passed Kubernetes architecture round with high commendations."
        },
        {
            CandidateID: "CAN-000002",
            JobID: "JOB-000001",
            FullName: "Priya Sundaram",
            Email: "priya.sundaram@devhub.net",
            Phone: "+1 (555) 892-4112",
            CurrentRole: "Infrastructure Engineer at SysNet",
            ExperienceYears: 7,
            AppliedDate: "2026-11-07",
            Stage: "Offer",
            Rating: 5,
            ResumeURL: "https://example.com/resumes/priya-sundaram.pdf",
            Notes: "Offer package sent for $138,000 base + equity. Awaiting sign-off by Friday."
        },
        {
            CandidateID: "CAN-000003",
            JobID: "JOB-000001",
            FullName: "Michael Kowalski",
            Email: "m.kowalski@inbox.org",
            Phone: "+1 (555) 312-8874",
            CurrentRole: "Systems Admin at Vertex",
            ExperienceYears: 4,
            AppliedDate: "2026-11-12",
            Stage: "Screening",
            Rating: 4,
            ResumeURL: "https://example.com/resumes/michael-kowalski.pdf",
            Notes: "Good Linux fundamentals, assessing Terraform proficiency next week."
        },
        {
            CandidateID: "CAN-000004",
            JobID: "JOB-000002",
            FullName: "Jessica Martinez",
            Email: "jessica.m@hrpulse.com",
            Phone: "+1 (555) 604-3319",
            CurrentRole: "Technical Recruiter at Apex Staffing",
            ExperienceYears: 4,
            AppliedDate: "2026-11-08",
            Stage: "Interview",
            Rating: 4,
            ResumeURL: "https://example.com/resumes/jessica-martinez.pdf",
            Notes: "Strong cultural alignment, great sourcing strategies for niche tech roles."
        },
        {
            CandidateID: "CAN-000005",
            JobID: "JOB-000002",
            FullName: "Robert Langdon",
            Email: "robert.l@recruitingedge.com",
            Phone: "+1 (555) 778-9902",
            CurrentRole: "HR Coordinator at BioCorp",
            ExperienceYears: 2,
            AppliedDate: "2026-11-14",
            Stage: "Applied",
            Rating: 3,
            ResumeURL: "https://example.com/resumes/robert-langdon.pdf",
            Notes: "New application received, initial resume review pending."
        },
        {
            CandidateID: "CAN-000006",
            JobID: "JOB-000003",
            FullName: "Tanya Brooks",
            Email: "tanya.brooks@salespro.co",
            Phone: "+1 (555) 912-3301",
            CurrentRole: "Senior Account Exec at SaaSGrowth",
            ExperienceYears: 6,
            AppliedDate: "2026-11-02",
            Stage: "Interview",
            Rating: 5,
            ResumeURL: "https://example.com/resumes/tanya-brooks.pdf",
            Notes: "Passed executive panel interview with VP of Sales. Final culture match scheduled."
        },
        {
            CandidateID: "CAN-000007",
            JobID: "JOB-000003",
            FullName: "Derek Zhang",
            Email: "derek.zhang@pipeline.org",
            Phone: "+1 (555) 441-2890",
            CurrentRole: "B2B Sales Representative at TechDirect",
            ExperienceYears: 3,
            AppliedDate: "2026-11-10",
            Stage: "Screening",
            Rating: 3,
            ResumeURL: "https://example.com/resumes/derek-zhang.pdf",
            Notes: "Phone screening scheduled for Wednesday."
        },
        {
            CandidateID: "CAN-000008",
            JobID: "JOB-000004",
            FullName: "Nathalie Dupont",
            Email: "n.dupont@finanalytics.com",
            Phone: "+1 (555) 233-8761",
            CurrentRole: "Senior Financial Analyst at Meridian Group",
            ExperienceYears: 5,
            AppliedDate: "2026-10-28",
            Stage: "Offer",
            Rating: 5,
            ResumeURL: "https://example.com/resumes/nathalie-dupont.pdf",
            Notes: "Offer extended at $86,000 base. Acceptance expected next week."
        },
        {
            CandidateID: "CAN-000009",
            JobID: "JOB-000005",
            FullName: "Carlos Mendez",
            Email: "carlos.m@logistix.com",
            Phone: "+1 (555) 554-1120",
            CurrentRole: "Operations Specialist at NorthWay",
            ExperienceYears: 4,
            AppliedDate: "2026-10-05",
            Stage: "Hired",
            Rating: 5,
            ResumeURL: "https://example.com/resumes/carlos-mendez.pdf",
            Notes: "Successfully hired and onboarded into Operations department!"
        },
        {
            CandidateID: "CAN-000010",
            JobID: "JOB-000001",
            FullName: "Brian Foster",
            Email: "brian.f@freemail.io",
            Phone: "+1 (555) 334-9021",
            CurrentRole: "Junior System Admin",
            ExperienceYears: 1,
            AppliedDate: "2026-11-01",
            Stage: "Rejected",
            Rating: 2,
            ResumeURL: "https://example.com/resumes/brian-foster.pdf",
            Notes: "Experience level did not meet senior architect requirement. Sent friendly encouragement email."
        }
    ],

    // -------------------------------------------------------------
    // Payroll & Compensation
    // -------------------------------------------------------------
    payroll: [
        {
            PayrollID: "PAY-202611-001",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000004",
            BaseSalary: 12500,
            HousingAllowance: 1500,
            TransportAllowance: 600,
            Bonus: 1000,
            GrossSalary: 15600,
            TaxDeduction: 2800,
            PensionDeduction: 936,
            HealthInsurance: 300,
            TotalDeductions: 4036,
            NetSalary: 11564,
            PaymentStatus: "Paid",
            PaymentDate: "2026-11-14",
            BankName: "JPMorgan Chase Bank",
            AccountNumber: "****4829"
        },
        {
            PayrollID: "PAY-202611-002",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000001",
            BaseSalary: 10500,
            HousingAllowance: 1200,
            TransportAllowance: 500,
            Bonus: 800,
            GrossSalary: 13000,
            TaxDeduction: 2250,
            PensionDeduction: 780,
            HealthInsurance: 300,
            TotalDeductions: 3330,
            NetSalary: 9670,
            PaymentStatus: "Paid",
            PaymentDate: "2026-11-14",
            BankName: "Bank of America",
            AccountNumber: "****7104"
        },
        {
            PayrollID: "PAY-202611-003",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000006",
            BaseSalary: 9000,
            HousingAllowance: 1000,
            TransportAllowance: 500,
            Bonus: 0,
            GrossSalary: 10500,
            TaxDeduction: 1800,
            PensionDeduction: 630,
            HealthInsurance: 300,
            TotalDeductions: 2730,
            NetSalary: 7770,
            PaymentStatus: "Paid",
            PaymentDate: "2026-11-14",
            BankName: "Wells Fargo Bank",
            AccountNumber: "****3381"
        },
        {
            PayrollID: "PAY-202611-004",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000003",
            BaseSalary: 7500,
            HousingAllowance: 800,
            TransportAllowance: 400,
            Bonus: 2500,
            GrossSalary: 11200,
            TaxDeduction: 1950,
            PensionDeduction: 672,
            HealthInsurance: 300,
            TotalDeductions: 2922,
            NetSalary: 8278,
            PaymentStatus: "Paid",
            PaymentDate: "2026-11-14",
            BankName: "Citibank N.A.",
            AccountNumber: "****9012"
        },
        {
            PayrollID: "PAY-202611-005",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000002",
            BaseSalary: 6200,
            HousingAllowance: 700,
            TransportAllowance: 350,
            Bonus: 0,
            GrossSalary: 7250,
            TaxDeduction: 1150,
            PensionDeduction: 435,
            HealthInsurance: 250,
            TotalDeductions: 1835,
            NetSalary: 5415,
            PaymentStatus: "Pending",
            PaymentDate: "2026-11-28",
            BankName: "U.S. Bank",
            AccountNumber: "****5520"
        },
        {
            PayrollID: "PAY-202611-006",
            MonthYear: "2026-11",
            EmployeeID: "EMP-000005",
            BaseSalary: 6800,
            HousingAllowance: 750,
            TransportAllowance: 350,
            Bonus: 0,
            GrossSalary: 7900,
            TaxDeduction: 1300,
            PensionDeduction: 474,
            HealthInsurance: 250,
            TotalDeductions: 2024,
            NetSalary: 5876,
            PaymentStatus: "Pending",
            PaymentDate: "2026-11-28",
            BankName: "PNC Bank",
            AccountNumber: "****1844"
        },

        // Previous month (2026-10) records for historical reference & trend
        {
            PayrollID: "PAY-202610-001",
            MonthYear: "2026-10",
            EmployeeID: "EMP-000004",
            BaseSalary: 12500,
            HousingAllowance: 1500,
            TransportAllowance: 600,
            Bonus: 0,
            GrossSalary: 14600,
            TaxDeduction: 2600,
            PensionDeduction: 876,
            HealthInsurance: 300,
            TotalDeductions: 3776,
            NetSalary: 10824,
            PaymentStatus: "Paid",
            PaymentDate: "2026-10-30",
            BankName: "JPMorgan Chase Bank",
            AccountNumber: "****4829"
        },
        {
            PayrollID: "PAY-202610-002",
            MonthYear: "2026-10",
            EmployeeID: "EMP-000001",
            BaseSalary: 10500,
            HousingAllowance: 1200,
            TransportAllowance: 500,
            Bonus: 500,
            GrossSalary: 12700,
            TaxDeduction: 2180,
            PensionDeduction: 762,
            HealthInsurance: 300,
            TotalDeductions: 3242,
            NetSalary: 9458,
            PaymentStatus: "Paid",
            PaymentDate: "2026-10-30",
            BankName: "Bank of America",
            AccountNumber: "****7104"
        }
    ]
};

// Make sample data accessible globally
window.SAMPLE_DATA = SAMPLE_DATA;