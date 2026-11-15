/**
 * HR Management System - Reporting & Compliance Module
 * 
 * Generates interactive HR reports with filtering, printing, and CSV export.
 */

const Reports = (function () {
    let activeReportType = "master";
    let reportData = [];

    const REPORT_DEFINITIONS = [
        { id: "master", name: "Employee Master List", icon: "bi-people" },
        { id: "department", name: "Headcount by Department", icon: "bi-diagram-3" },
        { id: "status", name: "Employment Status Report", icon: "bi-hourglass-split" },
        { id: "type", name: "Employment Type Analysis", icon: "bi-briefcase" },
        { id: "new_joiners", name: "New Joiners & Onboarding", icon: "bi-person-plus" },
        { id: "attendance_log", name: "Attendance & Punctuality", icon: "bi-clock-history" },
        { id: "leave_balance", name: "Leave Balances & Absences", icon: "bi-calendar2-range" },
        { id: "recruitment_pipeline", name: "Recruitment & Candidates", icon: "bi-person-badge" },
        { id: "payroll_register", name: "Payroll Register & Compensation", icon: "bi-cash-stack" },
        { id: "expiring_docs", name: "Expiring Documents & Compliance", icon: "bi-file-earmark-exclamation" },
        { id: "expiring_contracts", name: "Expiring Contracts", icon: "bi-file-text" },
        { id: "skills", name: "Organizational Skills Inventory", icon: "bi-award" },
        { id: "training", name: "Training & Certification Log", icon: "bi-patch-check" }
    ];

    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-file-earmark-bar-graph text-primary me-2"></i><span data-i18n="rep_title">Executive HR Reports</span></h3>
                    <p class="text-muted mb-0" data-i18n="rep_subtitle">Generate, review, print, and export compliance and organizational reports.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm" onclick="window.print()">
                        <i class="bi bi-printer me-1"></i> <span data-i18n="btn_print">Print Report</span>
                    </button>
                    <button class="btn btn-success btn-sm" id="btn-export-report">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="btn_export">Export to CSV</span>
                    </button>
                </div>
            </div>

            <!-- Report Type Selector Cards -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3">
                    <div class="d-flex gap-2 flex-wrap" id="report-type-chips">
                        ${REPORT_DEFINITIONS.map((r) => `
                            <button type="button" class="btn btn-sm ${r.id === activeReportType ? 'btn-primary' : 'btn-outline-secondary'} report-chip" data-type="${r.id}">
                                <i class="bi ${r.icon} me-1"></i> ${r.name}
                            </button>
                        `).join("")}
                    </div>
                </div>
            </div>

            <!-- Report Output View Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0" id="report-title-display">Employee Master List</h6>
                        <small class="text-muted" id="report-desc-display">Generated on ${new Date().toLocaleDateString()}</small>
                    </div>
                    <span class="badge bg-light text-dark border" id="report-row-count">0 records</span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive" id="report-table-wrapper">
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                            <span class="ms-2 text-muted">Compiling report data...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupEvents();
        await loadReport(activeReportType);
    }

    function setupEvents() {
        const chips = document.querySelectorAll("#report-type-chips button");
        chips.forEach((c) => {
            c.addEventListener("click", () => {
                chips.forEach((ch) => ch.className = "btn btn-sm btn-outline-secondary report-chip");
                c.className = "btn btn-sm btn-primary report-chip";
                activeReportType = c.getAttribute("data-type");
                loadReport(activeReportType);
            });
        });

        document.getElementById("btn-export-report").onclick = () => exportReportCSV();
    }

    async function loadReport(type) {
        const wrapper = document.getElementById("report-table-wrapper");
        const titleEl = document.getElementById("report-title-display");
        const countEl = document.getElementById("report-row-count");
        const repDef = REPORT_DEFINITIONS.find((r) => r.id === type) || REPORT_DEFINITIONS[0];

        if (titleEl) titleEl.textContent = repDef.name;

        const [empRes, dashRes] = await Promise.all([
            API.call("getEmployees", {}, "GET", true),
            API.call("getDashboardStats", {}, "GET", true)
        ]);

        const employees = (empRes.success && empRes.data) || [];
        const expirations = (dashRes.success && dashRes.data && dashRes.data.upcomingExpirations) || [];

        let columns = [];
        let rows = [];

        switch (type) {
            case "master":
                columns = ["ID", "Name", "Department", "Position", "Manager", "Type", "Status", "Join Date", "Email", "Phone"];
                rows = employees.map((e) => [
                    e.EmployeeID, `${e.FirstName} ${e.LastName}`, e.DepartmentID || '—', e.PositionID || '—',
                    e.ManagerID || '—', e.EmploymentTypeID || 'Permanent', e.EmploymentStatusID || e.Status || 'Active',
                    e.JoinDate || '—', e.WorkEmail || e.PersonalEmail || '—', e.Phone || '—'
                ]);
                break;

            case "department":
                columns = ["Department", "Staff Name", "Employee ID", "Job Title", "Status", "Join Date"];
                rows = employees.map((e) => [
                    e.DepartmentID || 'Unassigned', `${e.FirstName} ${e.LastName}`, e.EmployeeID, e.PositionID || '—',
                    e.EmploymentStatusID || e.Status || 'Active', e.JoinDate || '—'
                ]).sort((a, b) => a[0].localeCompare(b[0]));
                break;

            case "status":
                columns = ["Status", "Employee ID", "Staff Name", "Department", "Position", "Join Date"];
                rows = employees.map((e) => [
                    e.EmploymentStatusID || e.Status || 'Active', e.EmployeeID, `${e.FirstName} ${e.LastName}`,
                    e.DepartmentID || '—', e.PositionID || '—', e.JoinDate || '—'
                ]).sort((a, b) => a[0].localeCompare(b[0]));
                break;

            case "type":
                columns = ["Employment Type", "Employee ID", "Staff Name", "Department", "Contract End Date"];
                rows = employees.map((e) => [
                    e.EmploymentTypeID || 'Permanent', e.EmployeeID, `${e.FirstName} ${e.LastName}`,
                    e.DepartmentID || '—', e.EndDate || 'Indefinite'
                ]);
                break;

            case "new_joiners":
                columns = ["Join Date", "Employee ID", "Staff Name", "Department", "Position", "Probation Status"];
                rows = employees.map((e) => [
                    e.JoinDate || '—', e.EmployeeID, `${e.FirstName} ${e.LastName}`,
                    e.DepartmentID || '—', e.PositionID || '—', e.ProbationStatus || 'Confirmed'
                ]).sort((a, b) => b[0].localeCompare(a[0]));
                break;

            case "attendance_log": {
                const attRes = await API.call("getAttendance");
                const attRecords = (attRes.success && attRes.data) || [];
                columns = ["Date", "Employee ID", "Staff Name", "Department", "Clock In", "Clock Out", "Hours", "Location", "Status"];
                rows = attRecords.map(r => {
                    const emp = employees.find(e => e.EmployeeID === r.EmployeeID) || {};
                    return [
                        r.Date, r.EmployeeID, `${emp.FirstName || ''} ${emp.LastName || ''}`,
                        emp.DepartmentID || 'General', r.ClockIn || '—', r.ClockOut || '—',
                        r.TotalHours || '0', r.WorkLocation || 'HQ', r.Status
                    ];
                }).sort((a, b) => b[0].localeCompare(a[0]));
                break;
            }

            case "leave_balance": {
                const balRes = await API.call("getLeaveBalances");
                const balances = (balRes.success && balRes.data) || [];
                columns = ["Employee ID", "Staff Name", "Department", "Annual Entitled", "Annual Taken", "Annual Balance", "Sick Taken", "Casual Taken", "Unpaid Taken"];
                rows = employees.map(emp => {
                    const b = balances.find(item => item.EmployeeID === emp.EmployeeID) || {
                        AnnualEntitled: 15, AnnualTaken: 0, SickTaken: 0, CasualTaken: 0, UnpaidTaken: 0
                    };
                    const rem = (b.AnnualEntitled || 0) - (b.AnnualTaken || 0);
                    return [
                        emp.EmployeeID, `${emp.FirstName} ${emp.LastName}`, emp.DepartmentID || 'General',
                        b.AnnualEntitled, b.AnnualTaken, `${rem} days`,
                        b.SickTaken || 0, b.CasualTaken || 0, b.UnpaidTaken || 0
                    ];
                });
                break;
            }

            case "recruitment_pipeline": {
                const [jobRes, canRes] = await Promise.all([API.call("getJobOpenings"), API.call("getCandidates")]);
                const jobs = (jobRes.success && jobRes.data) || [];
                const cands = (canRes.success && canRes.data) || [];
                columns = ["Candidate ID", "Candidate Name", "Target Job", "Current Role", "Experience", "Stage", "Rating", "Email", "Applied Date"];
                rows = cands.map(c => {
                    const j = jobs.find(job => job.JobID === c.JobID) || {};
                    return [
                        c.CandidateID, c.FullName, j.JobTitle || c.JobID,
                        c.CurrentRole || '—', `${c.ExperienceYears || 0} yrs`,
                        c.Stage, `${c.Rating || 0}/5 Stars`, c.Email, c.AppliedDate || '—'
                    ];
                });
                break;
            }

            case "payroll_register": {
                const payRes = await API.call("getPayrollRecords");
                const payroll = (payRes.success && payRes.data) || [];
                columns = ["Payroll ID", "Month", "Employee ID", "Staff Name", "Base Pay", "Gross Salary", "Deductions", "Net Salary", "Payment Status", "Bank Account"];
                rows = payroll.map(p => {
                    const emp = employees.find(e => e.EmployeeID === p.EmployeeID) || {};
                    return [
                        p.PayrollID, p.MonthYear, p.EmployeeID, `${emp.FirstName || ''} ${emp.LastName || ''}`,
                        `$${(parseFloat(p.BaseSalary) || 0).toLocaleString()}`,
                        `$${(parseFloat(p.GrossSalary) || 0).toLocaleString()}`,
                        `-$${(parseFloat(p.TotalDeductions) || 0).toLocaleString()}`,
                        `$${(parseFloat(p.NetSalary) || 0).toLocaleString()}`,
                        p.PaymentStatus, `${p.BankName || ''} (${p.AccountNumber || ''})`
                    ];
                });
                break;
            }

            case "expiring_docs":
            case "expiring_contracts":
                columns = ["Staff ID", "Employee Name", "Document / Record", "Expiry Date", "Days Remaining", "Compliance Status"];
                rows = expirations.map((x) => [
                    x.employeeId, x.employeeName, x.documentName, x.expiryDate,
                    x.daysRemaining < 0 ? `${Math.abs(x.daysRemaining)}d ago` : `${x.daysRemaining}d`,
                    x.status
                ]);
                break;

            default:
                columns = ["ID", "Name", "Department", "Position", "Status"];
                rows = employees.map((e) => [e.EmployeeID, `${e.FirstName} ${e.LastName}`, e.DepartmentID, e.PositionID, e.Status]);
                break;
        }

        reportData = { columns, rows, title: repDef.name };

        if (countEl) countEl.textContent = `${rows.length} records`;

        if (!wrapper) return;

        if (rows.length === 0) {
            wrapper.innerHTML = `<div class="text-center py-5 text-muted">No records match this report criteria.</div>`;
            return;
        }

        wrapper.innerHTML = `
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        ${columns.map((c) => `<th class="text-nowrap">${c}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((r) => `
                        <tr>
                            ${r.map((cell, idx) => {
                                if (idx === 0) return `<td class="fw-semibold font-monospace text-nowrap">${cell}</td>`;
                                if (cell === "Active" || cell === "Valid") return `<td class="text-nowrap"><span class="badge bg-success">${cell}</span></td>`;
                                if (cell === "Probation" || cell === "Expiring Soon") return `<td class="text-nowrap"><span class="badge bg-warning text-dark">${cell}</span></td>`;
                                if (cell === "Expired" || cell === "Terminated") return `<td class="text-nowrap"><span class="badge bg-danger">${cell}</span></td>`;
                                return `<td class="text-nowrap">${cell}</td>`;
                            }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        if (window.I18n) {
            I18n.translateDOM(wrapper);
        }
    }

    function exportReportCSV() {
        if (!reportData || !reportData.rows || reportData.rows.length === 0) {
            App.showToast("No data to export", "warning");
            return;
        }

        const headers = reportData.columns.join(",");
        const rows = reportData.rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
        const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encoded = encodeURI(csv);
        const link = document.createElement("a");
        link.setAttribute("href", encoded);
        link.setAttribute("download", `HR_Report_${activeReportType}_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        App.showToast("Report exported to CSV", "success");
    }

    return {
        render
    };
})();

window.Reports = Reports;