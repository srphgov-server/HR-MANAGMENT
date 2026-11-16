/**
 * HR Management System - User & Access Control Module
 * 
 * Provides administrative management of user logins, interactive authentication portal,
 * and comprehensive role permission details categorized by system features.
 */

const Users = (function () {
    let usersList = [];
    let rolesList = [];
    let activeTab = "accounts"; // "accounts" | "permissions" | "login"
    let selectedRoleId = "ROL-001";
    let permissionViewMode = "inspector"; // "inspector" | "matrix"
    let accountsSearchQuery = "";
    let accountsRoleFilter = "all";
    let accountsStatusFilter = "all";
    let permissionsSearchQuery = "";

    /**
     * Main Render Method for #users View
     */
    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1">
                        <i class="bi bi-shield-lock text-primary me-2"></i>
                        <span data-i18n="users_title">User & Access Management</span>
                    </h3>
                    <p class="text-muted mb-0" data-i18n="users_subtitle">
                        Manage system login accounts, test authentications, and inspect role permission matrices.
                    </p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" id="btn-quick-login-tab">
                        <i class="bi bi-box-arrow-in-right me-1"></i> <span data-i18n="login_portal">Login Portal</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-add-user">
                        <i class="bi bi-person-plus me-1"></i> <span data-i18n="btn_create_user">Create User Account</span>
                    </button>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <ul class="nav nav-pills mb-4 border-bottom pb-3 gap-2" id="users-module-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeTab === 'accounts' ? 'active' : ''} d-flex align-items-center gap-2" 
                            id="tab-btn-accounts" type="button" data-tab="accounts">
                        <i class="bi bi-people-fill"></i>
                        <span data-i18n="tab_user_accounts">User Accounts</span>
                        <span class="badge ${activeTab === 'accounts' ? 'bg-light text-primary' : 'bg-secondary text-white'}" id="badge-users-count">...</span>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeTab === 'permissions' ? 'active' : ''} d-flex align-items-center gap-2" 
                            id="tab-btn-permissions" type="button" data-tab="permissions">
                        <i class="bi bi-shield-check"></i>
                        <span data-i18n="tab_role_permissions">Role Permissions Matrix</span>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeTab === 'login' ? 'active' : ''} d-flex align-items-center gap-2" 
                            id="tab-btn-login" type="button" data-tab="login">
                        <i class="bi bi-key-fill"></i>
                        <span data-i18n="tab_login_portal">Login & Auth Portal</span>
                    </button>
                </li>
            </ul>

            <!-- Dynamic Tab Content -->
            <div id="users-tab-content-area">
                <div class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span data-i18n="loading_user_data">Loading user and access control data...</span>
                </div>
            </div>
        `;

        // Bind top-level buttons
        const addBtn = document.getElementById("btn-add-user");
        if (addBtn) addBtn.onclick = () => openUserModal();

        const quickLoginBtn = document.getElementById("btn-quick-login-tab");
        if (quickLoginBtn) {
            quickLoginBtn.onclick = () => switchTab("login");
        }

        // Bind tab switching
        document.querySelectorAll("#users-module-tabs .nav-link").forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                if (targetTab) switchTab(targetTab);
            });
        });

        await loadData();
        renderActiveTab();
    }

    /**
     * Load Users and Roles from API / Demo Store
     */
    async function loadData() {
        const res = await API.call("getUsers", {}, "GET", true);
        if (res.success) {
            usersList = res.data || [];
            rolesList = res.roles || [
                { RoleID: "ROL-001", RoleName: "Super Admin" },
                { RoleID: "ROL-002", RoleName: "HR Admin" },
                { RoleID: "ROL-003", RoleName: "HR Officer" },
                { RoleID: "ROL-004", RoleName: "Manager" },
                { RoleID: "ROL-005", RoleName: "Employee" },
                { RoleID: "ROL-006", RoleName: "Viewer" }
            ];

            const countBadge = document.getElementById("badge-users-count");
            if (countBadge) countBadge.textContent = usersList.length;
        }
    }

    /**
     * Switch Active Sub-Tab
     */
    function switchTab(tabKey) {
        activeTab = tabKey;
        document.querySelectorAll("#users-module-tabs .nav-link").forEach((btn) => {
            const isMatch = btn.getAttribute("data-tab") === tabKey;
            btn.classList.toggle("active", isMatch);
            const badge = btn.querySelector(".badge");
            if (badge) {
                if (isMatch) {
                    badge.classList.remove("bg-secondary", "text-white");
                    badge.classList.add("bg-light", "text-primary");
                } else {
                    badge.classList.remove("bg-light", "text-primary");
                    badge.classList.add("bg-secondary", "text-white");
                }
            }
        });
        renderActiveTab();
    }

    /**
     * Render the currently active sub-tab view
     */
    function renderActiveTab() {
        const container = document.getElementById("users-tab-content-area");
        if (!container) return;

        if (activeTab === "accounts") {
            renderAccountsTab(container);
        } else if (activeTab === "permissions") {
            renderPermissionsTab(container);
        } else if (activeTab === "login") {
            renderLoginTab(container);
        }

        if (window.I18n && typeof I18n.translateDOM === "function") {
            I18n.translateDOM(container);
        }
    }

    // =========================================================================
    // TAB 1: USER ACCOUNTS (CRUD, Status, Password Reset)
    // =========================================================================

    function renderAccountsTab(container) {
        const totalUsers = usersList.length;
        const activeUsers = usersList.filter(u => u.Status === "Active").length;
        const inactiveUsers = totalUsers - activeUsers;
        const totalRoles = rolesList.length;

        container.innerHTML = `
            <!-- Quick Summary KPI Cards -->
            <div class="row g-3 mb-4">
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 bg-primary-subtle text-primary p-3 me-3">
                                <i class="bi bi-people-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted small mb-1" data-i18n="kpi_total_accounts">Total Accounts</h6>
                                <h4 class="fw-bold mb-0">${totalUsers}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 bg-success-subtle text-success p-3 me-3">
                                <i class="bi bi-person-check-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted small mb-1" data-i18n="kpi_active_accounts">Active Users</h6>
                                <h4 class="fw-bold mb-0 text-success">${activeUsers}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 bg-danger-subtle text-danger p-3 me-3">
                                <i class="bi bi-person-x-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted small mb-1" data-i18n="kpi_inactive_accounts">Inactive / Suspended</h6>
                                <h4 class="fw-bold mb-0 text-danger">${inactiveUsers}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 bg-info-subtle text-info p-3 me-3">
                                <i class="bi bi-shield-lock-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted small mb-1" data-i18n="kpi_system_roles">System Roles</h6>
                                <h4 class="fw-bold mb-0 text-info">${totalRoles}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters & Search Toolbar -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-md-5">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control border-start-0 ps-0" id="users-search-input" 
                                       placeholder="Search user ID, username, display name, email..." value="${escapeHtml(accountsSearchQuery)}">
                                ${accountsSearchQuery ? `<button class="btn btn-outline-secondary" type="button" id="btn-clear-search"><i class="bi bi-x"></i></button>` : ''}
                            </div>
                        </div>
                        <div class="col-sm-6 col-md-3">
                            <select class="form-select form-select-sm" id="users-role-filter">
                                <option value="all">Filter by Role: All Roles</option>
                                ${rolesList.map(r => `<option value="${r.RoleID}" ${accountsRoleFilter === r.RoleID ? 'selected' : ''}>${r.RoleName}</option>`).join("")}
                            </select>
                        </div>
                        <div class="col-sm-6 col-md-2">
                            <select class="form-select form-select-sm" id="users-status-filter">
                                <option value="all" ${accountsStatusFilter === 'all' ? 'selected' : ''}>Status: All</option>
                                <option value="Active" ${accountsStatusFilter === 'Active' ? 'selected' : ''}>Active Only</option>
                                <option value="Inactive" ${accountsStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive Only</option>
                            </select>
                        </div>
                        <div class="col-md-2 text-md-end">
                            <button class="btn btn-outline-secondary btn-sm w-100" id="btn-refresh-users">
                                <i class="bi bi-arrow-clockwise me-1"></i> <span data-i18n="btn_refresh">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Accounts Table -->
            <div class="card border-0 shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3 text-nowrap" data-i18n="th_userid">User ID</th>
                                    <th class="text-nowrap" data-i18n="th_fullname">Full Name & Username</th>
                                    <th class="text-nowrap" data-i18n="th_email">Email Address</th>
                                    <th class="text-nowrap" data-i18n="th_role">Assigned Role</th>
                                    <th class="text-nowrap" data-i18n="th_empid">Linked Employee</th>
                                    <th class="text-nowrap" data-i18n="th_status">Status</th>
                                    <th class="text-nowrap" data-i18n="th_last_login">Last Login</th>
                                    <th class="text-end pe-3 text-nowrap" data-i18n="th_actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind filter event handlers
        const searchInput = document.getElementById("users-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                accountsSearchQuery = e.target.value.trim();
                renderFilteredTable();
            });
        }

        const clearBtn = document.getElementById("btn-clear-search");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                accountsSearchQuery = "";
                renderAccountsTab(container);
            });
        }

        const roleFilter = document.getElementById("users-role-filter");
        if (roleFilter) {
            roleFilter.addEventListener("change", (e) => {
                accountsRoleFilter = e.target.value;
                renderFilteredTable();
            });
        }

        const statusFilter = document.getElementById("users-status-filter");
        if (statusFilter) {
            statusFilter.addEventListener("change", (e) => {
                accountsStatusFilter = e.target.value;
                renderFilteredTable();
            });
        }

        const refreshBtn = document.getElementById("btn-refresh-users");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", async () => {
                await loadData();
                renderAccountsTab(container);
                App.showToast("User list refreshed", "info");
            });
        }

        renderFilteredTable();
    }

    function renderFilteredTable() {
        const tbody = document.getElementById("users-table-body");
        if (!tbody) return;

        let filtered = [...usersList];

        if (accountsSearchQuery) {
            const q = accountsSearchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                (u.UserID && u.UserID.toLowerCase().includes(q)) ||
                (u.Username && u.Username.toLowerCase().includes(q)) ||
                (u.FullName && u.FullName.toLowerCase().includes(q)) ||
                (u.Email && u.Email.toLowerCase().includes(q)) ||
                (u.EmployeeID && u.EmployeeID.toLowerCase().includes(q))
            );
        }

        if (accountsRoleFilter !== "all") {
            filtered = filtered.filter(u => u.RoleID === accountsRoleFilter);
        }

        if (accountsStatusFilter !== "all") {
            filtered = filtered.filter(u => u.Status === accountsStatusFilter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="bi bi-person-x fs-1 text-muted d-block mb-2"></i>
                        <h6 class="text-muted fw-bold">No user accounts found</h6>
                        <p class="text-muted small mb-0">Try changing your search query or role filter.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((u) => {
            const roleObj = rolesList.find((r) => r.RoleID === u.RoleID);
            const roleName = roleObj ? roleObj.RoleName : (u.RoleID || "User");
            const isActive = u.Status === "Active";

            const roleBadges = {
                "ROL-001": "bg-danger",
                "ROL-002": "bg-primary",
                "ROL-003": "bg-info text-dark",
                "ROL-004": "bg-warning text-dark",
                "ROL-005": "bg-secondary",
                "ROL-006": "bg-light text-dark border"
            };
            const roleBadgeClass = roleBadges[u.RoleID] || "bg-secondary";

            return `
                <tr>
                    <td class="ps-3 text-nowrap"><span class="badge bg-light text-dark font-monospace">${escapeHtml(u.UserID)}</span></td>
                    <td class="text-nowrap">
                        <div class="fw-bold">${escapeHtml(u.FullName || u.Username)}</div>
                        <small class="text-muted font-monospace">@${escapeHtml(u.Username)}</small>
                    </td>
                    <td class="text-nowrap"><a href="mailto:${escapeHtml(u.Email)}" class="text-decoration-none">${escapeHtml(u.Email)}</a></td>
                    <td class="text-nowrap"><span class="badge ${roleBadgeClass}">${escapeHtml(roleName)}</span></td>
                    <td class="text-nowrap">
                        ${u.EmployeeID ? `
                            <a href="javascript:void(0)" onclick="App.viewEmployeeProfile('${escapeHtml(u.EmployeeID)}')" class="badge bg-light text-primary border font-monospace text-decoration-none" title="View Profile">
                                <i class="bi bi-link-45deg me-1"></i>${escapeHtml(u.EmployeeID)}
                            </a>
                        ` : '<span class="text-muted small">None</span>'}
                    </td>
                    <td class="text-nowrap">
                        <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">
                            <i class="bi ${isActive ? 'bi-check-circle me-1' : 'bi-x-circle me-1'}"></i>${escapeHtml(u.Status || 'Active')}
                        </span>
                    </td>
                    <td class="text-nowrap"><small class="text-muted">${escapeHtml(u.LastLogin || 'Never')}</small></td>
                    <td class="text-end pe-3 text-nowrap">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" title="Edit User Account" onclick="Users.openUserModal('${escapeHtml(u.UserID)}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-warning" title="Reset Password" onclick="Users.openResetPasswordModal('${escapeHtml(u.UserID)}')">
                                <i class="bi bi-key"></i>
                            </button>
                            <button class="btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}" 
                                    title="${isActive ? 'Deactivate Account' : 'Activate Account'}" 
                                    onclick="Users.toggleStatus('${escapeHtml(u.UserID)}')">
                                <i class="bi ${isActive ? 'bi-person-slash' : 'bi-person-check'}"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // =========================================================================
    // TAB 2: ROLE PERMISSION MATRIX & FEATURE BREAKDOWN
    // =========================================================================

    function renderPermissionsTab(container) {
        const rolesDict = Auth.getRolesList();
        const systemFeatures = Auth.getSystemFeatures();
        const currentRoleInfo = rolesDict[selectedRoleId] || rolesDict["ROL-001"];
        const currentLang = (window.I18n && I18n.getLanguage) ? I18n.getLanguage() : "en";
        const isKm = currentLang === "km";

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h5 class="fw-bold mb-1">
                        <i class="bi bi-shield-shaded text-primary me-2"></i>
                        <span data-i18n="role_permissions_breakdown">Role Permissions Detail by System Feature</span>
                    </h5>
                    <p class="text-muted small mb-0" data-i18n="role_permissions_subtitle">
                        Inspect exact capabilities granted to each organizational role across all 10 core application modules.
                    </p>
                </div>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn ${permissionViewMode === 'inspector' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-perm-inspector">
                        <i class="bi bi-person-lines-fill me-1"></i> <span data-i18n="view_by_role">Role Perspective</span>
                    </button>
                    <button type="button" class="btn ${permissionViewMode === 'matrix' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-perm-matrix">
                        <i class="bi bi-grid-3x3-gap me-1"></i> <span data-i18n="view_matrix_table">Comparative Matrix</span>
                    </button>
                </div>
            </div>

            ${permissionViewMode === 'inspector' ? renderRoleInspectorHtml(rolesDict, currentRoleInfo, isKm) : renderComparativeMatrixHtml(rolesDict, systemFeatures, isKm)}
        `;

        // Bind view toggle buttons
        document.getElementById("btn-perm-inspector").onclick = () => {
            permissionViewMode = "inspector";
            renderPermissionsTab(container);
        };
        document.getElementById("btn-perm-matrix").onclick = () => {
            permissionViewMode = "matrix";
            renderPermissionsTab(container);
        };

        // Bind role selectors in inspector mode
        if (permissionViewMode === "inspector") {
            document.querySelectorAll(".role-perspective-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    selectedRoleId = btn.getAttribute("data-role-id");
                    renderPermissionsTab(container);
                });
            });

            const switchPerspectiveBtn = document.getElementById("btn-test-switch-role");
            if (switchPerspectiveBtn) {
                switchPerspectiveBtn.onclick = () => {
                    Auth.switchRole(selectedRoleId);
                    renderPermissionsTab(container);
                };
            }
        }
    }

    function renderRoleInspectorHtml(rolesDict, currentRoleInfo, isKm) {
        const featureMatrix = Auth.getRoleFeatureMatrix(selectedRoleId);
        const assignedUsersCount = usersList.filter(u => u.RoleID === selectedRoleId).length;

        // Role Selector Pills
        const rolePillsHtml = Object.keys(rolesDict).map(rId => {
            const r = rolesDict[rId];
            const isSelected = rId === selectedRoleId;
            const rName = isKm ? (r.nameKm || r.name) : r.name;
            return `
                <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary fw-bold shadow-sm' : 'btn-outline-secondary'} role-perspective-btn" data-role-id="${rId}">
                    <span class="badge rounded-pill me-1 ${r.badge || 'bg-secondary'}">•</span>
                    ${escapeHtml(rName)}
                </button>
            `;
        }).join("");

        // Feature cards
        const featureCardsHtml = featureMatrix.map(item => {
            const feat = item.feature;
            const st = item.status;
            const featName = isKm ? (feat.nameKm || feat.name) : feat.name;
            const featDesc = isKm ? (feat.descriptionKm || feat.description) : feat.description;
            const statusLabel = isKm ? (st.labelKm || st.label) : st.label;

            const permissionsListHtml = st.permissions.map(p => {
                const pName = isKm ? (p.nameKm || p.name) : p.name;
                return `
                    <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi ${p.granted ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'}"></i>
                            <span class="${p.granted ? 'text-dark fw-medium' : 'text-muted text-decoration-line-through small'}">${escapeHtml(pName)}</span>
                        </div>
                        <span class="badge ${p.granted ? 'bg-light text-dark border' : 'bg-light text-muted border'} font-monospace small" style="font-size: 0.72rem;">${escapeHtml(p.code)}</span>
                    </div>
                `;
            }).join("");

            return `
                <div class="col-lg-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white py-3 border-0 d-flex align-items-start justify-content-between gap-2">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-3 bg-primary-subtle text-primary p-2 fs-5">
                                    <i class="bi ${feat.icon || 'bi-gear'}"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">${escapeHtml(featName)}</h6>
                                    <p class="text-muted small mb-0">${escapeHtml(featDesc)}</p>
                                </div>
                            </div>
                            <span class="badge ${st.badgeClass} text-nowrap px-2 py-1">
                                <i class="bi ${st.icon} me-1"></i>${escapeHtml(statusLabel)}
                            </span>
                        </div>
                        <div class="card-body pt-0 pb-3">
                            <div class="bg-light rounded p-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <small class="text-uppercase fw-bold text-muted" style="font-size: 0.75rem;">Granular Permissions (${st.grantedCount}/${st.totalCount})</small>
                                </div>
                                <div class="permissions-checklist">
                                    ${permissionsListHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        const roleDisplayName = isKm ? (currentRoleInfo.nameKm || currentRoleInfo.name) : currentRoleInfo.name;
        const roleLevel = isKm ? (currentRoleInfo.levelKm || currentRoleInfo.level) : currentRoleInfo.level;
        const roleDesc = isKm ? (currentRoleInfo.descriptionKm || currentRoleInfo.description) : currentRoleInfo.description;

        return `
            <!-- Role Selector Bar -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <span class="small text-uppercase fw-bold text-muted me-2" data-i18n="select_role_inspect">Select Role to Inspect:</span>
                        <div class="d-flex flex-wrap gap-2">
                            ${rolePillsHtml}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Role Metadata Header Card -->
            <div class="card border-0 shadow-sm mb-4 bg-primary-subtle text-primary-emphasis border-start border-4 border-primary">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${currentRoleInfo.badge || 'bg-primary'} px-3 py-1 fs-6">${escapeHtml(roleDisplayName)}</span>
                                <span class="badge bg-white text-dark border font-monospace">${escapeHtml(selectedRoleId)}</span>
                                <span class="badge bg-light text-primary border">${escapeHtml(roleLevel || '')}</span>
                            </div>
                            <p class="mb-2 fs-6 text-dark">${escapeHtml(roleDesc)}</p>
                            <div class="d-flex align-items-center gap-3 text-muted small">
                                <span><i class="bi bi-people me-1"></i><strong>${assignedUsersCount}</strong> registered users with this role</span>
                                <span><i class="bi bi-check2-all me-1"></i><strong>${currentRoleInfo.permissions.includes('*') ? 'All (*)' : currentRoleInfo.permissions.length}</strong> active permissions</span>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-primary btn-sm shadow-sm" id="btn-test-switch-role">
                                <i class="bi bi-person-bounding-box me-1"></i> Switch Active Perspective
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feature Breakdown Grid -->
            <div class="row g-3">
                ${featureCardsHtml}
            </div>
        `;
    }

    function renderComparativeMatrixHtml(rolesDict, systemFeatures, isKm) {
        const matrixData = Auth.getAllRolesMatrix();
        const roleKeys = Object.keys(rolesDict);

        const tableHeadersHtml = roleKeys.map(rId => {
            const r = rolesDict[rId];
            const rName = isKm ? (r.nameKm || r.name) : r.name;
            return `
                <th class="text-center text-nowrap" style="min-width: 140px;">
                    <span class="badge ${r.badge || 'bg-secondary'} d-block mb-1">${escapeHtml(rName)}</span>
                    <small class="text-muted font-monospace">${rId}</small>
                </th>
            `;
        }).join("");

        const tableRowsHtml = matrixData.map((row, idx) => {
            const feat = row.feature;
            const featName = isKm ? (feat.nameKm || feat.name) : feat.name;
            const featDesc = isKm ? (feat.descriptionKm || feat.description) : feat.description;

            const roleCellsHtml = roleKeys.map(rId => {
                const st = row.roles[rId];
                const statusLabel = isKm ? (st.labelKm || st.label) : st.label;
                return `
                    <td class="text-center align-middle">
                        <span class="badge ${st.badgeClass} text-nowrap px-2 py-1 mb-1">
                            <i class="bi ${st.icon} me-1"></i>${escapeHtml(statusLabel)}
                        </span>
                        <div class="small text-muted font-monospace" style="font-size: 0.72rem;">${st.grantedCount}/${st.totalCount}</div>
                    </td>
                `;
            }).join("");

            // Granular permissions accordion row
            const granularRows = feat.permissions.map(p => {
                const pName = isKm ? (p.nameKm || p.name) : p.name;
                const roleChecksHtml = roleKeys.map(rId => {
                    const rConfig = rolesDict[rId];
                    const isGranted = rConfig.permissions.includes("*") || rConfig.permissions.includes(p.code);
                    return `
                        <td class="text-center align-middle">
                            ${isGranted 
                                ? '<i class="bi bi-check-circle-fill text-success fs-6"></i>' 
                                : '<i class="bi bi-dash text-muted"></i>'}
                        </td>
                    `;
                }).join("");

                return `
                    <tr class="table-light bg-light small">
                        <td class="ps-4">
                            <span class="fw-medium text-dark">${escapeHtml(pName)}</span>
                            <span class="badge bg-white text-muted border font-monospace ms-2" style="font-size: 0.7rem;">${escapeHtml(p.code)}</span>
                        </td>
                        ${roleChecksHtml}
                    </tr>
                `;
            }).join("");

            return `
                <tr>
                    <td class="ps-3 align-middle">
                        <div class="d-flex align-items-center gap-2">
                            <div class="rounded bg-light p-2 text-primary">
                                <i class="bi ${feat.icon || 'bi-app'}"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${escapeHtml(featName)}</div>
                                <small class="text-muted">${escapeHtml(featDesc)}</small>
                            </div>
                        </div>
                    </td>
                    ${roleCellsHtml}
                </tr>
                <!-- Sub-details for this feature -->
                ${granularRows}
            `;
        }).join("");

        return `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">System Features vs Roles Access Grid</h6>
                        <small class="text-muted">Direct side-by-side comparison of privileges across all 10 core system modules.</small>
                    </div>
                    <span class="badge bg-light text-dark border">6 Roles × 10 Modules (33 Permissions)</span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3" style="min-width: 280px;">System Feature / Module</th>
                                    ${tableHeadersHtml}
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // TAB 3: LOGIN & AUTHENTICATION PORTAL (Interactive Form & Session Status)
    // =========================================================================

    function renderLoginTab(container) {
        const currentUser = Auth.getCurrentUser();
        const currentSession = Auth.getSession();
        const currentLang = (window.I18n && I18n.getLanguage) ? I18n.getLanguage() : "en";
        const isKm = currentLang === "km";

        container.innerHTML = `
            <div class="row g-4">
                <!-- Left Column: Interactive Login Form -->
                <div class="col-lg-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                                <div class="rounded-3 bg-primary-subtle text-primary p-2">
                                    <i class="bi bi-box-arrow-in-right fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold mb-0" data-i18n="account_signin_title">Account Sign In</h5>
                                    <small class="text-muted" data-i18n="account_signin_subtitle">Sign in to test authentication, session tokens, and role scopes.</small>
                                </div>
                            </div>
                            <span class="badge bg-success-subtle text-success border border-success">
                                <i class="bi bi-shield-lock me-1"></i> SHA-256 Protected
                            </span>
                        </div>
                        <div class="card-body p-4">
                            <!-- Quick Test Preset Buttons -->
                            <div class="mb-4">
                                <label class="form-label small text-uppercase fw-bold text-muted" data-i18n="quick_login_presets">
                                    <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Test Accounts (1-Click Fill):
                                </label>
                                <div class="d-flex flex-wrap gap-2">
                                    <button type="button" class="btn btn-outline-danger btn-sm quick-preset-btn" data-uname="superadmin" data-pwd="admin123">
                                        <i class="bi bi-shield-shaded me-1"></i> Super Admin
                                    </button>
                                    <button type="button" class="btn btn-outline-primary btn-sm quick-preset-btn" data-uname="hradmin" data-pwd="admin123">
                                        <i class="bi bi-person-badge me-1"></i> HR Admin
                                    </button>
                                    <button type="button" class="btn btn-outline-warning btn-sm quick-preset-btn" data-uname="manager" data-pwd="admin123">
                                        <i class="bi bi-people me-1"></i> Manager
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm quick-preset-btn" data-uname="employee" data-pwd="admin123">
                                        <i class="bi bi-person me-1"></i> Employee
                                    </button>
                                    <button type="button" class="btn btn-outline-dark btn-sm quick-preset-btn" data-uname="viewer" data-pwd="admin123">
                                        <i class="bi bi-eye me-1"></i> Viewer
                                    </button>
                                </div>
                            </div>

                            <!-- Alert Box for feedback -->
                            <div id="login-alert-container"></div>

                            <!-- Authentication Form -->
                            <form id="form-user-login" autocomplete="off">
                                <div class="mb-3">
                                    <label class="form-label required fw-medium" data-i18n="login_username_label">Username or Corporate Email</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light"><i class="bi bi-person text-muted"></i></span>
                                        <input type="text" class="form-control" id="login-input-username" 
                                               placeholder="e.g. superadmin or admin@company.com" required>
                                    </div>
                                    <div class="form-text small" data-i18n="login_username_hint">Accepts your system username or registered email address.</div>
                                </div>

                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <label class="form-label required fw-medium mb-0" data-i18n="login_password_label">Password</label>
                                        <a href="javascript:void(0)" id="btn-quick-fill-default-pwd" class="small text-decoration-none">
                                            <i class="bi bi-magic me-1"></i> Use default (admin123)
                                        </a>
                                    </div>
                                    <div class="input-group mt-1">
                                        <span class="input-group-text bg-light"><i class="bi bi-lock text-muted"></i></span>
                                        <input type="password" class="form-control" id="login-input-password" 
                                               placeholder="Enter password" required>
                                        <button class="btn btn-outline-secondary" type="button" id="btn-toggle-pwd-visibility" title="Show / Hide Password">
                                            <i class="bi bi-eye" id="icon-pwd-eye"></i>
                                        </button>
                                    </div>
                                    <div class="form-text small" data-i18n="login_password_hint">Client-side SHA-256 hashed before transmission.</div>
                                </div>

                                <div class="mb-4 form-check">
                                    <input type="checkbox" class="form-check-input" id="login-remember-me" checked>
                                    <label class="form-check-label small" for="login-remember-me" data-i18n="login_remember_me">
                                        Maintain active session across views
                                    </label>
                                </div>

                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary py-2 fw-semibold" id="btn-submit-login">
                                        <span class="spinner-border spinner-border-sm me-2 d-none" id="login-submit-spinner" role="status"></span>
                                        <i class="bi bi-box-arrow-in-right me-1" id="login-submit-icon"></i>
                                        <span data-i18n="btn_sign_in_account">Sign In to Account</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Active Session Inspector & Security Overview -->
                <div class="col-lg-6">
                    <!-- Current Session Details Card -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                                <div class="rounded-3 bg-success-subtle text-success p-2">
                                    <i class="bi bi-person-check fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold mb-0" data-i18n="active_session_title">Active Authenticated Session</h5>
                                    <small class="text-muted" data-i18n="active_session_subtitle">Currently authenticated identity and RBAC authorization scope.</small>
                                </div>
                            </div>
                            <span class="badge ${currentUser ? 'bg-success' : 'bg-secondary'}">
                                ${currentUser ? 'AUTHENTICATED' : 'GUEST'}
                            </span>
                        </div>
                        <div class="card-body p-4">
                            ${currentUser ? `
                                <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                    <img src="${escapeHtml(currentUser.Photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80')}" 
                                         class="rounded-circle border shadow-sm" width="64" height="64" style="object-fit: cover;" alt="Avatar">
                                    <div>
                                        <h5 class="fw-bold mb-1">${escapeHtml(currentUser.FullName || currentUser.Username)}</h5>
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <span class="badge bg-primary">${escapeHtml(currentUser.RoleName || currentUser.RoleID)}</span>
                                            <span class="badge bg-light text-dark border font-monospace">@${escapeHtml(currentUser.Username)}</span>
                                            ${currentUser.EmployeeID ? `<span class="badge bg-light text-primary border font-monospace">${escapeHtml(currentUser.EmployeeID)}</span>` : ''}
                                        </div>
                                        <div class="text-muted small">${escapeHtml(currentUser.Email || '')}</div>
                                    </div>
                                </div>

                                <div class="row g-2 mb-4">
                                    <div class="col-sm-6">
                                        <div class="p-2 border rounded bg-light">
                                            <small class="text-muted d-block" data-i18n="session_user_id">User Identifier</small>
                                            <span class="fw-bold font-monospace">${escapeHtml(currentUser.UserID || 'N/A')}</span>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="p-2 border rounded bg-light">
                                            <small class="text-muted d-block" data-i18n="session_logged_in">Session Started</small>
                                            <span class="fw-bold small">${escapeHtml(currentSession && currentSession.loginTime ? new Date(currentSession.loginTime).toLocaleTimeString() : 'Active')}</span>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="p-2 border rounded bg-light">
                                            <small class="text-muted d-block" data-i18n="session_token">Bearer Session Token</small>
                                            <span class="font-monospace small text-primary text-truncate d-block">${escapeHtml(currentSession && currentSession.token ? currentSession.token : 'DEMO-LOCAL-TOKEN')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-danger btn-sm flex-fill" id="btn-session-logout">
                                        <i class="bi bi-box-arrow-right me-1"></i> <span data-i18n="logout">Sign Out</span>
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm flex-fill" id="btn-session-switch-tab" onclick="Users.switchTab('permissions')">
                                        <i class="bi bi-shield-check me-1"></i> <span data-i18n="view_permissions">View My Permissions</span>
                                    </button>
                                </div>
                            ` : `
                                <div class="text-center py-4 text-muted">
                                    <i class="bi bi-person-slash fs-1 text-muted d-block mb-2"></i>
                                    <h6 class="fw-bold text-dark">No Active Session</h6>
                                    <p class="small text-muted mb-3">Please use the sign in form on the left to authenticate with your credentials.</p>
                                    <button class="btn btn-primary btn-sm" onclick="document.getElementById('login-input-username').focus()">
                                        <i class="bi bi-arrow-left me-1"></i> Focus Login Form
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Security Architecture Card -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white py-3 border-bottom">
                            <h6 class="fw-bold mb-0">
                                <i class="bi bi-shield-lock-fill text-primary me-2"></i>
                                <span data-i18n="security_architecture_title">Security Architecture & RBAC Integrity</span>
                            </h6>
                        </div>
                        <div class="card-body p-3">
                            <ul class="list-unstyled mb-0 d-flex flex-column gap-3">
                                <li class="d-flex align-items-start gap-2">
                                    <i class="bi bi-check-circle-fill text-success mt-1"></i>
                                    <div>
                                        <strong class="d-block small">Client-Side SHA-256 Hashing</strong>
                                        <span class="text-muted small">Passwords are never transmitted or stored in plaintext; one-way SHA-256 digests are calculated before API calls.</span>
                                    </div>
                                </li>
                                <li class="d-flex align-items-start gap-2">
                                    <i class="bi bi-check-circle-fill text-success mt-1"></i>
                                    <div>
                                        <strong class="d-block small">Granular Role-Based Access Control (RBAC)</strong>
                                        <span class="text-muted small">Every navigational link, feature tab, and mutation endpoint enforces permission checks in real time.</span>
                                    </div>
                                </li>
                                <li class="d-flex align-items-start gap-2">
                                    <i class="bi bi-check-circle-fill text-success mt-1"></i>
                                    <div>
                                        <strong class="d-block small">Session Storage Token Isolation</strong>
                                        <span class="text-muted small">Session credentials are bound to browser session lifecycle, preventing unauthorized cross-tab leakage.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind quick preset buttons
        container.querySelectorAll(".quick-preset-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const u = btn.getAttribute("data-uname");
                const p = btn.getAttribute("data-pwd");
                const unameInput = document.getElementById("login-input-username");
                const pwdInput = document.getElementById("login-input-password");
                if (unameInput) unameInput.value = u;
                if (pwdInput) pwdInput.value = p;
                
                showLoginAlert("info", `Selected preset account: <strong>${u}</strong>. Click 'Sign In' to authenticate.`);
            });
        });

        // Quick fill default password
        const quickFillPwd = document.getElementById("btn-quick-fill-default-pwd");
        if (quickFillPwd) {
            quickFillPwd.onclick = () => {
                const pwdInput = document.getElementById("login-input-password");
                if (pwdInput) pwdInput.value = "admin123";
            };
        }

        // Toggle password visibility
        const toggleEyeBtn = document.getElementById("btn-toggle-pwd-visibility");
        if (toggleEyeBtn) {
            toggleEyeBtn.onclick = () => {
                const pwdInput = document.getElementById("login-input-password");
                const eyeIcon = document.getElementById("icon-pwd-eye");
                if (pwdInput) {
                    if (pwdInput.type === "password") {
                        pwdInput.type = "text";
                        eyeIcon.classList.remove("bi-eye");
                        eyeIcon.classList.add("bi-eye-slash");
                    } else {
                        pwdInput.type = "password";
                        eyeIcon.classList.remove("bi-eye-slash");
                        eyeIcon.classList.add("bi-eye");
                    }
                }
            };
        }

        // Bind login form submit
        const loginForm = document.getElementById("form-user-login");
        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                await handleLoginSubmit();
            };
        }

        // Bind logout button
        const logoutBtn = document.getElementById("btn-session-logout");
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                Auth.logout();
                App.showToast("Signed out successfully", "info");
                renderLoginTab(container);
            };
        }
    }

    /**
     * Handle Login Submission Logic
     */
    async function handleLoginSubmit() {
        const usernameInput = document.getElementById("login-input-username");
        const passwordInput = document.getElementById("login-input-password");
        const spinner = document.getElementById("login-submit-spinner");
        const icon = document.getElementById("login-submit-icon");
        const submitBtn = document.getElementById("btn-submit-login");

        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showLoginAlert("warning", "Please enter both username and password.");
            return;
        }

        // Set loading state
        if (spinner) spinner.classList.remove("d-none");
        if (icon) icon.classList.add("d-none");
        if (submitBtn) submitBtn.disabled = true;

        try {
            const result = await Auth.login(username, password);
            if (result.success) {
                showLoginAlert("success", `Authentication successful! Signed in as <strong>${escapeHtml(result.user.FullName || result.user.Username)}</strong> (${escapeHtml(result.user.RoleName || result.user.RoleID)}).`);
                App.showToast(`Welcome back, ${result.user.FullName || result.user.Username}!`, "success");
                
                // Re-render the tab to reflect the active session
                setTimeout(() => {
                    const container = document.getElementById("users-tab-content-area");
                    if (container && activeTab === "login") {
                        renderLoginTab(container);
                    }
                }, 600);
            } else {
                showLoginAlert("danger", result.message || "Invalid username or password. Please verify credentials.");
            }
        } catch (err) {
            console.error("Login submission error:", err);
            showLoginAlert("danger", "An unexpected error occurred during login. Please try again.");
        } finally {
            if (spinner) spinner.classList.add("d-none");
            if (icon) icon.classList.remove("d-none");
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    function showLoginAlert(type, messageHtml) {
        const container = document.getElementById("login-alert-container");
        if (!container) return;

        const iconMap = {
            success: "bi-check-circle-fill",
            danger: "bi-exclamation-triangle-fill",
            warning: "bi-exclamation-circle-fill",
            info: "bi-info-circle-fill"
        };

        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
                <i class="bi ${iconMap[type] || 'bi-info-circle'} fs-5 flex-shrink-0"></i>
                <div class="small flex-grow-1">${messageHtml}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    // =========================================================================
    // MODALS: Create/Edit User, Reset Password, Global Quick Login Modal
    // =========================================================================

    function openUserModal(userId = null) {
        const u = userId ? usersList.find((x) => x.UserID === userId) : {};
        const isEdit = !!userId;

        const modalHtml = `
            <div class="modal fade" id="userFormModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${isEdit ? 'bi-pencil-square' : 'bi-person-plus'} me-2"></i>
                                ${isEdit ? 'Edit User Account' : 'Create User Account'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="form-user">
                                <div class="mb-3">
                                    <label class="form-label required">Username</label>
                                    <input type="text" class="form-control" id="user-uname" required value="${escapeHtml(u.Username || '')}" ${isEdit ? 'readonly' : ''}>
                                    <div class="form-text small">Unique login handle for the employee account.</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Full Legal / Display Name</label>
                                    <input type="text" class="form-control" id="user-fullname" required value="${escapeHtml(u.FullName || '')}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Corporate Email Address</label>
                                    <input type="email" class="form-control" id="user-email" required value="${escapeHtml(u.Email || '')}">
                                </div>
                                ${!isEdit ? `
                                    <div class="mb-3">
                                        <label class="form-label required">Initial Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="user-pwd" required placeholder="Minimum 6 characters">
                                            <button class="btn btn-outline-secondary" type="button" onclick="const p=document.getElementById('user-pwd'); p.type=p.type==='password'?'text':'password';">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                                <div class="mb-3">
                                    <label class="form-label required">Assigned System Role</label>
                                    <select class="form-select" id="user-role">
                                        ${rolesList.map((r) => `<option value="${r.RoleID}" ${u.RoleID === r.RoleID ? 'selected' : ''}>${r.RoleName}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Associated Employee ID</label>
                                    <input type="text" class="form-control font-monospace" id="user-empid" placeholder="e.g. EMP-000001" value="${escapeHtml(u.EmployeeID || '')}">
                                    <div class="form-text small">Links account to employee profile records & dossier.</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Account Status</label>
                                    <select class="form-select" id="user-status">
                                        <option value="Active" ${u.Status !== 'Inactive' ? 'selected' : ''}>Active</option>
                                        <option value="Inactive" ${u.Status === 'Inactive' ? 'selected' : ''}>Inactive / Suspended</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="btn-save-user-submit">
                                <i class="bi bi-check-lg me-1"></i> Save Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("userFormModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("userFormModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-save-user-submit").onclick = async () => {
            const username = document.getElementById("user-uname").value.trim();
            const fullName = document.getElementById("user-fullname").value.trim();
            const email = document.getElementById("user-email").value.trim();
            const roleId = document.getElementById("user-role").value;
            const employeeId = document.getElementById("user-empid").value.trim();
            const status = document.getElementById("user-status").value;

            if (!username || !fullName || !email) {
                App.showToast("Please fill in all required fields", "warning");
                return;
            }

            const payload = {
                UserID: u.UserID || undefined,
                Username: username,
                FullName: fullName,
                Email: email,
                RoleID: roleId,
                EmployeeID: employeeId,
                Status: status
            };

            if (!isEdit) {
                const plainPwd = document.getElementById("user-pwd").value;
                if (!plainPwd || plainPwd.length < 6) {
                    App.showToast("Password must be at least 6 characters", "warning");
                    return;
                }
                payload.PasswordHash = await Auth.hashPassword(plainPwd);
            }

            const res = await API.call("saveUser", payload, "POST");
            if (res.success) {
                modal.hide();
                App.showToast("User account saved successfully", "success");
                await loadData();
                renderActiveTab();
            } else {
                App.showToast(res.message, "danger");
            }
        };
    }

    function openResetPasswordModal(userId) {
        const u = usersList.find((x) => x.UserID === userId);
        if (!u) return;

        const modalHtml = `
            <div class="modal fade" id="resetPwdModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title fw-bold"><i class="bi bi-key me-2"></i>Reset Password for ${escapeHtml(u.Username)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label required">New Password</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="reset-new-pwd" placeholder="Minimum 6 characters">
                                    <button class="btn btn-outline-secondary" type="button" onclick="const p=document.getElementById('reset-new-pwd'); p.type=p.type==='password'?'text':'password';">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                                <div class="form-text small">Client-side cryptographic SHA-256 hash will be generated upon saving.</div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-warning" id="btn-save-pwd">Update Password</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("resetPwdModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("resetPwdModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-save-pwd").onclick = async () => {
            const pwd = document.getElementById("reset-new-pwd").value;
            if (!pwd || pwd.length < 6) {
                App.showToast("Password must be at least 6 characters", "warning");
                return;
            }

            const hash = await Auth.hashPassword(pwd);
            const res = await API.call("saveUser", { UserID: userId, PasswordHash: hash }, "POST");
            if (res.success) {
                modal.hide();
                App.showToast("Password reset successfully. Secure hash updated.", "success");
            } else {
                App.showToast(res.message, "danger");
            }
        };
    }

    async function toggleStatus(userId) {
        const u = usersList.find((x) => x.UserID === userId);
        if (!u) return;
        const newStatus = u.Status === "Active" ? "Inactive" : "Active";
        const res = await API.call("saveUser", { UserID: userId, Status: newStatus }, "POST");
        if (res.success) {
            App.showToast(`User ${u.Username} is now ${newStatus}`, "info");
            await loadData();
            renderActiveTab();
        }
    }

    /**
     * Global Quick Login Modal (can be triggered from navbar #btn-nav-login or anywhere)
     */
    function openLoginModal(onSuccessCallback = null) {
        const modalHtml = `
            <div class="modal fade" id="globalLoginModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-shield-lock me-2"></i> ApexHR Authentication
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="text-center mb-3">
                                <i class="bi bi-person-circle fs-1 text-primary"></i>
                                <h6 class="fw-bold mb-1">Sign In to Your Account</h6>
                                <p class="text-muted small">Enter your username or email and password to access the portal.</p>
                            </div>

                            <div class="mb-3 p-2 bg-light rounded text-center">
                                <small class="text-muted d-block mb-1 fw-bold">Quick Demo Login Presets:</small>
                                <div class="btn-group btn-group-sm flex-wrap">
                                    <button type="button" class="btn btn-outline-danger modal-preset-btn" data-uname="superadmin" data-pwd="admin123">Super Admin</button>
                                    <button type="button" class="btn btn-outline-primary modal-preset-btn" data-uname="hradmin" data-pwd="admin123">HR Admin</button>
                                    <button type="button" class="btn btn-outline-warning modal-preset-btn" data-uname="manager" data-pwd="admin123">Manager</button>
                                    <button type="button" class="btn btn-outline-secondary modal-preset-btn" data-uname="employee" data-pwd="admin123">Employee</button>
                                </div>
                            </div>

                            <div id="modal-login-alert"></div>

                            <form id="form-modal-login">
                                <div class="mb-3">
                                    <label class="form-label required">Username or Email</label>
                                    <input type="text" class="form-control" id="modal-login-username" required placeholder="superadmin or admin@company.com">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Password</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="modal-login-pwd" required placeholder="Enter password">
                                        <button class="btn btn-outline-secondary" type="button" onclick="const p=document.getElementById('modal-login-pwd'); p.type=p.type==='password'?'text':'password';">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="d-grid mt-4">
                                    <button type="submit" class="btn btn-primary" id="btn-modal-login-submit">
                                        <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("globalLoginModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("globalLoginModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        modalEl.querySelectorAll(".modal-preset-btn").forEach(btn => {
            btn.onclick = () => {
                document.getElementById("modal-login-username").value = btn.getAttribute("data-uname");
                document.getElementById("modal-login-pwd").value = btn.getAttribute("data-pwd");
            };
        });

        document.getElementById("form-modal-login").onsubmit = async (e) => {
            e.preventDefault();
            const u = document.getElementById("modal-login-username").value.trim();
            const p = document.getElementById("modal-login-pwd").value;
            const alertBox = document.getElementById("modal-login-alert");

            const res = await Auth.login(u, p);
            if (res.success) {
                modal.hide();
                App.showToast(`Signed in as ${res.user.FullName || res.user.Username}`, "success");
                if (typeof onSuccessCallback === "function") {
                    onSuccessCallback(res.user);
                } else {
                    App.refreshCurrentView();
                }
            } else {
                if (alertBox) {
                    alertBox.innerHTML = `
                        <div class="alert alert-danger py-2 small mb-3">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i> ${res.message || 'Invalid credentials'}
                        </div>
                    `;
                }
            }
        };
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    return {
        render,
        switchTab,
        openUserModal,
        openResetPasswordModal,
        toggleStatus,
        openLoginModal
    };
})();

window.Users = Users;