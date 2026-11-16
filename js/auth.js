/**
 * HR Management System - Authentication & Authorization (RBAC)
 * 
 * Provides SHA-256 client-side hashing, session lifecycle, and granular role permissions.
 */

const Auth = (function () {
    const SESSION_KEY = "APEX_HR_SESSION";

    // System Feature Modules and Granular Permissions Taxonomy
    const SYSTEM_FEATURES = [
        {
            id: "dashboard",
            name: "Dashboard & Analytics",
            nameKm: "ផ្ទាំងគ្រប់គ្រង និងការវិភាគ",
            icon: "bi-speedometer2",
            description: "High-level organizational KPI cards, department charts, and real-time activity feed",
            descriptionKm: "សូចនាករសំខាន់ៗនៃស្ថាប័ន គំនូសតាងផ្នែក និងព័ត៌មានសកម្មភាពទាន់ពេល",
            permissions: [
                { code: "dashboard.view", name: "View Dashboard Overview", nameKm: "មើលទិដ្ឋភាពទូទៅនៃផ្ទាំងគ្រប់គ្រង" }
            ]
        },
        {
            id: "employees",
            name: "Employee Directory & Core HR",
            nameKm: "បញ្ជីបុគ្គលិក និងធនធានមនុស្សស្នូល",
            icon: "bi-people",
            description: "Master employee profiles, employment statuses, job details, and directory exports",
            descriptionKm: "ប្រវត្តិរូបបុគ្គលិក ស្ថានភាពការងារ ព័ត៌មានលម្អិតការងារ និងការទាញយកទិន្នន័យ",
            permissions: [
                { code: "employee.view", name: "View Employee Directory", nameKm: "មើលបញ្ជីបុគ្គលិក" },
                { code: "employee.create", name: "Create Employee Profiles", nameKm: "បង្កើតប្រវត្តិរូបបុគ្គលិកថ្មី" },
                { code: "employee.edit", name: "Edit Employee Details", nameKm: "កែប្រែព័ត៌មានបុគ្គលិក" },
                { code: "employee.delete", name: "Terminate / Delete Records", nameKm: "បញ្ចប់ការងារ / លុបទិន្នន័យ" },
                { code: "employee.export", name: "Export Directory (CSV/Excel)", nameKm: "ទាញចេញបញ្ជីបុគ្គលិក (CSV/Excel)" },
                { code: "employee.self_view", name: "View Own Profile Only", nameKm: "មើលបានតែប្រវត្តិរូបផ្ទាល់ខ្លួន" },
                { code: "employee.self_edit", name: "Edit Personal Details", nameKm: "កែប្រែព័ត៌មានផ្ទាល់ខ្លួន" }
            ]
        },
        {
            id: "profile_records",
            name: "Employee Sub-Records & Dossiers",
            nameKm: "កំណត់ត្រារង និងឯកសារបុគ្គលិក",
            icon: "bi-folder2-open",
            description: "Granular sub-modules: documents, skills, qualifications, assets, and emergency contacts",
            descriptionKm: "ឯកសារ ជំនាញ បទពិសោធន៍ ការអប់រំ បណ្តុះបណ្តាល ទ្រព្យសម្បត្តិ និងទំនាក់ទំនងបន្ទាន់",
            permissions: [
                { code: "documents.manage", name: "Manage Documents & ID Attachments", nameKm: "គ្រប់គ្រងឯកសារ និងអត្តសញ្ញាណប័ណ្ណ" },
                { code: "skills.manage", name: "Manage Skills & Endorsements", nameKm: "គ្រប់គ្រងជំនាញ និងការវាយតម្លៃ" },
                { code: "experience.manage", name: "Manage Work History & Experience", nameKm: "គ្រប់គ្រងប្រវត្តិការងារពីមុន" },
                { code: "education.manage", name: "Manage Education & Degrees", nameKm: "គ្រប់គ្រងកម្រិតវប្បធម៌ និងសញ្ញាបត្រ" },
                { code: "training.manage", name: "Manage Training & Certifications", nameKm: "គ្រប់គ្រងការបណ្តុះបណ្តាល និងវិញ្ញាបនបត្រ" },
                { code: "contacts.manage", name: "Manage Emergency Contacts", nameKm: "គ្រប់គ្រងទំនាក់ទំនងពេលមានអាសន្ន" },
                { code: "dependents.manage", name: "Manage Family Dependents", nameKm: "គ្រប់គ្រងសមាជិកគ្រួសារក្នុងបន្ទុក" },
                { code: "performance.manage", name: "Manage Reviews & Performance KPIs", nameKm: "គ្រប់គ្រងការវាយតម្លៃសមិទ្ធកម្មការងារ" },
                { code: "career.manage", name: "Manage Career Milestones & Promotions", nameKm: "គ្រប់គ្រងការឡើងតំណែង និងការរីកចម្រើន" },
                { code: "assets.manage", name: "Manage Hardware & Asset Assignments", nameKm: "គ្រប់គ្រងការប្រគល់ទ្រព្យសម្បត្តិ និងឧបករណ៍" },
                { code: "notes.manage", name: "Manage Confidential HR Notes", nameKm: "គ្រប់គ្រងកំណត់ត្រាសម្ងាត់បុគ្គលិក" }
            ]
        },
        {
            id: "attendance",
            name: "Attendance & Time Tracking",
            nameKm: "វត្តមាន និងការកត់ត្រាម៉ោងធ្វើការ",
            icon: "bi-clock-history",
            description: "Daily punch in/out tracking, work hours calculation, and monthly timesheets",
            descriptionKm: "ការកត់ត្រាម៉ោងចូល/ចេញប្រចាំថ្ងៃ ការគណនាម៉ោងធ្វើការ និងតារាងវត្តមានប្រចាំខែ",
            permissions: [
                { code: "attendance.view", name: "View Attendance Records & Daily Logs", nameKm: "មើលកំណត់ត្រាវត្តមាន និងម៉ោងប្រចាំថ្ងៃ" },
                { code: "attendance.manage", name: "Manage, Override & Check-in Attendance", nameKm: "កែប្រែ កត់ត្រាវត្តមានជំនួស និងទាញយកទិន្នន័យ" }
            ]
        },
        {
            id: "leave",
            name: "Leave & Absence Management",
            nameKm: "ការគ្រប់គ្រងការឈប់សម្រាក និងអវត្តមាន",
            icon: "bi-calendar-check",
            description: "Leave application workflow, vacation/sick quotas, and supervisor approval routing",
            descriptionKm: "ដំណើរការស្នើសុំច្បាប់ កូតាសម្រាកប្រចាំឆ្នាំ និងការអនុម័តរបស់ប្រធានផ្នែក",
            permissions: [
                { code: "leave.view", name: "View Leave History & Quota Balances", nameKm: "មើលប្រវត្តិឈប់សម្រាក និងសមតុល្យច្បាប់" },
                { code: "leave.manage", name: "Approve / Reject & Adjust Leave Balances", nameKm: "អនុម័ត / បដិសេធ និងកែសម្រួលកូតាច្បាប់" }
            ]
        },
        {
            id: "recruitment",
            name: "Recruitment & Applicant Tracking (ATS)",
            nameKm: "ការជ្រើសរើសបុគ្គលិក និងតាមដានបេក្ខជន (ATS)",
            icon: "bi-briefcase",
            description: "Open job positions, candidate pipeline stages, interview ratings, and hiring workflow",
            descriptionKm: "ការប្រកាសរើសបុគ្គលិក ដំណាក់កាលបេក្ខជន ការសម្ភាសន៍ និងការសម្រេចចិត្តជ្រើសរើស",
            permissions: [
                { code: "recruitment.view", name: "View Open Vacancies & Candidate Profiles", nameKm: "មើលដំណឹងរើសបុគ្គលិក និងប្រវត្តិរូបបេក្ខជន" },
                { code: "recruitment.manage", name: "Create Jobs, Screen Candidates & Update Pipeline", nameKm: "បង្កើតការងារ ពិនិត្យបេក្ខជន និងផ្លាស់ប្តូរដំណាក់កាល" }
            ]
        },
        {
            id: "payroll",
            name: "Payroll & Compensation Processing",
            nameKm: "បើកប្រាក់បៀវត្សរ៍ និងសំណង",
            icon: "bi-cash-coin",
            description: "Monthly salary computation, allowances, tax/social security deductions, and payslips",
            descriptionKm: "ការគណនាប្រាក់បៀវត្សរ៍ប្រចាំខែ ប្រាក់ឧបត្ថម្ភ ពន្ធកាត់ទុក និងប័ណ្ណបើកប្រាក់",
            permissions: [
                { code: "payroll.view", name: "View Salary Summaries & Personal Payslips", nameKm: "មើលសេចក្តីសង្ខេបប្រាក់បៀវត្សរ៍ និងប័ណ្ណបើកប្រាក់" },
                { code: "payroll.manage", name: "Generate Runs, Process Payroll & Disburse", nameKm: "ដំណើរការបើកប្រាក់ខែ គណនាប្រាក់ និងបញ្ចេញប្រាក់" }
            ]
        },
        {
            id: "reports",
            name: "Reports & Business Intelligence",
            nameKm: "របាយការណ៍ និងការវិភាគទិន្នន័យ",
            icon: "bi-file-earmark-bar-graph",
            description: "Executive demographic reports, attrition stats, turnover metrics, and data exports",
            descriptionKm: "របាយការណ៍ស្ថិតិបុគ្គលិក ស្ថិតិនៃការលាឈប់ និងការទាញចេញជារបាយការណ៍",
            permissions: [
                { code: "reports.view", name: "View Analytical Reports & Summaries", nameKm: "មើលរបាយការណ៍វិភាគ និងតារាងសង្ខេប" },
                { code: "reports.export", name: "Export Reports to PDF / Excel / CSV", nameKm: "ទាញយករបាយការណ៍ជា PDF / Excel / CSV" }
            ]
        },
        {
            id: "lists",
            name: "Master Lists & Metadata Tables",
            nameKm: "បញ្ជីគោល និងទិន្នន័យកំណត់រចនាសម្ព័ន្ធ",
            icon: "bi-card-list",
            description: "Company organization: departments, job titles, office locations, skill taxonomies",
            descriptionKm: "រចនាសម្ព័ន្ធក្រុមហ៊ុន៖ នាយកដ្ឋាន មុខតំណែង ទីតាំងការិយាល័យ និងចំណាត់ថ្នាក់ជំនាញ",
            permissions: [
                { code: "lists.manage", name: "Configure & Edit Organization Master Lists", nameKm: "កំណត់ និងកែប្រែបញ្ជីគោលរបស់ស្ថាប័ន" }
            ]
        },
        {
            id: "security",
            name: "System Security, Users & Auditing",
            nameKm: "សុវត្ថិភាពប្រព័ន្ធ គណនីអ្នកប្រើប្រាស់ និងសវនកម្ម",
            icon: "bi-shield-check",
            description: "User login credentials, role assignments, security logs, and governance audit trails",
            descriptionKm: "គណនីចូលប្រើប្រាស់ កំណត់សិទ្ធិតួនាទី កំណត់ត្រាសុវត្ថិភាព និងការត្រួតពិនិត្យសវនកម្ម",
            permissions: [
                { code: "users.view", name: "View User Accounts & Roles", nameKm: "មើលគណនីអ្នកប្រើប្រាស់ និងតួនាទី" },
                { code: "users.manage", name: "Create, Edit & Reset User Passwords", nameKm: "បង្កើត កែប្រែ និងកំណត់ពាក្យសម្ងាត់អ្នកប្រើឡើងវិញ" },
                { code: "audit.view", name: "View Security Audit Trails & System Logs", nameKm: "មើលកំណត់ត្រាសវនកម្ម និងប្រវត្តិនៃការប្រើប្រាស់" }
            ]
        }
    ];

    // Standard Permissions Matrix with role metadata
    const PERMISSIONS = {
        "ROL-001": { // Super Admin
            name: "Super Admin",
            nameKm: "អភិបាលជាន់ខ្ពស់ (Super Admin)",
            badge: "bg-danger",
            level: "Level 1 - Root System Authority",
            levelKm: "កម្រិត ១ - សិទ្ធិខ្ពស់បំផុតលើប្រព័ន្ធទាំងមូល",
            description: "Unrestricted administrative authority across all modules, system configuration, user accounts, and security audit trails.",
            descriptionKm: "សិទ្ធិអំណាចពេញលេញលើគ្រប់ផ្នែក ម៉ូឌុល ការកំណត់ប្រព័ន្ធ គណនីអ្នកប្រើប្រាស់ និងកំណត់ត្រាសវនកម្ម។",
            permissions: ["*"] // All allowed
        },
        "ROL-002": { // HR Admin
            name: "HR Admin",
            nameKm: "រដ្ឋបាល HR (HR Admin)",
            badge: "bg-primary",
            level: "Level 2 - Operations & People Management",
            levelKm: "កម្រិត ២ - ការគ្រប់គ្រងប្រតិបត្តិការធនធានមនុស្ស",
            description: "Full HR management, employee records, document verification, leave approvals, payroll processing, and user administration.",
            descriptionKm: "គ្រប់គ្រងធនធានមនុស្សពេញលេញ កំណត់ត្រាបុគ្គលិក ឯកសារ ការអនុម័តច្បាប់ ការបើកប្រាក់ខែ និងគណនីអ្នកប្រើ។",
            permissions: [
                "dashboard.view", "employee.view", "employee.create", "employee.edit", "employee.delete",
                "employee.export", "documents.manage", "skills.manage", "experience.manage",
                "education.manage", "training.manage", "contacts.manage", "dependents.manage",
                "performance.manage", "career.manage", "assets.manage", "notes.manage",
                "lists.manage", "reports.view", "reports.export", "audit.view",
                "attendance.view", "attendance.manage",
                "leave.view", "leave.manage",
                "recruitment.view", "recruitment.manage",
                "payroll.view", "payroll.manage",
                "users.view", "users.manage"
            ]
        },
        "ROL-003": { // HR Officer
            name: "HR Officer",
            nameKm: "មន្ត្រី HR (HR Officer)",
            badge: "bg-info text-dark",
            level: "Level 3 - Operational Day-to-Day HR",
            levelKm: "កម្រិត ៣ - ប្រតិបត្តិការប្រចាំថ្ងៃរបស់មន្ត្រី HR",
            description: "Day-to-day employee updates, document logging, attendance and leave processing, recruitment pipeline screening, and view payroll.",
            descriptionKm: "ការកែសម្រួលព័ត៌មានបុគ្គលិកប្រចាំថ្ងៃ កត់ត្រាឯកសារ តាមដានវត្តមាន ច្បាប់សម្រាក និងពិនិត្យបេក្ខជនការងារ។",
            permissions: [
                "dashboard.view", "employee.view", "employee.create", "employee.edit",
                "employee.export", "documents.manage", "skills.manage", "experience.manage",
                "education.manage", "training.manage", "contacts.manage", "dependents.manage",
                "reports.view",
                "attendance.view", "attendance.manage",
                "leave.view", "leave.manage",
                "recruitment.view", "recruitment.manage",
                "payroll.view",
                "users.view"
            ]
        },
        "ROL-004": { // Manager
            name: "Manager",
            nameKm: "ប្រធានផ្នែក / អ្នកគ្រប់គ្រង (Manager)",
            badge: "bg-warning text-dark",
            level: "Level 4 - Team Supervision & Approvals",
            levelKm: "កម្រិត ៤ - ការគ្រប់គ្រងក្រុម និងការអនុម័ត",
            description: "Supervise department employees, perform performance evaluations, approve/reject team leave requests, and view department reports.",
            descriptionKm: "គ្រប់គ្រងបុគ្គលិកក្នុងនាយកដ្ឋាន វាយតម្លៃសមិទ្ធកម្ម អនុម័តច្បាប់សម្រាក និងមើលរបាយការណ៍ក្នុងផ្នែក។",
            permissions: [
                "dashboard.view", "employee.view", "employee.export", "skills.manage",
                "training.manage", "performance.manage", "reports.view",
                "attendance.view", "attendance.manage",
                "leave.view", "leave.manage",
                "recruitment.view"
            ]
        },
        "ROL-005": { // Employee (Self-Service)
            name: "Employee",
            nameKm: "បុគ្គលិកទូទៅ (Employee)",
            badge: "bg-secondary",
            level: "Level 5 - Self-Service Portal",
            levelKm: "កម្រិត ៥ - ច្រកសេវាបុគ្គលិកផ្ទាល់ខ្លួន",
            description: "Self-service access to own profile, check-in attendance, apply for leave, view leave quota balances, and view personal payslips.",
            descriptionKm: "ប្រើប្រាស់ច្រកសេវាផ្ទាល់ខ្លួន មើលប្រវត្តិរូប កត់ត្រាវត្តមាន ស្នើសុំច្បាប់ និងពិនិត្យប័ណ្ណបើកប្រាក់ខែផ្ទាល់ខ្លួន។",
            permissions: [
                "dashboard.view", "employee.self_view", "employee.self_edit",
                "attendance.view", "leave.view", "payroll.view"
            ]
        },
        "ROL-006": { // Viewer
            name: "Viewer",
            nameKm: "អ្នកមើល / សវនករ (Viewer)",
            badge: "bg-light text-dark border",
            level: "Level 6 - Read-Only Oversight",
            levelKm: "កម្រិត ៦ - សិទ្ធិពិនិត្យមើលតែប៉ុណ្ណោះ",
            description: "Read-only access across standard directories, organizational lists, employee records, and executive reports without modification rights.",
            descriptionKm: "សិទ្ធិមើលព័ត៌មានទូទៅ បញ្ជីបុគ្គលិក និងរបាយការណ៍សង្ខេប ដោយគ្មានសិទ្ធិកែប្រែ ឬលុបទិន្នន័យឡើយ។",
            permissions: [
                "dashboard.view", "employee.view", "reports.view",
                "attendance.view", "leave.view", "recruitment.view", "payroll.view"
            ]
        }
    };

    /**
     * Hash string to SHA-256 hexadecimal string
     */
    async function hashPassword(plainText) {
        if (!plainText) return "";
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(plainText);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        } catch (e) {
            console.error("Web Crypto SHA-256 error:", e);
            // Fallback simplistic hashing for environments where subtle is unavailable
            let hash = 0;
            for (let i = 0; i < plainText.length; i++) {
                hash = ((hash << 5) - hash) + plainText.charCodeAt(i);
                hash |= 0;
            }
            return "fallback_" + Math.abs(hash);
        }
    }

    /**
     * Get Current Active Session
     */
    function getSession() {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    function getCurrentUser() {
        const session = getSession();
        return session ? session.user : null;
    }

    function getSessionToken() {
        const session = getSession();
        return session ? session.token : null;
    }

    function isAuthenticated() {
        return !!getCurrentUser();
    }

    /**
     * Authenticate User
     */
    async function login(username, password) {
        const passwordHash = await hashPassword(password);
        const result = await API.call("login", { username, passwordHash }, "POST");

        if (result.success && result.data && result.data.user) {
            const sessionData = {
                user: result.data.user,
                token: result.data.token,
                role: result.data.user.RoleID,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            updateUIForAuth();
            return { success: true, user: result.data.user };
        } else {
            return { success: false, message: result.message || "Invalid credentials" };
        }
    }

    /**
     * Log Out
     */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        updateUIForAuth();
        App.navigateTo("dashboard");
    }

    /**
     * Permission Check
     */
    function hasPermission(permissionCode) {
        const user = getCurrentUser();
        if (!user) return false;

        const roleId = user.RoleID || "ROL-006";
        const roleConfig = PERMISSIONS[roleId];
        if (!roleConfig) return false;

        if (roleConfig.permissions.includes("*")) return true;
        return roleConfig.permissions.includes(permissionCode);
    }

    /**
     * Switch Demo Role (Quick tester feature in UI)
     */
    function switchRole(roleId) {
        const user = getCurrentUser() || {
            UserID: "USR-000001",
            Username: "admin",
            FullName: "Sarah Jenkins",
            Email: "admin@company.com",
            EmployeeID: "EMP-000001"
        };
        const roleName = PERMISSIONS[roleId] ? PERMISSIONS[roleId].name : roleId;
        user.RoleID = roleId;
        user.RoleName = roleName;

        const sessionData = {
            user: user,
            token: "DEMO-SWITCH-" + Date.now(),
            role: roleId,
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        updateUIForAuth();
        App.showToast(`Switched active role to: ${roleName}`, "info");
        App.refreshCurrentView();
    }

    /**
     * Refresh Topbar and Navigation Badges based on Auth State
     */
    function updateUIForAuth() {
        const user = getCurrentUser();
        const userNameEl = document.getElementById("current-user-name");
        const userRoleBadge = document.getElementById("current-user-role");
        const userAvatar = document.getElementById("current-user-avatar");
        const loginBtn = document.getElementById("btn-nav-login");
        const userDropdown = document.getElementById("user-profile-dropdown");

        if (user) {
            if (userNameEl) userNameEl.textContent = user.FullName || user.Username;
            if (userRoleBadge) {
                const rName = (PERMISSIONS[user.RoleID] && PERMISSIONS[user.RoleID].name) || user.RoleID;
                userRoleBadge.textContent = rName;
            }
            if (userAvatar) {
                userAvatar.src = user.Photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
            }
            if (loginBtn) loginBtn.classList.add("d-none");
            if (userDropdown) userDropdown.classList.remove("d-none");
        } else {
            if (userNameEl) userNameEl.textContent = "Guest";
            if (userRoleBadge) userRoleBadge.textContent = "Unauthenticated";
            if (loginBtn) loginBtn.classList.remove("d-none");
            if (userDropdown) userDropdown.classList.add("d-none");
        }

        // Hide/Show sidebar links based on permissions
        applyNavVisibility();
    }

    function applyNavVisibility() {
        const links = document.querySelectorAll("[data-permission]");
        links.forEach((link) => {
            const perm = link.getAttribute("data-permission");
            if (hasPermission(perm)) {
                link.classList.remove("d-none");
            } else {
                link.classList.add("d-none");
            }
        });
    }

    /**
     * Auto initialize default demo session if none exists
     */
    function initDefaultSession() {
        if (!getSession()) {
            // Default to Super Admin for seamless exploration
            const defaultAdmin = {
                UserID: "USR-000001",
                Username: "superadmin",
                FullName: "Sarah Jenkins",
                Email: "admin@company.com",
                RoleID: "ROL-001",
                RoleName: "Super Admin",
                EmployeeID: "EMP-000001",
                Status: "Active"
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                user: defaultAdmin,
                token: "INITIAL-DEMO-TOKEN",
                role: "ROL-001",
                loginTime: new Date().toISOString()
            }));
        }
        updateUIForAuth();
    }

    /**
     * Compute feature permission access level for a specific role and system feature
     */
    function getFeatureStatus(roleId, feature) {
        const roleConfig = PERMISSIONS[roleId];
        if (!roleConfig) {
            return {
                status: "none",
                label: "Restricted",
                labelKm: "គ្មានសិទ្ធិ",
                badgeClass: "bg-secondary-subtle text-secondary",
                icon: "bi-slash-circle",
                grantedCount: 0,
                totalCount: feature.permissions.length,
                permissions: feature.permissions.map(p => ({ ...p, granted: false }))
            };
        }

        const isSuper = roleConfig.permissions.includes("*");
        const permissionsWithStatus = feature.permissions.map(p => ({
            ...p,
            granted: isSuper || roleConfig.permissions.includes(p.code)
        }));

        const grantedCount = permissionsWithStatus.filter(p => p.granted).length;
        const totalCount = feature.permissions.length;

        if (isSuper || grantedCount === totalCount) {
            return {
                status: "full",
                label: "Full Access",
                labelKm: "សិទ្ធិពេញលេញ",
                badgeClass: "bg-success",
                icon: "bi-check-circle-fill",
                grantedCount,
                totalCount,
                permissions: permissionsWithStatus
            };
        }

        if (grantedCount === 0) {
            return {
                status: "none",
                label: "Restricted",
                labelKm: "គ្មានសិទ្ធិ",
                badgeClass: "bg-secondary-subtle text-secondary",
                icon: "bi-slash-circle",
                grantedCount: 0,
                totalCount,
                permissions: permissionsWithStatus
            };
        }

        // Check if self-only
        const hasOnlySelf = permissionsWithStatus.filter(p => p.granted).every(p => p.code.includes(".self_"));
        if (hasOnlySelf) {
            return {
                status: "self",
                label: "Self-Service",
                labelKm: "សេវាផ្ទាល់ខ្លួន",
                badgeClass: "bg-warning text-dark",
                icon: "bi-person-badge",
                grantedCount,
                totalCount,
                permissions: permissionsWithStatus
            };
        }

        // Check if manage/edit or view only
        const hasManage = permissionsWithStatus.filter(p => p.granted).some(p => 
            p.code.endsWith(".manage") || p.code.endsWith(".create") || p.code.endsWith(".edit") || p.code.endsWith(".delete")
        );

        if (hasManage) {
            return {
                status: "manage",
                label: "Operational Manage",
                labelKm: "គ្រប់គ្រងប្រតិបត្តិការ",
                badgeClass: "bg-primary",
                icon: "bi-gear-wide-connected",
                grantedCount,
                totalCount,
                permissions: permissionsWithStatus
            };
        } else {
            return {
                status: "view",
                label: "View Only",
                labelKm: "មើលតែប៉ុណ្ណោះ",
                badgeClass: "bg-info text-dark",
                icon: "bi-eye",
                grantedCount,
                totalCount,
                permissions: permissionsWithStatus
            };
        }
    }

    /**
     * Get feature breakdown for a role across all 10 system features
     */
    function getRoleFeatureMatrix(roleId) {
        return SYSTEM_FEATURES.map(feat => {
            return {
                feature: feat,
                status: getFeatureStatus(roleId, feat)
            };
        });
    }

    /**
     * Get comparative matrix of all features across all 6 roles
     */
    function getAllRolesMatrix() {
        const roleIds = Object.keys(PERMISSIONS);
        return SYSTEM_FEATURES.map(feat => {
            const roleStatuses = {};
            roleIds.forEach(rId => {
                roleStatuses[rId] = getFeatureStatus(rId, feat);
            });
            return {
                feature: feat,
                roles: roleStatuses
            };
        });
    }

    return {
        login,
        logout,
        hashPassword,
        getSession,
        getCurrentUser,
        getSessionToken,
        isAuthenticated,
        hasPermission,
        switchRole,
        updateUIForAuth,
        initDefaultSession,
        getRolesList: () => PERMISSIONS,
        getSystemFeatures: () => SYSTEM_FEATURES,
        getFeatureStatus,
        getRoleFeatureMatrix,
        getAllRolesMatrix
    };
})();

window.Auth = Auth;
