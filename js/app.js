/**
 * HR Management System - Core Application Orchestrator
 * 
 * Handles routing, view transitions, notification toasts, confirmation modals,
 * connection status indicator, and mobile menu toggling.
 */

const App = (function () {
    let currentView = "dashboard";
    let currentViewParams = null;

    async function init() {
        console.log(`Initializing ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}...`);

        // Initialize Internationalization (i18n) & Font Battambang support
        if (window.I18n) {
            I18n.init();
            I18n.onLanguageChange(() => {
                refreshCurrentView();
            });
        }

        // Setup connection listener
        API.onStatusChange((state, detail) => {
            updateConnectionPill(state, detail);
        });

        // Test connection (or initialize demo mode)
        await API.testConnection();

        // Initialize session
        Auth.initDefaultSession();

        // Setup global event listeners
        setupNavigation();
        setupModalsAndToasts();

        // Parse initial URL hash or load dashboard
        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
    }

    function updateConnectionPill(state, detail) {
        const pill = document.getElementById("connection-status-pill");
        if (!pill) return;

        pill.title = detail || "";

        const textConnected = window.I18n ? I18n.t("conn_connected", "Connected (Google Sheets)") : "Connected (Google Sheets)";
        const textDemo = window.I18n ? I18n.t("conn_demo", "Demo Mode") : "Demo Mode";
        const textChecking = window.I18n ? I18n.t("conn_checking", "Connecting...") : "Connecting...";
        const textError = window.I18n ? I18n.t("conn_error", "Connection Error") : "Connection Error";

        if (state === "connected-api") {
            pill.className = "badge bg-success-subtle text-success border border-success d-flex align-items-center gap-1 py-1 px-2";
            pill.innerHTML = `<span class="status-indicator-dot bg-success"></span> <span class="d-none d-sm-inline">${textConnected}</span><span class="d-inline d-sm-none">Connected</span>`;
        } else if (state === "connected-demo") {
            pill.className = "badge bg-warning-subtle text-warning-emphasis border border-warning d-flex align-items-center gap-1 py-1 px-2";
            pill.innerHTML = `<span class="status-indicator-dot bg-warning"></span> <span class="d-none d-sm-inline">${textDemo}</span><span class="d-inline d-sm-none">Demo</span>`;
        } else if (state === "connecting") {
            pill.className = "badge bg-secondary-subtle text-secondary border d-flex align-items-center gap-1 py-1 px-2";
            pill.innerHTML = `<span class="spinner-border spinner-border-sm" style="width: 10px; height: 10px;"></span> <span class="d-none d-sm-inline">${textChecking}</span><span class="d-inline d-sm-none">...</span>`;
        } else {
            pill.className = "badge bg-danger-subtle text-danger border border-danger d-flex align-items-center gap-1 py-1 px-2";
            pill.innerHTML = `<span class="status-indicator-dot bg-danger"></span> <span class="d-none d-sm-inline">${textError}</span><span class="d-inline d-sm-none">Offline</span>`;
        }
    }

    function setupNavigation() {
        // Sidebar link clicks
        const navLinks = document.querySelectorAll(".sidebar-nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const view = link.getAttribute("data-view");
                if (view) {
                    navigateTo(view);
                    // Close sidebar and backdrop on mobile
                    if (window.innerWidth < 992) {
                        const sidebar = document.getElementById("app-sidebar");
                        const backdrop = document.getElementById("sidebar-backdrop");
                        if (sidebar) sidebar.classList.remove("show");
                        if (backdrop) backdrop.classList.remove("show");
                    }
                }
            });
        });

        // Mobile sidebar toggle button
        const mobileToggle = document.getElementById("btn-sidebar-toggle");
        const mobileClose = document.getElementById("btn-sidebar-close");
        const sidebar = document.getElementById("app-sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener("click", () => {
                sidebar.classList.toggle("show");
                if (backdrop) backdrop.classList.toggle("show");
            });
        }

        if (mobileClose && sidebar) {
            mobileClose.addEventListener("click", () => {
                sidebar.classList.remove("show");
                if (backdrop) backdrop.classList.remove("show");
            });
        }

        if (backdrop) {
            backdrop.addEventListener("click", () => {
                sidebar.classList.remove("show");
                backdrop.classList.remove("show");
            });
        }
    }

    function handleHashChange() {
        const hash = window.location.hash.replace("#", "");
        if (!hash) {
            navigateTo("dashboard", null, false);
            return;
        }

        const parts = hash.split("/");
        const view = parts[0];
        const param = parts[1];

        if (view === "profile" && param) {
            viewEmployeeProfile(param, parts[2] || "overview", false);
        } else {
            navigateTo(view, param, false);
        }
    }

    function navigateTo(viewName, params = null, updateHash = true) {
        currentView = viewName;
        currentViewParams = params;

        if (updateHash) {
            window.location.hash = params ? `${viewName}/${params}` : viewName;
        }

        // Update active class in sidebar
        document.querySelectorAll(".sidebar-nav-link").forEach((link) => {
            if (link.getAttribute("data-view") === viewName) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        const mainContent = document.getElementById("app-content");
        if (!mainContent) return;

        // Window scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });

        switch (viewName) {
            case "dashboard":
                Dashboard.render(mainContent);
                break;
            case "employees":
                Employees.render(mainContent);
                break;
            case "users":
                Users.render(mainContent);
                break;
            case "lists":
                MasterLists.render(mainContent);
                break;
            case "reports":
                Reports.render(mainContent);
                break;
            case "settings":
                Settings.render(mainContent);
                break;
            case "attendance":
                Attendance.render(mainContent);
                break;
            case "leave":
                LeaveMgmt.render(mainContent);
                break;
            case "recruitment":
                Recruitment.render(mainContent);
                break;
            case "payroll":
                Payroll.render(mainContent);
                break;
            default:
                Dashboard.render(mainContent);
                break;
        }

        // Apply translations to dynamically generated markup
        if (window.I18n) {
            I18n.translateDOM(mainContent);
        }
    }

    function viewEmployeeProfile(employeeId, initialTab = "overview", updateHash = true) {
        currentView = "profile";
        currentViewParams = { employeeId, initialTab };

        if (updateHash) {
            window.location.hash = `profile/${employeeId}/${initialTab}`;
        }

        // Highlight employee directory nav
        document.querySelectorAll(".sidebar-nav-link").forEach((link) => {
            if (link.getAttribute("data-view") === "employees") {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        const mainContent = document.getElementById("app-content");
        if (mainContent) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            EmployeeProfile.render(mainContent, employeeId, initialTab);
        }
    }

    function refreshCurrentView() {
        if (currentView === "profile" && currentViewParams) {
            viewEmployeeProfile(currentViewParams.employeeId, currentViewParams.initialTab, false);
        } else {
            navigateTo(currentView, currentViewParams, false);
        }
    }

    function renderFutureModulePlaceholder(container, moduleName) {
        const titleMap = {
            recruitment: "Recruitment & Applicant Tracking",
            attendance: "Attendance & Time Tracking",
            leave: "Leave Management System",
            payroll: "Payroll & Compensation"
        };

        const title = titleMap[moduleName] || moduleName.toUpperCase();

        container.innerHTML = `
            <div class="card border-0 shadow-sm text-center py-5">
                <div class="card-body py-5">
                    <div class="mb-3">
                        <i class="bi bi-gear-wide-connected text-primary display-3"></i>
                    </div>
                    <h3 class="fw-bold">${title}</h3>
                    <p class="text-muted col-md-6 mx-auto">
                        This module is architecturally planned for Phase 2 integration. 
                        Its database sheets and schema relationships are already prepared in the Google Sheets structure.
                    </p>
                    <div class="d-flex justify-content-center gap-2 mt-3">
                        <button class="btn btn-primary" onclick="App.navigateTo('dashboard')">
                            <i class="bi bi-speedometer2 me-1"></i> Return to Dashboard
                        </button>
                        <button class="btn btn-outline-secondary" onclick="App.navigateTo('employees')">
                            <i class="bi bi-people me-1"></i> View Employees
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Toast Notifications Helper
     */
    function showToast(message, type = "info") {
        const toastContainer = document.getElementById("toast-container");
        if (!toastContainer) return;

        const toastId = "toast-" + Date.now();
        const typeClasses = {
            success: "bg-success text-white",
            danger: "bg-danger text-white",
            warning: "bg-warning text-dark",
            info: "bg-primary text-white"
        };

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center ${typeClasses[type] || 'bg-primary text-white'} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body py-3">
                        ${message}
                    </div>
                    <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML("beforeend", toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
        toast.show();

        toastEl.addEventListener("hidden.bs.toast", () => {
            toastEl.remove();
        });
    }

    /**
     * Universal Confirmation Dialog Helper
     */
    function confirmDialog({ title, message, confirmText = "Confirm", confirmBtnClass = "btn-primary", onConfirm }) {
        const modalHtml = `
            <div class="modal fade" id="globalConfirmModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">${title || 'Confirm Action'}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <p class="mb-0 text-muted">${message || 'Are you sure you wish to proceed?'}</p>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn ${confirmBtnClass}" id="btn-confirm-action-submit">${confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("globalConfirmModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("globalConfirmModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-confirm-action-submit").onclick = async () => {
            modal.hide();
            if (typeof onConfirm === "function") {
                await onConfirm();
            }
        };
    }

    function setupModalsAndToasts() {
        // Quick Role Switcher handler in top bar
        const roleSelectors = document.querySelectorAll(".role-switch-item");
        roleSelectors.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const roleId = item.getAttribute("data-role");
                if (roleId) {
                    Auth.switchRole(roleId);
                }
            });
        });
    }

    return {
        init,
        navigateTo,
        viewEmployeeProfile,
        refreshCurrentView,
        showToast,
        confirmDialog
    };
})();

// Bootstrap App on DOM load
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});

window.App = App;
