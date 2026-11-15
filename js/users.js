/**
 * HR Management System - User & Access Control Module
 * 
 * Provides administrative management of user logins, role assignments, and activation states.
 */

const Users = (function () {
    let usersList = [];
    let rolesList = [];

    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-shield-lock text-primary me-2"></i><span data-i18n="users_title">User & Access Management</span></h3>
                    <p class="text-muted mb-0">Manage system login accounts, role assignments, and security statuses.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm" id="btn-add-user">
                        <i class="bi bi-person-plus me-1"></i> Create User Account
                    </button>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3 text-nowrap">User ID</th>
                                    <th class="text-nowrap">Full Name & Username</th>
                                    <th class="text-nowrap">Email Address</th>
                                    <th class="text-nowrap">Assigned Role</th>
                                    <th class="text-nowrap">Associated Employee</th>
                                    <th class="text-nowrap">Status</th>
                                    <th class="text-nowrap">Last Login</th>
                                    <th class="text-end pe-3 text-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody id=\"users-table-body\">
                                <tr>
                                    <td colspan="8" class="text-center py-5">
                                        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                                        <span class="ms-2 text-muted">Loading user accounts...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("btn-add-user").onclick = () => openUserModal();
        await loadData();
    }

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
            renderTable();
        }
    }

    function renderTable() {
        const tbody = document.getElementById("users-table-body");
        if (!tbody) return;

        if (usersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No user accounts found.</td></tr>`;
            return;
        }

        tbody.innerHTML = usersList.map((u) => {
            const roleObj = rolesList.find((r) => r.RoleID === u.RoleID);
            const roleName = roleObj ? roleObj.RoleName : (u.RoleID || "User");
            const isActive = u.Status === "Active";

            return `
                <tr>
                    <td class="ps-3 text-nowrap"><span class="badge bg-light text-dark font-monospace">${u.UserID}</span></td>
                    <td class="text-nowrap">
                        <div class="fw-bold">${u.FullName || u.Username}</div>
                        <small class="text-muted">@${u.Username}</small>
                    </td>
                    <td class="text-nowrap"><a href="mailto:${u.Email}">${u.Email}</a></td>
                    <td class="text-nowrap"><span class="badge bg-primary-subtle text-primary">${roleName}</span></td>
                    <td class="text-nowrap"><span class="badge bg-light text-dark border font-monospace">${u.EmployeeID || 'None'}</span></td>
                    <td class="text-nowrap">
                        <span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">
                            ${u.Status || 'Active'}
                        </span>
                    </td>
                    <td class="text-nowrap"><small class="text-muted">${u.LastLogin || 'Never'}</small></td>
                    <td class="text-end pe-3 text-nowrap">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" title="Edit User" onclick="Users.openUserModal('${u.UserID}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-warning" title="Reset Password" onclick="Users.openResetPasswordModal('${u.UserID}')">
                                <i class="bi bi-key"></i>
                            </button>
                            <button class="btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}" title="${isActive ? 'Deactivate' : 'Activate'}" onclick="Users.toggleStatus('${u.UserID}')">
                                <i class="bi ${isActive ? 'bi-person-slash' : 'bi-person-check'}"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function openUserModal(userId = null) {
        const u = userId ? usersList.find((x) => x.UserID === userId) : {};
        const isEdit = !!userId;

        const modalHtml = `
            <div class="modal fade" id="userFormModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">${isEdit ? 'Edit User Account' : 'Create User Account'}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="form-user">
                                <div class="mb-3">
                                    <label class="form-label required">Username</label>
                                    <input type="text" class="form-control" id="user-uname" required value="${u.Username || ''}" ${isEdit ? 'readonly' : ''}>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Full Legal / Display Name</label>
                                    <input type="text" class="form-control" id="user-fullname" required value="${u.FullName || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Email Address</label>
                                    <input type="email" class="form-control" id="user-email" required value="${u.Email || ''}">
                                </div>
                                ${!isEdit ? `
                                    <div class="mb-3">
                                        <label class="form-label required">Initial Password</label>
                                        <input type="password" class="form-control" id="user-pwd" required placeholder="Minimum 6 characters">
                                    </div>
                                ` : ''}
                                <div class="mb-3">
                                    <label class="form-label required">System Role</label>
                                    <select class="form-select" id="user-role">
                                        ${rolesList.map((r) => `<option value="${r.RoleID}" ${u.RoleID === r.RoleID ? 'selected' : ''}>${r.RoleName}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Associated Employee ID</label>
                                    <input type="text" class="form-control font-monospace" id="user-empid" placeholder="e.g. EMP-000001" value="${u.EmployeeID || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Account Status</label>
                                    <select class="form-select" id="user-status">
                                        <option value="Active" ${u.Status !== 'Inactive' ? 'selected' : ''}>Active</option>
                                        <option value="Inactive" ${u.Status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="btn-save-user-submit">Save Account</button>
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
                App.showToast("User account updated successfully", "success");
                await loadData();
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
                            <h5 class="modal-title fw-bold"><i class="bi bi-key me-2"></i>Reset Password for ${u.Username}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="mb-3">
                                <label class="form-label required">New Password</label>
                                <input type="password" class="form-control" id="reset-new-pwd" placeholder="Minimum 6 characters">
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
        }
    }

    return {
        render,
        openUserModal,
        openResetPasswordModal,
        toggleStatus
    };
})();

window.Users = Users;
