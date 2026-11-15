/**
 * HR Management System - Payroll & Compensation Module
 * 
 * Provides automated payroll runs, salary structures, earnings/deductions breakdown,
 * printable executive payslips, and CSV register export.
 */

const Payroll = (function () {
    let payrollRecords = [];
    let employeesList = [];
    let selectedMonthYear = "2026-11";
    let activeTab = "register"; // "register", "structures"
    let filterStatus = "All";
    let searchQuery = "";

    async function loadData() {
        const [payRes, empRes] = await Promise.all([
            API.call("getPayrollRecords"),
            API.call("getEmployees")
        ]);

        if (payRes.success) {
            payrollRecords = payRes.data || [];
        }
        if (empRes.success) {
            employeesList = empRes.data || [];
        }
    }

    async function render(container) {
        API.showLoading("Loading payroll records...");
        await loadData();
        API.hideLoading();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-cash-stack text-primary me-2"></i><span data-i18n="pay_title">Payroll & Compensation</span></h3>
                    <p class="text-muted mb-0" data-i18n="pay_subtitle">Process monthly payroll runs, manage salary structures, and issue employee payslips.</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-success btn-sm" id="btn-run-payroll">
                        <i class="bi bi-play-circle me-1"></i> <span data-i18n="pay_run_batch">Run Monthly Payroll</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-add-payroll-entry">
                        <i class="bi bi-plus-circle me-1"></i> <span data-i18n="pay_add_entry">Add Salary Entry</span>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="btn-export-payroll">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="pay_export_register">Export Register</span>
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="row g-3 mb-4" id="payroll-kpi-row">
                <!-- Injected via renderKPIs() -->
            </div>

            <!-- Toolbar & Period Selector -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-12 col-md-3">
                            <label class="form-label small fw-semibold mb-1" data-i18n="pay_period">Payroll Period (Month/Year)</label>
                            <input type="month" class="form-control form-control-sm font-monospace" id="payroll-month-selector" value="${selectedMonthYear}">
                        </div>
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1" data-i18n="th_status">Payment Status</label>
                            <select class="form-select form-select-sm" id="payroll-status-filter">
                                <option value="All" ${filterStatus === 'All' ? 'selected' : ''} data-i18n="all_statuses">All Statuses</option>
                                <option value="Paid" ${filterStatus === 'Paid' ? 'selected' : ''} data-i18n="pay_status_paid">Paid</option>
                                <option value="Pending" ${filterStatus === 'Pending' ? 'selected' : ''} data-i18n="pay_status_pending">Pending</option>
                            </select>
                        </div>
                        <div class="col-6 col-md-2">
                            <label class="form-label small fw-semibold mb-1">View Mode</label>
                            <div class="btn-group btn-group-sm w-100" role="group">
                                <button type="button" class="btn ${activeTab === 'register' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-tab-register" data-i18n="pay_tab_register">Register</button>
                                <button type="button" class="btn ${activeTab === 'structures' ? 'btn-primary' : 'btn-outline-primary'}" id="btn-tab-structures" data-i18n="pay_tab_structures">Structures</button>
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-semibold mb-1" data-i18n="search">Search Employee</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control" id="payroll-search-input" placeholder="Search by name, bank, or ID..." value="${searchQuery}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic View Area -->
            <div id="payroll-tab-content">
                <!-- Injected dynamically -->
            </div>
        `;

        attachEventListeners();
        renderView();
    }

    function attachEventListeners() {
        const monthInput = document.getElementById("payroll-month-selector");
        const statusSelect = document.getElementById("payroll-status-filter");
        const searchInput = document.getElementById("payroll-search-input");
        const tabReg = document.getElementById("btn-tab-register");
        const tabStr = document.getElementById("btn-tab-structures");
        const runBatchBtn = document.getElementById("btn-run-payroll");
        const addEntryBtn = document.getElementById("btn-add-payroll-entry");
        const exportBtn = document.getElementById("btn-export-payroll");

        if (monthInput) {
            monthInput.addEventListener("change", (e) => {
                selectedMonthYear = e.target.value;
                renderView();
            });
        }
        if (statusSelect) {
            statusSelect.addEventListener("change", (e) => {
                filterStatus = e.target.value;
                renderView();
            });
        }
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                renderView();
            });
        }
        if (tabReg) {
            tabReg.addEventListener("click", () => {
                activeTab = "register";
                tabReg.className = "btn btn-primary";
                tabStr.className = "btn btn-outline-primary";
                renderView();
            });
        }
        if (tabStr) {
            tabStr.addEventListener("click", () => {
                activeTab = "structures";
                tabStr.className = "btn btn-primary";
                tabReg.className = "btn btn-outline-primary";
                renderView();
            });
        }
        if (runBatchBtn) {
            runBatchBtn.addEventListener("click", () => openBatchRunModal());
        }
        if (addEntryBtn) {
            addEntryBtn.addEventListener("click", () => openEntryModal());
        }
        if (exportBtn) {
            exportBtn.addEventListener("click", exportCSV);
        }
    }

    function renderView() {
        renderKPIs();
        const content = document.getElementById("payroll-tab-content");
        if (!content) return;

        if (activeTab === "register") {
            renderRegisterView(content);
        } else {
            renderStructuresView(content);
        }

        if (window.I18n) {
            I18n.translateDOM(content);
        }
    }

    function renderKPIs() {
        const kpiRow = document.getElementById("payroll-kpi-row");
        if (!kpiRow) return;

        const periodRecords = payrollRecords.filter(r => r.MonthYear === selectedMonthYear);
        const totalNet = periodRecords.reduce((sum, r) => sum + (parseFloat(r.NetSalary) || 0), 0);
        const totalGross = periodRecords.reduce((sum, r) => sum + (parseFloat(r.GrossSalary) || 0), 0);
        const totalDeductions = periodRecords.reduce((sum, r) => sum + (parseFloat(r.TotalDeductions) || 0), 0);
        const paidCount = periodRecords.filter(r => r.PaymentStatus === "Paid").length;
        const pendingCount = periodRecords.filter(r => r.PaymentStatus === "Pending").length;
        const avgNet = periodRecords.length > 0 ? Math.round(totalNet / periodRecords.length) : 0;

        kpiRow.innerHTML = `
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 bg-primary-subtle text-primary">
                    <div class="card-body p-3">
                        <div class="small fw-bold text-uppercase" data-i18n="pay_net_total">${I18n.t('pay_net_total')}</div>
                        <div class="h3 fw-bold mb-0 mt-1">$${Math.round(totalNet).toLocaleString()}</div>
                        <small class="text-primary">${periodRecords.length} staff processed</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="text-muted small fw-bold text-uppercase" data-i18n="pay_gross_total">${I18n.t('pay_gross_total')}</div>
                        <div class="h3 fw-bold mb-0 text-dark mt-1">$${Math.round(totalGross).toLocaleString()}</div>
                        <small class="text-muted">Total compensation</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="text-muted small fw-bold text-uppercase" data-i18n="pay_taxes_ded">${I18n.t('pay_taxes_ded')}</div>
                        <div class="h3 fw-bold mb-0 text-danger mt-1">$${Math.round(totalDeductions).toLocaleString()}</div>
                        <small class="text-muted">Govt tax & pension</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="text-muted small fw-bold text-uppercase" data-i18n="pay_avg_net">${I18n.t('pay_avg_net')}</div>
                        <div class="h3 fw-bold mb-0 text-dark mt-1">$${avgNet.toLocaleString()}</div>
                        <small class="text-muted">Per employee payout</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 bg-success-subtle text-success">
                    <div class="card-body p-3">
                        <div class="small fw-bold text-uppercase" data-i18n="pay_disbursed">${I18n.t('pay_disbursed')}</div>
                        <div class="h3 fw-bold mb-0 mt-1">${paidCount}</div>
                        <small class="text-success">Transfers completed</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card border-0 shadow-sm h-100 ${pendingCount > 0 ? 'bg-warning-subtle text-warning' : 'bg-white'}">
                    <div class="card-body p-3">
                        <div class="small fw-bold text-uppercase ${pendingCount > 0 ? 'text-warning' : 'text-muted'}" data-i18n="pay_pending">${I18n.t('pay_pending')}</div>
                        <div class="h3 fw-bold mb-0 mt-1">${pendingCount}</div>
                        <small class="${pendingCount > 0 ? 'text-warning' : 'text-muted'}">Awaiting disbursement</small>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRegisterView(container) {
        const periodRecords = payrollRecords.filter(r => r.MonthYear === selectedMonthYear);

        let filtered = periodRecords.filter(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const name = `${emp.FirstName || ''} ${emp.LastName || ''}`.toLowerCase();
            const code = (emp.EmployeeCode || '').toLowerCase();
            const bank = (r.BankName || '').toLowerCase();
            const pid = (r.PayrollID || '').toLowerCase();

            if (filterStatus !== "All" && r.PaymentStatus !== filterStatus) return false;
            if (searchQuery) {
                if (!name.includes(searchQuery) && !code.includes(searchQuery) && !bank.includes(searchQuery) && !pid.includes(searchQuery)) {
                    return false;
                }
            }
            return true;
        });

        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">Payroll Register &mdash; ${selectedMonthYear}</h6>
                        <small class="text-muted">Itemized employee compensation, statutory deductions, and net disbursements</small>
                    </div>
                    <span class="badge bg-light text-dark border font-monospace">${filtered.length} entries</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Base Salary</th>
                                <th>Allowances</th>
                                <th>Gross Pay</th>
                                <th>Deductions</th>
                                <th>Net Pay</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="9" class="text-center py-5 text-muted">
                                        <i class="bi bi-wallet fs-1 text-secondary opacity-50 d-block mb-2"></i>
                                        No payroll records found for period <strong>${selectedMonthYear}</strong>.
                                        <div class="mt-2">
                                            <button class="btn btn-sm btn-primary" onclick="Payroll.openBatchRunModal()">
                                                <i class="bi bi-play-circle me-1"></i> Generate Batch for ${selectedMonthYear}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ` : filtered.map(r => {
                                const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {
                                    FirstName: "Employee",
                                    LastName: r.EmployeeID,
                                    EmployeeCode: r.EmployeeID,
                                    DepartmentID: "General"
                                };

                                const totalAllowances = (parseFloat(r.HousingAllowance) || 0) + (parseFloat(r.TransportAllowance) || 0) + (parseFloat(r.Bonus) || 0);

                                const statusBadges = {
                                    "Paid": `<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i>Paid</span>`,
                                    "Pending": `<span class="badge bg-warning-subtle text-warning border border-warning"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`,
                                    "Processing": `<span class="badge bg-info-subtle text-info border border-info">Processing</span>`
                                };

                                return `
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="avatar-initials bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">
                                                    ${(emp.FirstName || "E")[0]}${(emp.LastName || "")[0] || ""}
                                                </div>
                                                <div>
                                                    <a href="javascript:void(0)" class="fw-bold text-dark text-decoration-none" onclick="App.viewEmployeeProfile('${r.EmployeeID}')">
                                                        ${emp.FirstName} ${emp.LastName}
                                                    </a>
                                                    <div class="text-muted small font-monospace" style="font-size: 0.72rem;">
                                                        ${emp.EmployeeCode || r.EmployeeID} &bull; ${r.BankName || 'Bank'} (${r.AccountNumber || '***'})
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span class="small fw-semibold">${emp.DepartmentID || 'Staff'}</span></td>
                                        <td><span class="font-monospace">$${(parseFloat(r.BaseSalary) || 0).toLocaleString()}</span></td>
                                        <td>
                                            <span class="font-monospace text-success">+$${totalAllowances.toLocaleString()}</span>
                                            ${r.Bonus > 0 ? `<span class="badge bg-light text-primary border ms-1">+$${r.Bonus} Bonus</span>` : ''}
                                        </td>
                                        <td><span class="font-monospace fw-semibold">$${(parseFloat(r.GrossSalary) || 0).toLocaleString()}</span></td>
                                        <td><span class="font-monospace text-danger">-$${(parseFloat(r.TotalDeductions) || 0).toLocaleString()}</span></td>
                                        <td>
                                            <span class="font-monospace fw-bold text-success fs-6">$${(parseFloat(r.NetSalary) || 0).toLocaleString()}</span>
                                        </td>
                                        <td>${statusBadges[r.PaymentStatus] || r.PaymentStatus}</td>
                                        <td class="text-end">
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary py-1 px-2" title="Print / View Payslip" onclick="Payroll.viewPayslip('${r.PayrollID}')">
                                                    <i class="bi bi-file-earmark-text"></i> Payslip
                                                </button>
                                                <button class="btn btn-outline-secondary py-1 px-2" title="Toggle Payment Status" onclick="Payroll.toggleStatus('${r.PayrollID}')">
                                                    <i class="bi ${r.PaymentStatus === 'Paid' ? 'bi-arrow-counterclockwise text-warning' : 'bi-check2 text-success'}"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary py-1 px-2" title="Edit Entry" onclick="Payroll.openEntryModal('${r.PayrollID}')">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                            </div>
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

    function renderStructuresView(container) {
        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">Master Salary Structures</h6>
                        <small class="text-muted">Standard compensation tiers, recurring allowances, and tax deduction policies</small>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Employee</th>
                                <th>Position & Department</th>
                                <th>Base Monthly Pay</th>
                                <th>Housing Allowance</th>
                                <th>Transport Allowance</th>
                                <th>Est. Gross Pay</th>
                                <th>Primary Bank Account</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeesList.map(emp => {
                                // Find any payroll record for this employee to extract master structure
                                const pay = payrollRecords.find(p => p.EmployeeID === emp.EmployeeID) || {
                                    BaseSalary: 6500,
                                    HousingAllowance: 750,
                                    TransportAllowance: 350,
                                    BankName: "Standard Commercial Bank",
                                    AccountNumber: "****" + Math.floor(1000 + Math.random() * 9000)
                                };
                                const estGross = (parseFloat(pay.BaseSalary) || 0) + (parseFloat(pay.HousingAllowance) || 0) + (parseFloat(pay.TransportAllowance) || 0);

                                return `
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">
                                                <a href="javascript:void(0)" class="text-decoration-none text-dark" onclick="App.viewEmployeeProfile('${emp.EmployeeID}')">
                                                    ${emp.FirstName} ${emp.LastName}
                                                </a>
                                            </div>
                                            <div class="text-muted small font-monospace">${emp.EmployeeCode || emp.EmployeeID}</div>
                                        </td>
                                        <td>
                                            <div class="small fw-semibold">${emp.PositionID || 'Staff'}</div>
                                            <div class="text-muted small">${emp.DepartmentID || 'General'}</div>
                                        </td>
                                        <td><span class="font-monospace fw-bold">$${(parseFloat(pay.BaseSalary) || 0).toLocaleString()}</span></td>
                                        <td><span class="font-monospace text-muted">$${(parseFloat(pay.HousingAllowance) || 0).toLocaleString()}</span></td>
                                        <td><span class="font-monospace text-muted">$${(parseFloat(pay.TransportAllowance) || 0).toLocaleString()}</span></td>
                                        <td><span class="font-monospace fw-semibold text-primary">$${estGross.toLocaleString()}</span></td>
                                        <td>
                                            <div class="small fw-semibold">${pay.BankName}</div>
                                            <div class="text-muted small font-monospace">${pay.AccountNumber}</div>
                                        </td>
                                        <td class="text-end">
                                            <button class="btn btn-sm btn-outline-secondary py-1 px-2" onclick="Payroll.openStructureModal('${emp.EmployeeID}')">
                                                <i class="bi bi-pencil-square me-1"></i> Edit Structure
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

    function openBatchRunModal() {
        const modalId = "batchRunModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const activeCount = employeesList.filter(e => e.Status === "Active").length;

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-play-circle text-success me-2"></i>Run Monthly Payroll Batch
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <p class="text-muted small">
                                This will generate itemized salary calculations, allowances, and statutory tax deductions for all 
                                <strong>${activeCount} active staff</strong> for the specified period.
                            </p>
                            <form id="form-batch-payroll">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Target Payroll Month <span class="text-danger">*</span></label>
                                    <input type="month" class="form-control" id="batch-payroll-month" value="${selectedMonthYear}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Standard Scheduled Payment Date</label>
                                    <input type="date" class="form-control" id="batch-payment-date" value="${selectedMonthYear}-28">
                                </div>
                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-success">
                                        <i class="bi bi-cpu me-1"></i> Process Batch
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

        const form = document.getElementById("form-batch-payroll");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const month = document.getElementById("batch-payroll-month").value;
            selectedMonthYear = month;
            modal.hide();

            API.showLoading(`Processing payroll run for ${month}...`);
            const res = await API.call("generatePayrollRun", { monthYear: month });
            if (res.success) {
                App.showToast(res.message || `Payroll run completed for ${month}`, "success");
                await loadData();
                renderView();
            } else {
                App.showToast(res.message || "Failed to run payroll", "danger");
            }
            API.hideLoading();
        };
    }

    function openEntryModal(payrollId = null) {
        const existing = payrollId ? payrollRecords.find(p => p.PayrollID === payrollId) : null;
        const modalId = "payrollEntryModal";
        const existingEl = document.getElementById(modalId);
        if (existingEl) existingEl.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${existing ? 'bi-pencil' : 'bi-plus-circle'} text-primary me-2"></i>
                                ${existing ? 'Edit Payroll Entry' : 'Add Monthly Payroll Record'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-payroll-entry">
                                <input type="hidden" id="entry-payroll-id" value="${existing ? existing.PayrollID : ''}">
                                
                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold">Employee <span class="text-danger">*</span></label>
                                        <select class="form-select" id="entry-employee" required ${existing ? 'disabled' : ''}>
                                            ${employeesList.map(e => `
                                                <option value="${e.EmployeeID}" ${existing && existing.EmployeeID === e.EmployeeID ? 'selected' : ''}>
                                                    ${e.FirstName} ${e.LastName} (${e.EmployeeCode || e.EmployeeID}) - ${e.DepartmentID || 'Staff'}
                                                </option>
                                            `).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold">Period Month <span class="text-danger">*</span></label>
                                        <input type="month" class="form-control" id="entry-month" value="${existing ? existing.MonthYear : selectedMonthYear}" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold">Payment Status</label>
                                        <select class="form-select" id="entry-status">
                                            <option value="Paid" ${existing && existing.PaymentStatus === 'Paid' ? 'selected' : ''}>Paid</option>
                                            <option value="Pending" ${!existing || (existing && existing.PaymentStatus === 'Pending') ? 'selected' : ''}>Pending</option>
                                            <option value="Processing" ${existing && existing.PaymentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="card bg-light border-0 p-3 mb-3">
                                    <div class="fw-bold small text-dark mb-2"><i class="bi bi-plus-circle-fill text-success me-1"></i> Earnings & Allowances</div>
                                    <div class="row g-2">
                                        <div class="col-md-3">
                                            <label class="form-label small fw-semibold">Base Salary ($)</label>
                                            <input type="number" class="form-control font-monospace" id="entry-base" value="${existing ? existing.BaseSalary : 7000}" required>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small fw-semibold">Housing ($)</label>
                                            <input type="number" class="form-control font-monospace" id="entry-housing" value="${existing ? existing.HousingAllowance : 800}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small fw-semibold">Transport ($)</label>
                                            <input type="number" class="form-control font-monospace" id="entry-transport" value="${existing ? existing.TransportAllowance : 400}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small fw-semibold">Bonus / Overtime ($)</label>
                                            <input type="number" class="form-control font-monospace" id="entry-bonus" value="${existing ? (existing.Bonus || 0) : 0}">
                                        </div>
                                    </div>
                                </div>

                                <div class="card bg-light border-0 p-3 mb-3">
                                    <div class="fw-bold small text-dark mb-2"><i class="bi bi-dash-circle-fill text-danger me-1"></i> Deductions & Statutory Withholdings</div>
                                    <div class="row g-2">
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold">Income Tax ($)</label>
                                            <input type="number" class="form-control font-monospace text-danger" id="entry-tax" value="${existing ? existing.TaxDeduction : 1200}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold">Social Security / Pension ($)</label>
                                            <input type="number" class="form-control font-monospace text-danger" id="entry-pension" value="${existing ? existing.PensionDeduction : 420}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold">Health Insurance ($)</label>
                                            <input type="number" class="form-control font-monospace text-danger" id="entry-health" value="${existing ? existing.HealthInsurance : 250}">
                                        </div>
                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold">Bank Name</label>
                                        <input type="text" class="form-control" id="entry-bank" value="${existing ? existing.BankName : 'JPMorgan Chase Bank'}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold">Account Number</label>
                                        <input type="text" class="form-control font-monospace" id="entry-acc" value="${existing ? existing.AccountNumber : '****4829'}">
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Payroll Entry</button>
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

        const form = document.getElementById("form-payroll-entry");
        form.onsubmit = async (e) => {
            e.preventDefault();
            modal.hide();
            API.showLoading("Saving payroll record...");

            const entryData = {
                PayrollID: document.getElementById("entry-payroll-id").value || undefined,
                EmployeeID: document.getElementById("entry-employee").value,
                MonthYear: document.getElementById("entry-month").value,
                PaymentStatus: document.getElementById("entry-status").value,
                BaseSalary: parseFloat(document.getElementById("entry-base").value) || 0,
                HousingAllowance: parseFloat(document.getElementById("entry-housing").value) || 0,
                TransportAllowance: parseFloat(document.getElementById("entry-transport").value) || 0,
                Bonus: parseFloat(document.getElementById("entry-bonus").value) || 0,
                TaxDeduction: parseFloat(document.getElementById("entry-tax").value) || 0,
                PensionDeduction: parseFloat(document.getElementById("entry-pension").value) || 0,
                HealthInsurance: parseFloat(document.getElementById("entry-health").value) || 0,
                BankName: document.getElementById("entry-bank").value,
                AccountNumber: document.getElementById("entry-acc").value,
                PaymentDate: document.getElementById("entry-status").value === "Paid" ? new Date().toISOString().substring(0, 10) : ""
            };

            await API.call("savePayrollRecord", entryData);
            await loadData();
            renderView();
            API.hideLoading();
            App.showToast("Payroll entry saved successfully", "success");
        };
    }

    function openStructureModal(employeeId) {
        const emp = employeesList.find(e => e.EmployeeID === employeeId);
        if (!emp) return;
        const pay = payrollRecords.find(p => p.EmployeeID === employeeId) || {
            BaseSalary: 7000,
            HousingAllowance: 800,
            TransportAllowance: 400,
            BankName: "Corporate Bank",
            AccountNumber: "****9000"
        };

        const modalId = "salaryStructureModal";
        const existingEl = document.getElementById(modalId);
        if (existingEl) existingEl.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi bi-sliders text-primary me-2"></i>Edit Salary Structure
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <h6 class="fw-bold text-dark mb-3">${emp.FirstName} ${emp.LastName} (${emp.EmployeeCode || emp.EmployeeID})</h6>
                            <form id="form-structure-save">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Base Monthly Salary ($)</label>
                                    <input type="number" class="form-control font-monospace" id="struct-base" value="${pay.BaseSalary}">
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Housing Allowance ($)</label>
                                        <input type="number" class="form-control font-monospace" id="struct-housing" value="${pay.HousingAllowance}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Transport Allowance ($)</label>
                                        <input type="number" class="form-control font-monospace" id="struct-transport" value="${pay.TransportAllowance}">
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Bank Name</label>
                                        <input type="text" class="form-control" id="struct-bank" value="${pay.BankName}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Account Number</label>
                                        <input type="text" class="form-control font-monospace" id="struct-acc" value="${pay.AccountNumber}">
                                    </div>
                                </div>
                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Update Structure</button>
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

        const form = document.getElementById("form-structure-save");
        form.onsubmit = async (e) => {
            e.preventDefault();
            modal.hide();
            API.showLoading("Updating compensation structure...");

            // Create or update current period record with new structure
            const existingRecord = payrollRecords.find(p => p.EmployeeID === employeeId && p.MonthYear === selectedMonthYear);
            const data = {
                PayrollID: existingRecord ? existingRecord.PayrollID : undefined,
                EmployeeID: employeeId,
                MonthYear: selectedMonthYear,
                BaseSalary: parseFloat(document.getElementById("struct-base").value) || 0,
                HousingAllowance: parseFloat(document.getElementById("struct-housing").value) || 0,
                TransportAllowance: parseFloat(document.getElementById("struct-transport").value) || 0,
                BankName: document.getElementById("struct-bank").value,
                AccountNumber: document.getElementById("struct-acc").value,
                Bonus: existingRecord ? existingRecord.Bonus : 0,
                TaxDeduction: Math.round(((parseFloat(document.getElementById("struct-base").value) || 0) * 0.18)),
                PensionDeduction: Math.round(((parseFloat(document.getElementById("struct-base").value) || 0) * 0.06)),
                HealthInsurance: 250,
                PaymentStatus: existingRecord ? existingRecord.PaymentStatus : "Pending"
            };

            await API.call("savePayrollRecord", data);
            await loadData();
            renderView();
            API.hideLoading();
            App.showToast("Salary structure updated", "success");
        };
    }

    async function toggleStatus(payrollId) {
        const p = payrollRecords.find(item => item.PayrollID === payrollId);
        if (!p) return;

        const newStatus = p.PaymentStatus === "Paid" ? "Pending" : "Paid";
        const paymentDate = newStatus === "Paid" ? new Date().toISOString().substring(0, 10) : "";

        API.showLoading("Updating payment status...");
        await API.call("updatePayrollStatus", {
            id: payrollId,
            status: newStatus,
            paymentDate: paymentDate
        });
        await loadData();
        renderView();
        API.hideLoading();
        App.showToast(`Payroll entry marked as ${newStatus}`, "success");
    }

    function viewPayslip(payrollId) {
        const p = payrollRecords.find(item => item.PayrollID === payrollId);
        if (!p) return;
        const emp = employeesList.find(e => e.EmployeeID === p.EmployeeID) || {
            FirstName: "Employee",
            LastName: p.EmployeeID,
            EmployeeCode: p.EmployeeID,
            DepartmentID: "General",
            PositionID: "Staff"
        };

        const modalId = "payslipModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const base = parseFloat(p.BaseSalary) || 0;
        const housing = parseFloat(p.HousingAllowance) || 0;
        const transport = parseFloat(p.TransportAllowance) || 0;
        const bonus = parseFloat(p.Bonus) || 0;
        const gross = parseFloat(p.GrossSalary) || (base + housing + transport + bonus);

        const tax = parseFloat(p.TaxDeduction) || 0;
        const pension = parseFloat(p.PensionDeduction) || 0;
        const health = parseFloat(p.HealthInsurance) || 0;
        const totalDeductions = parseFloat(p.TotalDeductions) || (tax + pension + health);
        const net = parseFloat(p.NetSalary) || (gross - totalDeductions);

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">Official Salary Payslip</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4" id="printable-payslip-area">
                            <!-- Official Header -->
                            <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                                <div>
                                    <h4 class="fw-bold text-dark mb-0">Apex Corporate Technologies</h4>
                                    <div class="text-muted small">Human Resources & Payroll Department</div>
                                    <small class="text-muted">1000 Enterprise Plaza, Suite 400, Seattle, WA</small>
                                </div>
                                <div class="text-end">
                                    <span class="badge bg-dark font-monospace text-uppercase px-2 py-1">Confidential Payslip</span>
                                    <div class="fw-bold font-monospace text-primary mt-1">${p.PayrollID}</div>
                                    <div class="small text-muted">Period: <strong>${p.MonthYear}</strong></div>
                                </div>
                            </div>

                            <!-- Employee Information Grid -->
                            <div class="row g-2 mb-3 bg-light p-3 rounded">
                                <div class="col-6 col-md-3">
                                    <small class="text-muted text-uppercase d-block" style="font-size: 0.72rem;">Employee Name</small>
                                    <span class="fw-bold text-dark">${emp.FirstName} ${emp.LastName}</span>
                                </div>
                                <div class="col-6 col-md-3">
                                    <small class="text-muted text-uppercase d-block" style="font-size: 0.72rem;">Employee Code</small>
                                    <span class="font-monospace fw-semibold">${emp.EmployeeCode || p.EmployeeID}</span>
                                </div>
                                <div class="col-6 col-md-3">
                                    <small class="text-muted text-uppercase d-block" style="font-size: 0.72rem;">Department / Role</small>
                                    <span class="small">${emp.DepartmentID || 'General'} / ${emp.PositionID || 'Staff'}</span>
                                </div>
                                <div class="col-6 col-md-3">
                                    <small class="text-muted text-uppercase d-block" style="font-size: 0.72rem;">Bank Account</small>
                                    <span class="font-monospace small">${p.BankName} (${p.AccountNumber})</span>
                                </div>
                            </div>

                            <!-- Financial Breakdown (2 Columns) -->
                            <div class="row g-3 mb-3">
                                <!-- Earnings Column -->
                                <div class="col-md-6">
                                    <div class="card border border-success-subtle h-100">
                                        <div class="card-header bg-success-subtle text-success py-2 fw-bold small text-uppercase">
                                            <i class="bi bi-plus-circle me-1"></i> Earnings & Allowances
                                        </div>
                                        <div class="card-body p-2">
                                            <table class="table table-sm table-borderless mb-0">
                                                <tr><td>Basic Salary</td><td class="text-end font-monospace">$${base.toFixed(2)}</td></tr>
                                                <tr><td>Housing Allowance</td><td class="text-end font-monospace">$${housing.toFixed(2)}</td></tr>
                                                <tr><td>Transport Allowance</td><td class="text-end font-monospace">$${transport.toFixed(2)}</td></tr>
                                                <tr><td>Bonus / Incentive</td><td class="text-end font-monospace">$${bonus.toFixed(2)}</td></tr>
                                                <tr class="border-top fw-bold text-dark">
                                                    <td>Total Gross Earnings</td>
                                                    <td class="text-end font-monospace text-primary">$${gross.toFixed(2)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <!-- Deductions Column -->
                                <div class="col-md-6">
                                    <div class="card border border-danger-subtle h-100">
                                        <div class="card-header bg-danger-subtle text-danger py-2 fw-bold small text-uppercase">
                                            <i class="bi bi-dash-circle me-1"></i> Statutory Deductions
                                        </div>
                                        <div class="card-body p-2">
                                            <table class="table table-sm table-borderless mb-0">
                                                <tr><td>Income Tax (Withheld)</td><td class="text-end font-monospace text-danger">-$${tax.toFixed(2)}</td></tr>
                                                <tr><td>Social Security / Pension</td><td class="text-end font-monospace text-danger">-$${pension.toFixed(2)}</td></tr>
                                                <tr><td>Health Insurance Policy</td><td class="text-end font-monospace text-danger">-$${health.toFixed(2)}</td></tr>
                                                <tr><td class="text-muted small">Other Deductions</td><td class="text-end font-monospace text-muted">$0.00</td></tr>
                                                <tr class="border-top fw-bold text-dark">
                                                    <td>Total Deductions</td>
                                                    <td class="text-end font-monospace text-danger">-$${totalDeductions.toFixed(2)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Net Payout Box -->
                            <div class="card bg-success-subtle border-success p-3 text-center mb-3">
                                <div class="text-success small fw-bold text-uppercase">Net Salary Disbursed</div>
                                <div class="display-6 fw-bold font-monospace text-success my-1">$${net.toFixed(2)}</div>
                                <div class="small text-muted">
                                    Payment Status: <span class="badge ${p.PaymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}">${p.PaymentStatus}</span>
                                    ${p.PaymentDate ? `&bull; Paid on ${p.PaymentDate}` : ''}
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                                <div>Generated by ApexHR Enterprise Suite</div>
                                <div>Computer-generated document &mdash; no signature required</div>
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.print()">
                                <i class="bi bi-printer me-1"></i> Print Payslip
                            </button>
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

    function exportCSV() {
        const periodRecords = payrollRecords.filter(r => r.MonthYear === selectedMonthYear);
        if (periodRecords.length === 0) {
            App.showToast(`No payroll records to export for ${selectedMonthYear}`, "warning");
            return;
        }

        const headers = ["PayrollID", "MonthYear", "EmployeeID", "EmployeeName", "BaseSalary", "HousingAllowance", "TransportAllowance", "Bonus", "GrossSalary", "TaxDeduction", "PensionDeduction", "HealthInsurance", "TotalDeductions", "NetSalary", "PaymentStatus", "PaymentDate", "BankName", "AccountNumber"];
        const rows = periodRecords.map(r => {
            const emp = employeesList.find(e => e.EmployeeID === r.EmployeeID) || {};
            const empName = `"${(emp.FirstName || '')} ${(emp.LastName || '')}"`;
            return [
                r.PayrollID,
                r.MonthYear,
                r.EmployeeID,
                empName,
                r.BaseSalary,
                r.HousingAllowance,
                r.TransportAllowance,
                r.Bonus || 0,
                r.GrossSalary,
                r.TaxDeduction,
                r.PensionDeduction,
                r.HealthInsurance,
                r.TotalDeductions,
                r.NetSalary,
                r.PaymentStatus,
                r.PaymentDate || '',
                `"${r.BankName || ''}"`,
                `"${r.AccountNumber || ''}"`
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ApexHR_Payroll_${selectedMonthYear}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        App.showToast("Payroll register CSV exported", "info");
    }

    return {
        render,
        viewPayslip,
        toggleStatus,
        openEntryModal,
        openStructureModal,
        openBatchRunModal
    };
})();

window.Payroll = Payroll;
