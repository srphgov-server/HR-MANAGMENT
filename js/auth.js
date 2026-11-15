/**
 * HR Management System - Authentication & Authorization (RBAC)
 * 
 * Provides SHA-256 client-side hashing, session lifecycle, and granular role permissions.
 */

const Auth = (function () {
    const SESSION_KEY = "APEX_HR_SESSION";

    // Standard Permissions Matrix
    const PERMISSIONS = {
        "ROL-001": { // Super Admin
            name: "Super Admin",
            permissions: ["*"] // All allowed
        },
        "ROL-002": { // HR Admin
            name: "HR Admin",
            permissions: [
                "dashboard.view", "employee.view", "employee.create", "employee.edit", "employee.delete",
                "employee.export", "documents.manage", "skills.manage", "experience.manage",
                "education.manage", "training.manage", "contacts.manage", "dependents.manage",
                "performance.manage", "career.manage", "assets.manage", "notes.manage",
                "lists.manage", "reports.view", "reports.export", "audit.view",
                "attendance.view", "attendance.manage",
                "leave.view", "leave.manage",
                "recruitment.view", "recruitment.manage",
                "payroll.view", "payroll.manage"
            ]
        },
        "ROL-003": { // HR Officer
            name: "HR Officer",
            permissions: [
                "dashboard.view", "employee.view", "employee.create", "employee.edit",
                "employee.export", "documents.manage", "skills.manage", "experience.manage",
                "education.manage", "training.manage", "contacts.manage", "dependents.manage",
                "reports.view",
                "attendance.view", "attendance.manage",
                "leave.view", "leave.manage",
                "recruitment.view", "recruitment.manage",
                "payroll.view"
            ]
        },
        "ROL-004": { // Manager
            name: "Manager",
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
            permissions: [
                "dashboard.view", "employee.self_view", "employee.self_edit",
                "attendance.view", "leave.view", "payroll.view"
            ]
        },
        "ROL-006": { // Viewer
            name: "Viewer",
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
        getRolesList: () => PERMISSIONS
    };
})();

window.Auth = Auth;
