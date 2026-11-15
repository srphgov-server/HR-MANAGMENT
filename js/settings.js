/**
 * HR Management System - System Settings & Audit Log Module
 * 
 * Manages organization parameters, document warning thresholds, and security audit trail.
 */

const Settings = (function () {
    let settingsData = {};

    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-gear text-primary me-2"></i><span data-i18n="set_title">System Settings & Configuration</span></h3>
                    <p class="text-muted mb-0" data-i18n="set_subtitle">Configure company identity, localization parameters, and view audit events.</p>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <ul class="nav nav-tabs mb-4 profile-tabs-scroll flex-nowrap" id="settingsTabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" id="tab-general-link" data-bs-toggle="tab" data-bs-target="#tab-general-settings" type="button">
                        <i class="bi bi-sliders me-1"></i> <span data-i18n="set_tab_general">Organization & Localization</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" id="tab-audit-link" data-bs-toggle="tab" data-bs-target="#tab-audit-logs" type="button">
                        <i class="bi bi-journal-text me-1"></i> <span data-i18n="set_tab_audit">Security Audit Log</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" id="tab-api-link" data-bs-toggle="tab" data-bs-target="#tab-api-settings" type="button">
                        <i class="bi bi-database-check me-1"></i> <span data-i18n="set_tab_api">Google Sheets Backend Connection</span>
                    </button>
                </li>
            </ul>

            <div class="tab-content" id="settingsTabContent">
                <!-- 1. Organization & Localization Tab -->
                <div class="tab-pane fade show active" id="tab-general-settings" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-4">
                            <form id="form-system-settings">
                                <h6 class="fw-bold text-primary border-bottom pb-2 mb-3" data-i18n="set_company_identity">Company Identity</h6>
                                <div class="row g-3 mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label required" data-i18n="set_org_name">Organization Name</label>
                                        <input type="text" class="form-control" id="set-org-name" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label" data-i18n="set_org_logo">Logo URL</label>
                                        <input type="url" class="form-control" id="set-org-logo" placeholder="https://...">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label" data-i18n="set_org_address">Headquarters Address</label>
                                        <input type="text" class="form-control" id="set-org-address">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label" data-i18n="set_country">Default Country</label>
                                        <input type="text" class="form-control" id="set-country">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label" data-i18n="set_timezone">Time Zone</label>
                                        <input type="text" class="form-control" id="set-timezone">
                                    </div>
                                </div>

                                <h6 class="fw-bold text-primary border-bottom pb-2 mb-3" data-i18n="set_thresholds">System Thresholds & Formats</h6>
                                <div class="row g-3 mb-4">
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_date_format">Date Format</label>
                                        <select class="form-select" id="set-date-format">
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_currency">Currency</label>
                                        <input type="text" class="form-control" id="set-currency" value="USD ($)">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_empid_format">Employee ID Format</label>
                                        <input type="text" class="form-control font-monospace" id="set-empid-format" value="EMP-000000" readonly>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label required" data-i18n="set_expiry_days">Document Expiry Alert Window (Days)</label>
                                        <input type="number" class="form-control" id="set-expiry-days" min="1" max="180" required>
                                        <small class="text-muted">Flags documents on dashboard when expiry is within this number of days.</small>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_timeout">Session Inactivity Timeout (Minutes)</label>
                                        <input type="number" class="form-control" id="set-timeout" min="15" max="480">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_page_size">Default Table Rows</label>
                                        <select class="form-select" id="set-page-size">
                                            <option value="10">10 rows</option>
                                            <option value="25">25 rows</option>
                                            <option value="50">50 rows</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label" data-i18n="set_language">System Language / ភាសាប្រព័ន្ធ</label>
                                        <select class="form-select" id="set-language">
                                            <option value="en">🇺🇸 English</option>
                                            <option value="km">🇰🇭 ភាសាខ្មែរ (Khmer - Battambang)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-primary px-4" id="btn-save-settings">
                                        <i class="bi bi-save me-1"></i> <span data-i18n="set_save_btn">Save System Settings</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- 2. Security Audit Log Tab -->
                <div class="tab-pane fade" id="tab-audit-logs" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-0"><i class="bi bi-shield-check text-success me-2"></i>Administrative Audit Trail</h6>
                                <small class="text-muted">Immutable log of administrative logins, record additions, and deletions.</small>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm" id="btn-refresh-audit">
                                <i class="bi bi-arrow-clockwise me-1"></i> Refresh Logs
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="ps-3">Log ID</th>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Module</th>
                                            <th>Record Ref</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody id="audit-table-body">
                                        <tr><td colspan="7" class="text-center py-4 text-muted">Loading audit records...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Google Sheets Backend Info Tab -->
                <div class="tab-pane fade" id="tab-api-settings" role="tabpanel">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-4">
                            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-google me-2"></i>Google Sheets Backend Integration</h6>
                            <p class="text-muted small">
                                The system connects to Google Sheets through a secure Google Apps Script Web Application.
                                Paste your deployed Web App URL in <code>js/config.js</code> to link your live spreadsheet.
                            </p>

                            <div class="p-3 bg-light rounded border mb-4">
                                <div class="fw-bold mb-1">Active Backend Status:</div>
                                <div id="settings-backend-status-pill" class="badge bg-secondary p-2">Checking...</div>
                                <div class="small text-muted mt-2" id="settings-backend-details">—</div>
                            </div>

                            <div class="alert alert-info">
                                <h6 class="fw-bold"><i class="bi bi-info-circle me-1"></i>Quick Setup Steps:</h6>
                                <ol class="small mb-0 ps-3">
                                    <li>Create a new Google Sheet on Google Drive.</li>
                                    <li>Open <strong>Extensions &gt; Apps Script</strong> and copy the backend files from the <code>google-apps-script/</code> folder.</li>
                                    <li>Set your spreadsheet ID in <code>Config.gs</code> and run <code>setupDatabase()</code> once.</li>
                                    <li>Deploy as Web App: <em>Execute as: Me</em>, <em>Who has access: Anyone</em>.</li>
                                    <li>Copy the Web App URL and paste it into <code>js/config.js</code> under <code>CONFIG.API_URL</code>.</li>
                                </ol>
                            </div>

                            <button class="btn btn-outline-primary" id="btn-retest-connection">
                                <i class="bi bi-arrow-repeat me-1"></i> Test Connection Now
                            </button>
                            <button class="btn btn-outline-danger ms-2" id="btn-reset-demo-data">
                                <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Demo Mock Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupEvents();
        await loadData();
    }

    function setupEvents() {
        document.getElementById("btn-save-settings").onclick = async () => {
            const chosenLang = document.getElementById("set-language").value;
            const updated = {
                organizationName: document.getElementById("set-org-name").value.trim(),
                organizationLogo: document.getElementById("set-org-logo").value.trim(),
                organizationAddress: document.getElementById("set-org-address").value.trim(),
                defaultCountry: document.getElementById("set-country").value.trim(),
                timeZone: document.getElementById("set-timezone").value.trim(),
                dateFormat: document.getElementById("set-date-format").value,
                currency: document.getElementById("set-currency").value.trim(),
                docExpiryWarningDays: parseInt(document.getElementById("set-expiry-days").value, 10) || 30,
                sessionTimeoutMins: parseInt(document.getElementById("set-timeout").value, 10) || 60,
                paginationSize: parseInt(document.getElementById("set-page-size").value, 10) || 10,
                language: chosenLang
            };

            const res = await API.call("saveSettings", updated, "POST");
            if (res.success) {
                if (window.I18n && I18n.getLanguage() !== chosenLang) {
                    I18n.setLanguage(chosenLang);
                }
                App.showToast("System configuration saved successfully", "success");
            } else {
                App.showToast(res.message, "danger");
            }
        };

        document.getElementById("btn-refresh-audit").onclick = () => loadAuditLogs();

        document.getElementById("btn-retest-connection").onclick = async () => {
            App.showToast("Testing connection to backend...", "info");
            await API.testConnection();
            updateBackendPill();
        };

        document.getElementById("btn-reset-demo-data").onclick = () => {
            App.confirmDialog({
                title: "Reset Demo Data",
                message: "This will reset all in-browser demo employees, documents, and skills to their factory defaults.",
                confirmText: "Reset Demo Data",
                confirmBtnClass: "btn-danger",
                onConfirm: async () => {
                    await API.call("resetDemoData", {}, "POST");
                    App.showToast("Demo data reset to factory defaults", "info");
                    App.refreshCurrentView();
                }
            });
        };
    }

    async function loadData() {
        const res = await API.call("getSettings", {}, "GET", true);
        if (res.success && res.data) {
            settingsData = res.data;
            populateForm();
        }
        await loadAuditLogs();
        updateBackendPill();
    }

    function populateForm() {
        document.getElementById("set-org-name").value = settingsData.organizationName || "Apex Corporate Technologies";
        document.getElementById("set-org-logo").value = settingsData.organizationLogo || "";
        document.getElementById("set-org-address").value = settingsData.organizationAddress || "1000 Enterprise Plaza, Suite 400";
        document.getElementById("set-country").value = settingsData.defaultCountry || "United States";
        document.getElementById("set-timezone").value = settingsData.timeZone || "America/Los_Angeles";
        document.getElementById("set-date-format").value = settingsData.dateFormat || "YYYY-MM-DD";
        document.getElementById("set-currency").value = settingsData.currency || "USD ($)";
        document.getElementById("set-expiry-days").value = settingsData.docExpiryWarningDays || 30;
        document.getElementById("set-timeout").value = settingsData.sessionTimeoutMins || 60;
        document.getElementById("set-page-size").value = settingsData.paginationSize || 10;
        const currentAppLang = window.I18n ? I18n.getLanguage() : (settingsData.language || "en");
        const langEl = document.getElementById("set-language");
        if (langEl) langEl.value = currentAppLang;
    }

    async function loadAuditLogs() {
        const tbody = document.getElementById("audit-table-body");
        if (!tbody) return;

        const res = await API.call("getAuditLogs", {}, "GET", true);
        const logs = (res.success && res.data) || [];

        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No audit events recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map((l) => `
            <tr>
                <td class="ps-3"><span class="badge bg-light text-dark font-monospace">${l.LogID}</span></td>
                <td><small class="text-muted">${l.Timestamp || '—'}</small></td>
                <td><div class="fw-semibold">${l.UserName || 'System'}</div></td>
                <td><span class="badge bg-secondary-subtle text-secondary font-monospace">${l.Action}</span></td>
                <td><span class="badge bg-light text-dark border">${l.Module}</span></td>
                <td><small class="font-monospace">${l.RecordID || '—'}</small></td>
                <td><small class="text-muted">${l.Description || '—'}</small></td>
            </tr>
        `).join("");
    }

    function updateBackendPill() {
        const pill = document.getElementById("settings-backend-status-pill");
        const detail = document.getElementById("settings-backend-details");
        if (!pill) return;

        const state = API.getConnectionState();
        if (state === "connected-api") {
            pill.className = "badge bg-success p-2";
            pill.innerHTML = `<i class="bi bi-cloud-check me-1"></i> Connected to Google Sheets API`;
            if (detail) detail.textContent = `Active API URL: ${CONFIG.API_URL}`;
        } else {
            pill.className = "badge bg-warning text-dark p-2";
            pill.innerHTML = `<i class="bi bi-hdd me-1"></i> Operating in Local Demo Mode`;
            if (detail) detail.textContent = "Google Sheets Web App URL not yet configured in js/config.js.";
        }
    }

    return {
        render
    };
})();

window.Settings = Settings;
