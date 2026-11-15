/**
 * HR Management System - Leave Management System Module
 * 
 * Provides leave applications, multi-tier approvals, entitlement balances,
 * calendar tracking, and CSV export.
 */

const LeaveMgmt = (function () {
    let leaveRequests = [];
    let leaveBalances = [];
    let employeesList = [];
    let activeTab = "requests"; // "requests", "balances", "calendar"
    let filterStatus = "All";
    let filterType = "All";
    let searchQuery = "";

    async function loadData() {
        const [reqRes, balRes, empRes] = await Promise.all([
            API.call("getLeaveRequests"),
            API.call("getLeaveBalances"),
            API.call("getEmployees")
        ]);

        if (reqRes.success) {
            leaveRequests = reqRes.data || [];
        }
        if (balRes.success) {
            leaveBalances = balRes.data || [];
        }
        if (empRes.success) {
            employeesList = empRes.data || [];
        }
    }

    async function render(container) {
        API.showLoading("Loading leave management records...");
        await loadData();
        API.hideLoading();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-calendar2-range text-primary me-2"></i><span data-i18n="leave_title">Leave Management System</span></h3>
                    <p class="text-muted mb-0" data-i18n="leave_subtitle">Manage leave requests, review pending approvals, and track balance entitlements.</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary btn-sm" id="btn-apply-leave">
                        <i class="bi bi-calendar-plus me-1"></i> <span data-i18n="leave_apply_btn">Apply for Leave</span>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="btn-export-leaves">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="btn_export">Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- KPI Summary Cards -->
            <div class="row g-3 mb-4" id="leave-kpi-row">
                <!-- Injected via updateKPIs() -->
            </div>

            <!-- Sub-Navigation Tabs -->
            <ul class="nav nav-pills mb-3" id="leave-tabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'requests' ? 'active' : ''}" data-tab="requests">
                        <i class="bi bi-inbox me-1"></i> <span data-i18n="leave_tab_requests">Leave Applications & Requests</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'balances' ? 'active' : ''}" data-tab="balances">
                        <i class="bi bi-wallet2 me-1"></i> <span data-i18n="leave_tab_balances">Entitlements & Balances</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar">
                        <i class="bi bi-calendar-event me-1"></i> <span data-i18n="leave_tab_calendar">Upcoming Leaves Schedule</span>
                    </button>
                </li>
            </ul>

            <!-- Dynamic View Container -->
            <div id="leave-tab-content">
                <!-- Injected based on activeTab -->
            </div>
        `;

        attachEventListeners();
        renderActiveTab();
    }

    function attachEventListeners() {
        const tabs = document.querySelectorAll("#leave-tabs button");
        tabs.forEach(btn => {
            btn.addEventListener("click", () => {
                tabs.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeTab = btn.getAttribute("data-tab");
                renderActiveTab();
            });
        });

        const applyBtn = document.getElementById("btn-apply-leave");
        if (applyBtn) applyBtn.addEventListener("click", () => openApplyLeaveModal());

        const exportBtn = document.getElementById("btn-export-leaves");
        if (exportBtn) exportBtn.addEventListener("click", exportCSV);
    }

    function renderActiveTab() {
        renderKPIs();
        const content = document.getElementById("leave-tab-content");
        if (!content) return;

        if (activeTab === "requests") {
            renderRequestsView(content);
        } else if (activeTab === "balances") {
            renderBalancesView(content);
        } else if (activeTab === "calendar") {
            renderCalendarView(content);
        }
    }

    function renderKPIs() {
        const kpiRow = document.getElementById("leave-kpi-row");
        if (!kpiRow) return;

        const pendingCount = leaveRequests.filter(r => r.Status === "Pending").length;
        
        // Count on leave today
        const todayStr = "2026-11-15";
        const onLeaveToday = leaveRequests.filter(r => {
            return r.Status === "Approved" && r.StartDate <= todayStr && r.EndDate >= todayStr;
        }).length;

        // Approved this month (2026-11)
        const approvedMonth = leaveRequests.filter(r => {
            return r.Status === "Approved" && (r.StartDate.startsWith("2026-11") || (r.ApprovedDate && r.ApprovedDate.startsWith("2026-11")));
        }).length;

        // Total leave days taken across all approved
        const totalDaysTaken = leaveRequests.filter(r => r.Status === "Approved").reduce((sum, r) => sum + (parseFloat(r.TotalDays) || 0), 0);

        kpiRow.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 ${pendingCount > 0 ? 'bg-warning-subtle text-warning border-warning' : 'bg-white'}">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="small fw-bold text-uppercase ${pendingCount > 0 ? 'text-warning' : 'text-muted'}" data-i18n="leave_pending_appr">${I18n.t('leave_pending_appr')}</div>
                                <div class="h2 fw-bold mb-0 mt-1">${pendingCount}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-white shadow-sm text-warning">
                                <i class="bi bi-hourglass-top fs-4"></i>
                            </div>
                        </div>
                        <small class="${pendingCount > 0 ? 'text-warning' : 'text-muted'} mt-2 d-block">Requires HR/Manager review</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="leave_on_leave_today">${I18n.t('leave_on_leave_today')}</div>
                                <div class="h2 fw-bold mb-0 text-dark mt-1">${onLeaveToday}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-info-subtle text-info">
                                <i class="bi bi-person-x fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Active staff currently off</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="leave_appr_month">${I18n.t('leave_appr_month')}</div>
                                <div class="h2 fw-bold mb-0 text-success mt-1">${approvedMonth}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-success-subtle text-success">
                                <i class="bi bi-check2-circle fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">November 2026 authorizations</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="leave_total_days">${I18n.t('leave_total_days')}</div>
                                <div class="h2 fw-bold mb-0 text-primary mt-1">${totalDaysTaken} <span class="fs-6 fw-normal text-muted" data-i18n="leave_days">${I18n.t('leave_days')}</span></div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-primary-subtle text-primary">
                                <i class="bi bi-calendar2-check fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Cumulative approved duration</small>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRequestsView(container) {
        container.innerHTML = `
            <!-- Filter Toolbar -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Status Filter</label>
                            <select class="form-select form-select-sm" id="filter-leave-status">
                                <option value="All" ${filterStatus === 'All' ? 'selected' : ''}>All Statuses</option>
                                <option value="Pending" ${filterStatus === 'Pending' ? 'selected' : ''}>Pending Approval</option>
                                <option value="Approved" ${filterStatus === 'Approved' ? 'selected' : ''}>Approved</option>
                                <option value="Rejected" ${filterStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Leave Type</label>
                            <select class="form-select form-select-sm" id="filter-leave-type">
                                <option value="All">All Types</option>
                                <option value="Annual Leave">Annual Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Maternity Leave">Maternity / Paternity</option>
                                <option value="Unpaid Leave">Unpaid Leave</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-semibold mb-1">Search Employee / Reason</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control" id="filter-leave-search" placeholder="Search applicant, reason, or request ID..." value="${searchQuery}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Requests Table Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold mb-0">Leave Applications</h6>
                    <span class="badge bg-light text-dark border font-monospace" id="leave-record-count">0 items</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Request ID</th>
                                <th>Employee</th>
                                <th>Leave Type</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Reason & Details</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="leave-requests-tbody">
                            <!-- Populated below -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const statusSelect = document.getElementById("filter-leave-status");
        const typeSelect = document.getElementById("filter-leave-type");
        const searchInput = document.getElementById("filter-leave-search");

        if (statusSelect) {
            statusSelect.addEventListener("change", (e) => {
                filterStatus = e.target.value;
                populateRequestsTable();
            });
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", (e) => {
                filterType = e.target.value;
                populateRequestsTable();
            });
        }
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                populateRequestsTable();
            });
        }

        populateRequestsTable();
    }

    function populateRequestsTable() {
        const tbody = document.getElementById("leave-requests-tbody");
        const countBadge = document.getElementById("leave-record-count");
        if (!tbody) return;

        let filtered = leaveRequests.filter(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const empName = `${emp.FirstName || ''} ${emp.LastName || ''}`.toLowerCase();
            const empCode = (emp.EmployeeCode || '').toLowerCase();
            const reason = (r.Reason || '').toLowerCase();
            const reqId = (r.RequestID || '').toLowerCase();

            if (filterStatus !== "All" && r.Status !== filterStatus) return false;
            if (filterType !== "All" && r.LeaveType !== filterType) return false;
            if (searchQuery) {
                if (!empName.includes(searchQuery) && !empCode.includes(searchQuery) && !reason.includes(searchQuery) && !reqId.includes(searchQuery)) {
                    return false;
                }
            }
            return true;
        });

        countBadge.textContent = `${filtered.length} requests`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-2"></i>
                        No leave requests found matching your filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {
                FirstName: "Employee",
                LastName: r.EmployeeID,
                EmployeeCode: r.EmployeeID,
                DepartmentID: "Unassigned"
            };

            const statusBadges = {
                "Approved": `<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check2-circle me-1"></i>Approved</span>`,
                "Pending": `<span class="badge bg-warning-subtle text-warning border border-warning"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`,
                "Rejected": `<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-x-circle me-1"></i>Rejected</span>`,
                "Cancelled": `<span class="badge bg-secondary-subtle text-secondary border border-secondary">Cancelled</span>`
            };

            const typeIcons = {
                "Annual Leave": "bi-sun text-warning",
                "Sick Leave": "bi-heart-pulse text-danger",
                "Casual Leave": "bi-cup-hot text-primary",
                "Maternity Leave": "bi-gender-female text-info",
                "Unpaid Leave": "bi-dash-circle text-secondary"
            };

            return `
                <tr>
                    <td><span class="font-monospace fw-bold text-dark">${r.RequestID}</span></td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-initials bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">
                                ${(emp.FirstName || "E")[0]}${(emp.LastName || "")[0] || ""}
                            </div>
                            <div>
                                <a href="javascript:void(0)" class="fw-bold text-dark text-decoration-none" onclick="App.viewEmployeeProfile('${r.EmployeeID}', 'leave')">
                                    ${emp.FirstName} ${emp.LastName}
                                </a>
                                <div class="text-muted small">${emp.DepartmentID || 'Staff'}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-1">
                            <i class="bi ${typeIcons[r.LeaveType] || 'bi-calendar'} me-1"></i>
                            <span class="fw-semibold">${r.LeaveType}</span>
                        </div>
                    </td>
                    <td>
                        <div class="small fw-semibold text-nowrap">${r.StartDate} <i class="bi bi-arrow-right text-muted mx-1"></i> ${r.EndDate}</div>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border font-monospace px-2 py-1">${r.TotalDays} day${r.TotalDays > 1 ? 's' : ''}</span>
                    </td>
                    <td>
                        <div class="small text-truncate" style="max-width: 220px;" title="${r.Reason}">
                            ${r.Reason || '-'}
                        </div>
                        ${r.ApprovedBy ? `<small class="text-muted d-block" style="font-size: 0.72rem;">Reviewer: ${r.ApprovedBy}</small>` : ''}
                    </td>
                    <td><span class="text-muted small">${r.AppliedDate || '-'}</span></td>
                    <td>${statusBadges[r.Status] || r.Status}</td>
                    <td class="text-end">
                        ${r.Status === 'Pending' ? `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-success py-1 px-2" title="Approve Request" onclick="LeaveMgmt.reviewRequest('${r.RequestID}', 'Approved')">
                                    <i class="bi bi-check-lg"></i>
                                </button>
                                <button class="btn btn-outline-danger py-1 px-2" title="Reject Request" onclick="LeaveMgmt.reviewRequest('${r.RequestID}', 'Rejected')">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ` : `
                            <button class="btn btn-sm btn-outline-secondary py-1 px-2" title="View details" onclick="LeaveMgmt.viewDetails('${r.RequestID}')">
                                <i class="bi bi-eye"></i>
                            </button>
                        `}
                    </td>
                </tr>
            `;
        }).join("");
    }

    function renderBalancesView(container) {
        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">Employee Entitlement Balances</h6>
                        <small class="text-muted">Annual leave cycle & accumulated sick/casual allowances</small>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Annual Leave Balance</th>
                                <th>Sick Leave Balance</th>
                                <th>Casual Leave Balance</th>
                                <th>Unpaid Taken</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeesList.map(emp => {
                                const bal = leaveBalances.find(b => b.EmployeeID === emp.EmployeeID) || {
                                    AnnualEntitled: 15,
                                    AnnualTaken: 0,
                                    SickEntitled: 12,
                                    SickTaken: 0,
                                    CasualEntitled: 5,
                                    CasualTaken: 0,
                                    UnpaidTaken: 0
                                };

                                const annualRem = bal.AnnualEntitled - bal.AnnualTaken;
                                const annualPct = Math.round((bal.AnnualTaken / bal.AnnualEntitled) * 100);

                                const sickRem = bal.SickEntitled - bal.SickTaken;
                                const casualRem = bal.CasualEntitled - bal.CasualTaken;

                                return `
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">
                                                <a href="javascript:void(0)" class="text-decoration-none text-dark" onclick="App.viewEmployeeProfile('${emp.EmployeeID}', 'leave')">
                                                    ${emp.FirstName} ${emp.LastName}
                                                </a>
                                            </div>
                                            <div class="text-muted small font-monospace">${emp.EmployeeCode || emp.EmployeeID}</div>
                                        </td>
                                        <td><span class="small fw-semibold">${emp.DepartmentID || 'General'}</span></td>
                                        <td style="min-width: 180px;">
                                            <div class="d-flex justify-content-between small mb-1">
                                                <span class="fw-bold text-success">${annualRem} remaining</span>
                                                <span class="text-muted">${bal.AnnualTaken} / ${bal.AnnualEntitled} days</span>
                                            </div>
                                            <div class="progress" style="height: 6px;">
                                                <div class="progress-bar bg-success" style="width: ${Math.max(0, 100 - annualPct)}%"></div>
                                            </div>
                                        </td>
                                        <td style="min-width: 150px;">
                                            <div class="small fw-bold">${sickRem} left <span class="text-muted fw-normal">(${bal.SickTaken}/${bal.SickEntitled})</span></div>
                                        </td>
                                        <td style="min-width: 150px;">
                                            <div class="small fw-bold">${casualRem} left <span class="text-muted fw-normal">(${bal.CasualTaken}/${bal.CasualEntitled})</span></div>
                                        </td>
                                        <td>
                                            <span class="badge bg-light text-muted border">${bal.UnpaidTaken} days</span>
                                        </td>
                                        <td class="text-end">
                                            <button class="btn btn-sm btn-outline-secondary py-1 px-2" onclick="LeaveMgmt.openBalanceAdjustModal('${emp.EmployeeID}')">
                                                <i class="bi bi-sliders me-1"></i> Adjust
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderCalendarView(container) {
        // Sort approved leaves chronologically
        const approved = leaveRequests.filter(r => r.Status === "Approved").sort((a, b) => a.StartDate.localeCompare(b.StartDate));

        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3">
                    <h6 class="fw-bold mb-0">Scheduled & Upcoming Employee Leaves</h6>
                    <small class="text-muted">Approved absence schedule across all departments</small>
                </div>
                <div class="card-body p-4">
                    ${approved.length === 0 ? `
                        <div class="text-center py-5 text-muted">
                            <i class="bi bi-calendar-check fs-1 text-secondary opacity-50 d-block mb-2"></i>
                            No upcoming approved leaves currently scheduled.
                        </div>
                    ` : `
                        <div class="timeline-container">
                            <div class="row g-3">
                                ${approved.map(r => {
                                    const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || { FirstName: "Staff", LastName: "" };
                                    return `
                                        <div class="col-md-6 col-lg-4">
                                            <div class="card border border-light-subtle h-100 shadow-none bg-light-subtle">
                                                <div class="card-body p-3">
                                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                                        <span class="badge bg-primary-subtle text-primary fw-semibold">${r.LeaveType}</span>
                                                        <span class="badge bg-white text-dark border font-monospace">${r.TotalDays} day${r.TotalDays > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <h6 class="fw-bold text-dark mb-1">${emp.FirstName} ${emp.LastName}</h6>
                                                    <div class="text-muted small mb-2"><i class="bi bi-building me-1"></i>${emp.DepartmentID || 'Staff'}</div>
                                                    <div class="d-flex align-items-center text-primary fw-semibold small mb-2">
                                                        <i class="bi bi-calendar-event me-2"></i> ${r.StartDate} <span class="mx-1 text-muted">to</span> ${r.EndDate}
                                                    </div>
                                                    <p class="small text-muted mb-0 text-truncate" title="${r.Reason}">
                                                        <i class="bi bi-chat-quote me-1"></i> ${r.Reason || 'No notes specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    function openApplyLeaveModal() {
        const currentUser = Auth.getCurrentUser();
        const defaultEmpId = currentUser && currentUser.EmployeeID ? currentUser.EmployeeID : (employeesList[0] ? employeesList[0].EmployeeID : "");
        const modalId = "applyLeaveModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const todayStr = "2026-11-15";

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-calendar-plus text-primary me-2"></i>Apply for Leave
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-apply-leave">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Employee <span class="text-danger">*</span></label>
                                    <select class="form-select" id="apply-leave-employee" required>
                                        ${employeesList.map(e => `
                                            <option value="${e.EmployeeID}" ${e.EmployeeID === defaultEmpId ? 'selected' : ''}>
                                                ${e.FirstName} ${e.LastName} (${e.EmployeeCode || e.EmployeeID}) - ${e.DepartmentID || 'Staff'}
                                            </option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Leave Category <span class="text-danger">*</span></label>
                                    <select class="form-select" id="apply-leave-type" required>
                                        <option value="Annual Leave">Annual Leave (Vacation)</option>
                                        <option value="Sick Leave">Sick Leave (Medical)</option>
                                        <option value="Casual Leave">Casual Leave (Personal Emergency)</option>
                                        <option value="Maternity Leave">Maternity / Paternity Leave</option>
                                        <option value="Bereavement Leave">Bereavement / Compassionate</option>
                                        <option value="Unpaid Leave">Unpaid Leave</option>
                                        <option value="Study Leave">Study / Exam Leave</option>
                                    </select>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Start Date <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="apply-leave-start" value="${todayStr}" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">End Date <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="apply-leave-end" value="${todayStr}" required>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Total Days Requested</label>
                                    <input type="number" step="0.5" class="form-control font-monospace" id="apply-leave-days" value="1" min="0.5" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Reason & Handover Details <span class="text-danger">*</span></label>
                                    <textarea class="form-control" id="apply-leave-reason" rows="3" placeholder="Provide justification and key handover notes..." required></textarea>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Emergency Contact Phone during Leave</label>
                                    <input type="text" class="form-control" id="apply-leave-contact" placeholder="+1 (555) 000-0000">
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-send me-1"></i> Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const startInput = document.getElementById("apply-leave-start");
        const endInput = document.getElementById("apply-leave-end");
        const daysInput = document.getElementById("apply-leave-days");

        const updateDays = () => {
            const s = new Date(startInput.value);
            const e = new Date(endInput.value);
            if (!isNaN(s) && !isNaN(e) && e >= s) {
                const diffTime = e - s;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                daysInput.value = diffDays;
            }
        };

        startInput.addEventListener("change", updateDays);
        endInput.addEventListener("change", updateDays);

        const form = document.getElementById("form-apply-leave");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const empId = document.getElementById("apply-leave-employee").value;
            const leaveType = document.getElementById("apply-leave-type").value;
            const startDate = startInput.value;
            const endDate = endInput.value;
            const totalDays = parseFloat(daysInput.value) || 1;
            const reason = document.getElementById("apply-leave-reason").value;
            const contact = document.getElementById("apply-leave-contact").value;

            modal.hide();
            API.showLoading("Submitting leave request...");
            const res = await API.call("saveLeaveRequest", {
                EmployeeID: empId,
                LeaveType: leaveType,
                StartDate: startDate,
                EndDate: endDate,
                TotalDays: totalDays,
                Reason: reason,
                Remarks: contact ? `Contact during leave: ${contact}` : ""
            });

            if (res.success) {
                App.showToast("Leave request submitted for review", "success");
                await loadData();
                renderActiveTab();
            } else {
                App.showToast(res.message || "Failed to submit request", "danger");
            }
            API.hideLoading();
        };
    }

    async function reviewRequest(requestId, newStatus) {
        const req = leaveRequests.find(r => r.RequestID === requestId);
        if (!req) return;

        const actionWord = newStatus === "Approved" ? "Approve" : "Reject";
        const currentUser = Auth.getCurrentUser();
        const approverName = currentUser ? `${currentUser.FullName || currentUser.Username} (${currentUser.RoleName || 'Admin'})` : "HR Management";

        App.confirmDialog({
            title: `${actionWord} Leave Request`,
            message: `Are you sure you want to set status to "${newStatus}" for Request ${requestId} (${req.LeaveType}, ${req.TotalDays} days)?`,
            confirmText: actionWord,
            confirmBtnClass: newStatus === "Approved" ? "btn-success" : "btn-danger",
            onConfirm: async () => {
                API.showLoading(`${actionWord}ing leave request...`);
                const res = await API.call("updateLeaveStatus", {
                    id: requestId,
                    status: newStatus,
                    approver: approverName,
                    remarks: `${newStatus} by ${approverName} on ${new Date().toISOString().substring(0, 10)}`
                });

                if (res.success) {
                    App.showToast(`Leave request ${requestId} has been ${newStatus.toLowerCase()}!`, "success");
                    await loadData();
                    renderActiveTab();
                } else {
                    App.showToast(res.message || "Action failed", "danger");
                }
                API.hideLoading();
            }
        });
    }

    function viewDetails(requestId) {
        const r = leaveRequests.find(req => req.RequestID === requestId);
        if (!r) return;
        const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || { FirstName: "Staff", LastName: "" };

        const modalId = "leaveDetailsModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">Leave Request ${r.RequestID}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <table class="table table-sm table-borderless mb-0">
                                <tr><th class="text-muted w-40">Applicant:</th><td class="fw-bold">${emp.FirstName} ${emp.LastName} (${r.EmployeeID})</td></tr>
                                <tr><th class="text-muted">Leave Type:</th><td><span class="badge bg-primary-subtle text-primary">${r.LeaveType}</span></td></tr>
                                <tr><th class="text-muted">Date Range:</th><td>${r.StartDate} to ${r.EndDate} (${r.TotalDays} days)</td></tr>
                                <tr><th class="text-muted">Applied Date:</th><td>${r.AppliedDate || '-'}</td></tr>
                                <tr><th class="text-muted">Status:</th><td><span class="fw-bold">${r.Status}</span></td></tr>
                                <tr><th class="text-muted">Reviewed By:</th><td>${r.ApprovedBy || 'Not reviewed yet'}</td></tr>
                                <tr><th class="text-muted">Review Date:</th><td>${r.ApprovedDate || '-'}</td></tr>
                                <tr><th class="text-muted">Reason:</th><td>${r.Reason || '-'}</td></tr>
                                <tr><th class="text-muted">Notes/Remarks:</th><td>${r.Remarks || '-'}</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }

    function openBalanceAdjustModal(employeeId) {
        const emp = employeesList.find(e => e.EmployeeID === employeeId);
        if (!emp) return;
        const bal = leaveBalances.find(b => b.EmployeeID === employeeId) || {
            AnnualEntitled: 15,
            AnnualTaken: 0,
            SickEntitled: 12,
            SickTaken: 0,
            CasualEntitled: 5,
            CasualTaken: 0,
            UnpaidTaken: 0
        };

        const modalId = "balanceAdjustModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-sliders text-primary me-2"></i>Adjust Leave Entitlement
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <h6 class="fw-bold text-dark mb-3">${emp.FirstName} ${emp.LastName} (${emp.EmployeeCode || emp.EmployeeID})</h6>
                            <form id="form-adjust-balance">
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Annual Leave Entitled</label>
                                        <input type="number" class="form-control" id="bal-annual-entitled" value="${bal.AnnualEntitled}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Annual Leave Taken</label>
                                        <input type="number" class="form-control" id="bal-annual-taken" value="${bal.AnnualTaken}">
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Sick Leave Entitled</label>
                                        <input type="number" class="form-control" id="bal-sick-entitled" value="${bal.SickEntitled}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Sick Leave Taken</label>
                                        <input type="number" class="form-control" id="bal-sick-taken" value="${bal.SickTaken}">
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Casual Leave Entitled</label>
                                        <input type="number" class="form-control" id="bal-casual-entitled" value="${bal.CasualEntitled}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Casual Leave Taken</label>
                                        <input type="number" class="form-control" id="bal-casual-taken" value="${bal.CasualTaken}">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Unpaid Leave Days</label>
                                    <input type="number" class="form-control" id="bal-unpaid-taken" value="${bal.UnpaidTaken}">
                                </div>
                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Balance Adjustments</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const form = document.getElementById("form-adjust-balance");
        form.onsubmit = async (e) => {
            e.preventDefault();
            modal.hide();
            API.showLoading("Saving balance adjustments...");
            const updated = {
                EmployeeID: employeeId,
                AnnualEntitled: parseFloat(document.getElementById("bal-annual-entitled").value) || 0,
                AnnualTaken: parseFloat(document.getElementById("bal-annual-taken").value) || 0,
                SickEntitled: parseFloat(document.getElementById("bal-sick-entitled").value) || 0,
                SickTaken: parseFloat(document.getElementById("bal-sick-taken").value) || 0,
                CasualEntitled: parseFloat(document.getElementById("bal-casual-entitled").value) || 0,
                CasualTaken: parseFloat(document.getElementById("bal-casual-taken").value) || 0,
                UnpaidTaken: parseFloat(document.getElementById("bal-unpaid-taken").value) || 0
            };

            await API.call("saveLeaveBalance", updated);
            await loadData();
            renderActiveTab();
            API.hideLoading();
            App.showToast("Leave balance updated successfully", "success");
        };
    }

    function exportCSV() {
        if (leaveRequests.length === 0) {
            App.showToast("No leave requests to export", "warning");
            return;
        }

        const headers = ["RequestID", "EmployeeID", "EmployeeName", "LeaveType", "StartDate", "EndDate", "TotalDays", "Reason", "AppliedDate", "Status", "ApprovedBy", "ApprovedDate"];
        const rows = leaveRequests.map(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const empName = `"${(emp.FirstName || '')} ${(emp.LastName || '')}"`;
            return [
                r.RequestID,
                r.EmployeeID,
                empName,
                `"${r.LeaveType}"`,
                r.StartDate,
                r.EndDate,
                r.TotalDays,
                `"${(r.Reason || '').replace(/"/g, '""')}"`,
                r.AppliedDate || '',
                r.Status,
                `"${(r.ApprovedBy || '').replace(/"/g, '""')}"`,
                r.ApprovedDate || ''
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ApexHR_Leave_Requests_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        App.showToast("Leave requests CSV exported", "info");
    }

    return {
        render,
        reviewRequest,
        viewDetails,
        openBalanceAdjustModal
    };
})();

window.LeaveMgmt = LeaveMgmt;
