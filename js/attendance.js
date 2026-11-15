/**
 * HR Management System - Attendance & Time Tracking Module
 * 
 * Provides daily/historical attendance tracking, clock in/out,
 * real-time KPIs, department filtering, and CSV export.
 */

const Attendance = (function () {
    let attendanceRecords = [];
    let employeesList = [];
    let selectedDate = "2026-11-15"; // default demo anchor
    let filterStatus = "All";
    let filterDepartment = "All";
    let searchQuery = "";

    async function loadData() {
        const [attRes, empRes] = await Promise.all([
            API.call("getAttendance"),
            API.call("getEmployees")
        ]);

        if (attRes.success) {
            attendanceRecords = attRes.data || [];
        }
        if (empRes.success) {
            employeesList = empRes.data || [];
        }
    }

    async function render(container) {
        API.showLoading("Loading attendance data...");
        await loadData();
        API.hideLoading();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-clock-history text-primary me-2"></i><span data-i18n="att_title">Attendance & Time Tracking</span></h3>
                    <p class="text-muted mb-0" data-i18n="att_subtitle">Monitor daily punch logs, punctuality, remote work, and shift durations.</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-outline-success btn-sm" id="btn-self-punch">
                        <i class="bi bi-fingerprint me-1"></i> <span data-i18n="att_quick_punch">Quick Clock In/Out</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-record-attendance">
                        <i class="bi bi-plus-circle me-1"></i> <span data-i18n="att_log_entry">Log Attendance Entry</span>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="btn-export-attendance">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="btn_export">Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- KPI Summary Cards -->
            <div class="row g-3 mb-4" id="attendance-kpi-row">
                <!-- Injected via updateKPIs() -->
            </div>

            <!-- Filter Controls Toolbar -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-12 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Attendance Date</label>
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary" type="button" id="btn-date-prev" title="Previous Day"><i class="bi bi-chevron-left"></i></button>
                                <input type="date" class="form-control" id="filter-att-date" value="${selectedDate}">
                                <button class="btn btn-outline-secondary" type="button" id="btn-date-next" title="Next Day"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Department</label>
                            <select class="form-select form-select-sm" id="filter-att-dept">
                                <option value="All">All Departments</option>
                                ${getDepartmentOptions()}
                            </select>
                        </div>
                        <div class="col-6 col-md-2">
                            <label class="form-label small fw-semibold mb-1">Status</label>
                            <select class="form-select form-select-sm" id="filter-att-status">
                                <option value="All">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Late">Late</option>
                                <option value="Work From Home">Work From Home</option>
                                <option value="Half Day">Half Day</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-semibold mb-1">Search Employee</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control" id="filter-att-search" placeholder="Search by name or code..." value="${searchQuery}">
                                <button class="btn btn-outline-secondary" type="button" id="btn-mark-all-present" title="Mark all active present for this date">
                                    <i class="bi bi-check-all me-1"></i> Auto-Mark
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Attendance Records Table Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">Daily Attendance Log</h6>
                        <small class="text-muted" id="att-table-subtitle">Records for date: ${selectedDate}</small>
                    </div>
                    <span class="badge bg-light text-dark border font-monospace" id="att-record-count">0 entries</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Employee</th>
                                <th>Department & Role</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Work Hours</th>
                                <th>Work Location</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-table-body">
                            <!-- Injected dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        attachEventListeners();
        renderTableAndKPIs();
    }

    function getDepartmentOptions() {
        const depts = [...new Set(employeesList.map(e => e.DepartmentID).filter(Boolean))];
        return depts.map(d => `<option value="${d}">${d}</option>`).join("");
    }

    function attachEventListeners() {
        const dateInput = document.getElementById("filter-att-date");
        const deptSelect = document.getElementById("filter-att-dept");
        const statusSelect = document.getElementById("filter-att-status");
        const searchInput = document.getElementById("filter-att-search");
        const prevBtn = document.getElementById("btn-date-prev");
        const nextBtn = document.getElementById("btn-date-next");
        const markAllBtn = document.getElementById("btn-mark-all-present");
        const exportBtn = document.getElementById("btn-export-attendance");
        const punchBtn = document.getElementById("btn-self-punch");
        const recordBtn = document.getElementById("btn-record-attendance");

        if (dateInput) {
            dateInput.addEventListener("change", (e) => {
                selectedDate = e.target.value;
                document.getElementById("att-table-subtitle").textContent = `Records for date: ${selectedDate}`;
                renderTableAndKPIs();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                selectedDate = d.toISOString().substring(0, 10);
                dateInput.value = selectedDate;
                document.getElementById("att-table-subtitle").textContent = `Records for date: ${selectedDate}`;
                renderTableAndKPIs();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                selectedDate = d.toISOString().substring(0, 10);
                dateInput.value = selectedDate;
                document.getElementById("att-table-subtitle").textContent = `Records for date: ${selectedDate}`;
                renderTableAndKPIs();
            });
        }

        if (deptSelect) {
            deptSelect.addEventListener("change", (e) => {
                filterDepartment = e.target.value;
                renderTableAndKPIs();
            });
        }

        if (statusSelect) {
            statusSelect.addEventListener("change", (e) => {
                filterStatus = e.target.value;
                renderTableAndKPIs();
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                renderTableAndKPIs();
            });
        }

        if (markAllBtn) {
            markAllBtn.addEventListener("click", () => {
                App.confirmDialog({
                    title: "Auto-Mark Attendance",
                    message: `Mark all active employees present on ${selectedDate} who do not currently have a record?`,
                    confirmText: "Mark All Present",
                    onConfirm: async () => {
                        await autoMarkAllPresent();
                    }
                });
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener("click", exportCSV);
        }

        if (punchBtn) {
            punchBtn.addEventListener("click", openSelfPunchModal);
        }

        if (recordBtn) {
            recordBtn.addEventListener("click", () => openRecordModal());
        }
    }

    function renderTableAndKPIs() {
        const tbody = document.getElementById("attendance-table-body");
        const countBadge = document.getElementById("att-record-count");
        if (!tbody) return;

        // Filter records for selectedDate
        const dayRecords = attendanceRecords.filter(r => r.Date === selectedDate);

        // Calculate KPIs based on active employees vs day records
        const activeEmployees = employeesList.filter(e => e.Status === "Active");
        const totalActive = activeEmployees.length;

        const presentCount = dayRecords.filter(r => r.Status === "Present").length;
        const lateCount = dayRecords.filter(r => r.Status === "Late").length;
        const wfhCount = dayRecords.filter(r => r.Status === "Work From Home").length;
        const onLeaveCount = dayRecords.filter(r => r.Status === "On Leave").length;
        const halfDayCount = dayRecords.filter(r => r.Status === "Half Day").length;
        const totalAccounted = dayRecords.length;
        const absentCount = Math.max(0, totalActive - totalAccounted);

        const totalHoursWorked = dayRecords.reduce((sum, r) => sum + (parseFloat(r.TotalHours) || 0), 0);
        const avgHours = dayRecords.length > 0 ? (totalHoursWorked / dayRecords.length).toFixed(1) : "0.0";

        // Render KPI row
        const kpiRow = document.getElementById("attendance-kpi-row");
        if (kpiRow) {
            kpiRow.innerHTML = `
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-white">
                        <div class="card-body p-3">
                            <div class="text-muted small fw-bold text-uppercase">${window.I18n ? I18n.t("att_scheduled", "Scheduled Staff") : "Scheduled Staff"}</div>
                            <div class="h3 fw-bold mb-0 text-dark mt-1">${totalActive}</div>
                            <small class="text-muted"><i class="bi bi-people me-1"></i>Active headcount</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-success-subtle text-success">
                        <div class="card-body p-3">
                            <div class="small fw-bold text-uppercase">${window.I18n ? I18n.t("att_present_today", "Present Today") : "Present Today"}</div>
                            <div class="h3 fw-bold mb-0 mt-1">${presentCount}</div>
                            <small class="text-success">${totalActive > 0 ? Math.round((presentCount / totalActive) * 100) : 0}% on-premises</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-warning-subtle text-warning">
                        <div class="card-body p-3">
                            <div class="small fw-bold text-uppercase">${window.I18n ? I18n.t("att_late_arrivals", "Late Arrivals") : "Late Arrivals"}</div>
                            <div class="h3 fw-bold mb-0 mt-1">${lateCount}</div>
                            <small class="text-warning">Punctuality alert</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-primary-subtle text-primary">
                        <div class="card-body p-3">
                            <div class="small fw-bold text-uppercase">${window.I18n ? I18n.t("att_remote_wfh", "Remote (WFH)") : "Remote (WFH)"}</div>
                            <div class="h3 fw-bold mb-0 mt-1">${wfhCount}</div>
                            <small class="text-primary">Telecommuting</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-secondary-subtle text-secondary">
                        <div class="card-body p-3">
                            <div class="small fw-bold text-uppercase">${window.I18n ? I18n.t("att_on_leave_off", "On Leave / Off") : "On Leave / Off"}</div>
                            <div class="h3 fw-bold mb-0 mt-1">${onLeaveCount + halfDayCount}</div>
                            <small class="text-secondary">${onLeaveCount} Leave, ${halfDayCount} Half</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-xl-2">
                    <div class="card border-0 shadow-sm h-100 bg-info-subtle text-info">
                        <div class="card-body p-3">
                            <div class="small fw-bold text-uppercase">${window.I18n ? I18n.t("att_avg_shift", "Avg Shift Duration") : "Avg Shift Duration"}</div>
                            <div class="h3 fw-bold mb-0 mt-1">${avgHours}h</div>
                            <small class="text-info">${totalHoursWorked.toFixed(1)} total hours</small>
                        </div>
                    </div>
                </div>
            `;
        }

        // Apply filters to records
        let filtered = dayRecords.filter(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const empName = `${emp.FirstName || ''} ${emp.LastName || ''}`.toLowerCase();
            const empCode = (emp.EmployeeCode || '').toLowerCase();
            const dept = emp.DepartmentID || '';

            if (filterDepartment !== "All" && dept !== filterDepartment) return false;
            if (filterStatus !== "All" && r.Status !== filterStatus) return false;
            if (searchQuery) {
                const matchesName = empName.includes(searchQuery);
                const matchesCode = empCode.includes(searchQuery);
                const matchesRemarks = (r.Remarks || '').toLowerCase().includes(searchQuery);
                if (!matchesName && !matchesCode && !matchesRemarks) return false;
            }
            return true;
        });

        countBadge.textContent = `${filtered.length} entries`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5 text-muted">
                        <i class="bi bi-calendar-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
                        No attendance records found for <strong>${selectedDate}</strong> matching current filters.
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" id="btn-quick-log-empty">
                                <i class="bi bi-plus-circle me-1"></i> Add Entry for Today
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            const emptyBtn = document.getElementById("btn-quick-log-empty");
            if (emptyBtn) emptyBtn.onclick = () => openRecordModal();
            return;
        }

        tbody.innerHTML = filtered.map(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {
                FirstName: "Employee",
                LastName: r.EmployeeID,
                EmployeeCode: r.EmployeeID,
                DepartmentID: "Unassigned",
                PositionID: "Staff"
            };

            const statusBadges = {
                "Present": `<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check2-circle me-1"></i>Present</span>`,
                "Late": `<span class="badge bg-warning-subtle text-warning border border-warning"><i class="bi bi-clock-history me-1"></i>Late</span>`,
                "Work From Home": `<span class="badge bg-primary-subtle text-primary border border-primary"><i class="bi bi-house me-1"></i>WFH</span>`,
                "Half Day": `<span class="badge bg-info-subtle text-info border border-info"><i class="bi bi-pie-chart me-1"></i>Half Day</span>`,
                "On Leave": `<span class="badge bg-secondary-subtle text-secondary border border-secondary"><i class="bi bi-calendar-x me-1"></i>On Leave</span>`,
                "Absent": `<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-x-circle me-1"></i>Absent</span>`
            };

            const hoursVal = parseFloat(r.TotalHours) || 0;
            const hoursBadge = hoursVal >= 8 
                ? `<span class="fw-semibold text-dark">${hoursVal.toFixed(1)} hrs</span>` 
                : (hoursVal > 0 ? `<span class="text-secondary small">${hoursVal.toFixed(1)} hrs</span>` : `<span class="text-muted small">--</span>`);

            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-initials bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 34px; height: 34px; font-size: 0.8rem;">
                                ${(emp.FirstName || "E")[0]}${(emp.LastName || "")[0] || ""}
                            </div>
                            <div>
                                <a href="javascript:void(0)" class="fw-bold text-dark text-decoration-none" onclick="App.viewEmployeeProfile('${r.EmployeeID}')">
                                    ${emp.FirstName} ${emp.LastName}
                                </a>
                                <div class="text-muted font-monospace small" style="font-size: 0.75rem;">${emp.EmployeeCode || r.EmployeeID}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="small fw-semibold">${emp.DepartmentID || 'General'}</div>
                        <div class="text-muted small">${emp.PositionID || 'Staff'}</div>
                    </td>
                    <td>
                        ${r.ClockIn ? `<span class="font-monospace fw-semibold">${r.ClockIn}</span>` : '<span class="text-muted">--:--</span>'}
                    </td>
                    <td>
                        ${r.ClockOut ? `<span class="font-monospace fw-semibold">${r.ClockOut}</span>` : '<span class="text-muted">--:--</span>'}
                    </td>
                    <td>${hoursBadge}</td>
                    <td>
                        <span class="small text-muted"><i class="bi bi-geo-alt me-1"></i>${r.WorkLocation || 'Office HQ'}</span>
                    </td>
                    <td>${statusBadges[r.Status] || `<span class="badge bg-light text-dark border">${r.Status}</span>`}</td>
                    <td class="text-truncate small text-muted" style="max-width: 180px;" title="${r.Remarks || ''}">${r.Remarks || '-'}</td>
                    <td class="text-end">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary py-1 px-2" title="Edit Log" onclick="Attendance.editEntry('${r.AttendanceID}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger py-1 px-2" title="Delete Log" onclick="Attendance.deleteEntry('${r.AttendanceID}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        if (window.I18n) {
            I18n.translateDOM(tbody);
        }
    }

    async function autoMarkAllPresent() {
        API.showLoading("Auto-marking attendance...");
        const dayRecords = attendanceRecords.filter(r => r.Date === selectedDate);
        const existingEmpIds = new Set(dayRecords.map(r => r.EmployeeID));
        const activeEmployees = employeesList.filter(e => e.Status === "Active");
        
        let created = 0;
        for (const emp of activeEmployees) {
            if (!existingEmpIds.has(emp.EmployeeID)) {
                await API.call("saveAttendance", {
                    EmployeeID: emp.EmployeeID,
                    Date: selectedDate,
                    ClockIn: "09:00",
                    ClockOut: "17:30",
                    TotalHours: 8.5,
                    WorkLocation: "Office HQ",
                    Status: "Present",
                    Remarks: "Auto-marked present"
                });
                created++;
            }
        }

        await loadData();
        renderTableAndKPIs();
        API.hideLoading();
        App.showToast(`Auto-marked ${created} employees as Present on ${selectedDate}`, "success");
    }

    function openRecordModal(existingRecord = null) {
        const isEdit = !!existingRecord;
        const currentEmp = existingRecord ? existingRecord.EmployeeID : (employeesList[0] ? employeesList[0].EmployeeID : "");
        const modalId = "attendanceRecordModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'} text-primary me-2"></i>
                                ${isEdit ? 'Edit Attendance Record' : 'Log Attendance Record'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-attendance-modal">
                                <input type="hidden" id="modal-att-id" value="${existingRecord ? existingRecord.AttendanceID : ''}">
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Employee <span class="text-danger">*</span></label>
                                    <select class="form-select" id="modal-att-employee" required ${isEdit ? 'disabled' : ''}>
                                        ${employeesList.map(e => `
                                            <option value="${e.EmployeeID}" ${e.EmployeeID === currentEmp ? 'selected' : ''}>
                                                ${e.FirstName} ${e.LastName} (${e.EmployeeCode || e.EmployeeID}) - ${e.DepartmentID || 'Staff'}
                                            </option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Date <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="modal-att-date" value="${existingRecord ? existingRecord.Date : selectedDate}" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Status <span class="text-danger">*</span></label>
                                        <select class="form-select" id="modal-att-status" required>
                                            <option value="Present" ${existingRecord && existingRecord.Status === 'Present' ? 'selected' : ''}>Present</option>
                                            <option value="Late" ${existingRecord && existingRecord.Status === 'Late' ? 'selected' : ''}>Late</option>
                                            <option value="Work From Home" ${existingRecord && existingRecord.Status === 'Work From Home' ? 'selected' : ''}>Work From Home (WFH)</option>
                                            <option value="Half Day" ${existingRecord && existingRecord.Status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                                            <option value="On Leave" ${existingRecord && existingRecord.Status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                                            <option value="Absent" ${existingRecord && existingRecord.Status === 'Absent' ? 'selected' : ''}>Absent</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Clock In Time</label>
                                        <input type="time" class="form-control" id="modal-att-clockin" value="${existingRecord ? (existingRecord.ClockIn || '09:00') : '09:00'}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Clock Out Time</label>
                                        <input type="time" class="form-control" id="modal-att-clockout" value="${existingRecord ? (existingRecord.ClockOut || '17:30') : '17:30'}">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Work Location</label>
                                    <select class="form-select" id="modal-att-location">
                                        <option value="Office HQ" ${existingRecord && existingRecord.WorkLocation === 'Office HQ' ? 'selected' : ''}>Office HQ (Main Campus)</option>
                                        <option value="Remote (WFH)" ${existingRecord && existingRecord.WorkLocation === 'Remote (WFH)' ? 'selected' : ''}>Remote (Work From Home)</option>
                                        <option value="Branch Office" ${existingRecord && existingRecord.WorkLocation === 'Branch Office' ? 'selected' : ''}>Branch Office</option>
                                        <option value="Client Site" ${existingRecord && existingRecord.WorkLocation === 'Client Site' ? 'selected' : ''}>Client Site / Field</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Remarks & Notes</label>
                                    <textarea class="form-control" id="modal-att-remarks" rows="2" placeholder="e.g. Approved shift swap, client visit, traffic delay...">${existingRecord ? (existingRecord.Remarks || '') : ''}</textarea>
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary" id="btn-save-attendance-submit">
                                        <i class="bi bi-check-lg me-1"></i> ${isEdit ? 'Update Record' : 'Save Record'}
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

        const form = document.getElementById("form-attendance-modal");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const attId = document.getElementById("modal-att-id").value;
            const empId = document.getElementById("modal-att-employee").value;
            const date = document.getElementById("modal-att-date").value;
            const status = document.getElementById("modal-att-status").value;
            const clockIn = document.getElementById("modal-att-clockin").value;
            const clockOut = document.getElementById("modal-att-clockout").value;
            const location = document.getElementById("modal-att-location").value;
            const remarks = document.getElementById("modal-att-remarks").value;

            // Compute total hours
            let totalHours = 0;
            if (clockIn && clockOut && status !== "Absent" && status !== "On Leave") {
                const [h1, m1] = clockIn.split(":").map(Number);
                const [h2, m2] = clockOut.split(":").map(Number);
                const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diffMins > 0) {
                    totalHours = parseFloat((diffMins / 60).toFixed(1));
                }
            }

            modal.hide();
            API.showLoading("Saving attendance record...");
            const res = await API.call("saveAttendance", {
                AttendanceID: attId || undefined,
                EmployeeID: empId,
                Date: date,
                ClockIn: clockIn,
                ClockOut: clockOut,
                TotalHours: totalHours,
                WorkLocation: location,
                Status: status,
                Remarks: remarks
            });

            if (res.success) {
                App.showToast(res.message || "Attendance saved", "success");
                await loadData();
                renderTableAndKPIs();
            } else {
                App.showToast(res.message || "Failed to save attendance", "danger");
            }
            API.hideLoading();
        };
    }

    function openSelfPunchModal() {
        const currentUser = Auth.getCurrentUser() || {
            FullName: "Sarah Jenkins",
            EmployeeID: "EMP-000001"
        };
        const modalId = "selfPunchModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const now = new Date();
        const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const currentDateStr = selectedDate;

        // Check if user already clocked in today
        const existingLog = attendanceRecords.find(r => r.EmployeeID === currentUser.EmployeeID && r.Date === currentDateStr);

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-fingerprint text-success me-2"></i>Quick Attendance Kiosk
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <div class="mb-3">
                                <div class="display-5 fw-bold font-monospace text-primary" id="punch-live-clock">${currentTimeStr}</div>
                                <div class="text-muted small">${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>

                            <div class="card bg-light border-0 p-3 mb-3 text-start">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="text-muted small">Employee:</span>
                                    <span class="fw-bold">${currentUser.FullName || currentUser.Username} (${currentUser.EmployeeID || 'Self'})</span>
                                </div>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="text-muted small">Current Punch Status:</span>
                                    <span>${existingLog ? `<span class="badge bg-success">Punched In at ${existingLog.ClockIn}</span>` : '<span class="badge bg-secondary">Not Punched In Today</span>'}</span>
                                </div>
                                <div class="d-flex align-items-center justify-content-between">
                                    <span class="text-muted small">Location IP / Geo:</span>
                                    <span class="font-monospace small text-muted"><i class="bi bi-shield-check text-success me-1"></i>Verified HQ Terminal</span>
                                </div>
                            </div>

                            <div class="d-flex justify-content-center gap-3">
                                <button class="btn btn-success btn-lg px-4" id="btn-punch-in-action" ${existingLog && existingLog.ClockIn ? 'disabled' : ''}>
                                    <i class="bi bi-box-arrow-in-right me-1"></i> Clock In
                                </button>
                                <button class="btn btn-danger btn-lg px-4" id="btn-punch-out-action" ${!existingLog || existingLog.ClockOut ? 'disabled' : ''}>
                                    <i class="bi bi-box-arrow-right me-1"></i> Clock Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const clockInBtn = document.getElementById("btn-punch-in-action");
        const clockOutBtn = document.getElementById("btn-punch-out-action");

        if (clockInBtn) {
            clockInBtn.onclick = async () => {
                modal.hide();
                API.showLoading("Recording Clock In...");
                const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                const [h, m] = timeNow.split(":").map(Number);
                const isLate = (h > 9 || (h === 9 && m > 15));

                await API.call("saveAttendance", {
                    EmployeeID: currentUser.EmployeeID || "EMP-000001",
                    Date: currentDateStr,
                    ClockIn: timeNow,
                    ClockOut: "",
                    TotalHours: 0,
                    WorkLocation: "Office HQ",
                    Status: isLate ? "Late" : "Present",
                    Remarks: "Self-service kiosk punch in"
                });

                await loadData();
                renderTableAndKPIs();
                API.hideLoading();
                App.showToast(`Punched in successfully at ${timeNow}!`, "success");
            };
        }

        if (clockOutBtn) {
            clockOutBtn.onclick = async () => {
                modal.hide();
                API.showLoading("Recording Clock Out...");
                const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                
                let hours = 8.0;
                if (existingLog && existingLog.ClockIn) {
                    const [h1, m1] = existingLog.ClockIn.split(":").map(Number);
                    const [h2, m2] = timeNow.split(":").map(Number);
                    const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
                    if (diffMins > 0) hours = parseFloat((diffMins / 60).toFixed(1));
                }

                await API.call("saveAttendance", {
                    AttendanceID: existingLog.AttendanceID,
                    EmployeeID: existingLog.EmployeeID,
                    Date: existingLog.Date,
                    ClockIn: existingLog.ClockIn,
                    ClockOut: timeNow,
                    TotalHours: hours,
                    WorkLocation: existingLog.WorkLocation,
                    Status: existingLog.Status,
                    Remarks: (existingLog.Remarks || "") + " | Punched out"
                });

                await loadData();
                renderTableAndKPIs();
                API.hideLoading();
                App.showToast(`Punched out successfully at ${timeNow}! Total hours: ${hours}h`, "info");
            };
        }
    }

    function editEntry(attendanceId) {
        const record = attendanceRecords.find(r => r.AttendanceID === attendanceId);
        if (record) {
            openRecordModal(record);
        }
    }

    function deleteEntry(attendanceId) {
        App.confirmDialog({
            title: "Delete Attendance Entry",
            message: "Are you sure you want to permanently delete this attendance record?",
            confirmText: "Delete",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                API.showLoading("Deleting attendance record...");
                const res = await API.call("deleteAttendance", { id: attendanceId });
                if (res.success) {
                    App.showToast("Attendance record deleted", "success");
                    await loadData();
                    renderTableAndKPIs();
                } else {
                    App.showToast(res.message || "Failed to delete", "danger");
                }
                API.hideLoading();
            }
        });
    }

    function exportCSV() {
        const dayRecords = attendanceRecords.filter(r => r.Date === selectedDate);
        if (dayRecords.length === 0) {
            App.showToast("No records to export for this date", "warning");
            return;
        }

        const headers = ["AttendanceID", "EmployeeID", "EmployeeName", "Department", "Date", "ClockIn", "ClockOut", "TotalHours", "WorkLocation", "Status", "Remarks"];
        const rows = dayRecords.map(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const empName = `"${(emp.FirstName || '')} ${(emp.LastName || '')}"`;
            return [
                r.AttendanceID,
                r.EmployeeID,
                empName,
                `"${emp.DepartmentID || ''}"`,
                r.Date,
                r.ClockIn,
                r.ClockOut,
                r.TotalHours,
                `"${r.WorkLocation || ''}"`,
                r.Status,
                `"${(r.Remarks || '').replace(/"/g, '""')}"`
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ApexHR_Attendance_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        App.showToast("Attendance CSV downloaded", "info");
    }

    return {
        render,
        editEntry,
        deleteEntry,
        openRecordModal
    };
})();

window.Attendance = Attendance;