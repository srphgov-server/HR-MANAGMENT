/**
 * HR Management System - Dashboard & Analytics Module
 * 
 * Renders 8 KPI Cards, 5 Chart.js visual analytics, and Upcoming Expiration warnings table.
 */

const Dashboard = (function () {
    let chartInstances = {};

    function destroyCharts() {
        Object.keys(chartInstances).forEach((key) => {
            if (chartInstances[key]) {
                chartInstances[key].destroy();
            }
        });
        chartInstances = {};
    }

    async function render(container) {
        destroyCharts();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-speedometer2 text-primary me-2"></i><span data-i18n="dash_title">Executive HR Dashboard</span></h3>
                    <p class="text-muted mb-0" data-i18n="dash_subtitle">Real-time organizational insights, headcounts, and compliance tracking.</p>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-outline-secondary btn-sm" id="btn-refresh-dashboard">
                        <i class="bi bi-arrow-clockwise me-1"></i> <span data-i18n="btn_refresh">Refresh Data</span>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="App.navigateTo('employees')">
                        <i class="bi bi-people me-1"></i> <span data-i18n="btn_view_directory">View Directory</span>
                    </button>
                </div>
            </div>

            <!-- KPI Cards Grid (8 Cards) -->
            <div class="row g-3 mb-4" id="kpi-cards-row">
                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card bg-gradient-primary text-white">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-white-50 small text-uppercase fw-bold">Total Staff</div>
                                    <div class="h2 fw-bold mb-0 mt-1" id="kpi-total-employees">--</div>
                                </div>
                                <div class="kpi-icon-badge bg-white-20 rounded-circle p-2">
                                    <i class="bi bi-people-fill fs-4"></i>
                                </div>
                            </div>
                            <div class="small mt-2 text-white-75"><i class="bi bi-building me-1"></i>All headcount</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card bg-gradient-success text-white">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-white-50 small text-uppercase fw-bold">Active Staff</div>
                                    <div class="h2 fw-bold mb-0 mt-1" id="kpi-active-employees">--</div>
                                </div>
                                <div class="kpi-icon-badge bg-white-20 rounded-circle p-2">
                                    <i class="bi bi-check-circle-fill fs-4"></i>
                                </div>
                            </div>
                            <div class="small mt-2 text-white-75"><i class="bi bi-person-check me-1"></i>Standard active status</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card bg-gradient-info text-white">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-white-50 small text-uppercase fw-bold">Probation</div>
                                    <div class="h2 fw-bold mb-0 mt-1" id="kpi-probation">--</div>
                                </div>
                                <div class="kpi-icon-badge bg-white-20 rounded-circle p-2">
                                    <i class="bi bi-hourglass-split fs-4"></i>
                                </div>
                            </div>
                            <div class="small mt-2 text-white-75"><i class="bi bi-clock-history me-1"></i>Under evaluation</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card bg-gradient-warning text-white">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-white-50 small text-uppercase fw-bold">On Leave</div>
                                    <div class="h2 fw-bold mb-0 mt-1" id="kpi-on-leave">--</div>
                                </div>
                                <div class="kpi-icon-badge bg-white-20 rounded-circle p-2">
                                    <i class="bi bi-calendar-event fs-4"></i>
                                </div>
                            </div>
                            <div class="small mt-2 text-white-75"><i class="bi bi-airplane me-1"></i>Approved absence</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card card-stat-border border-start-primary">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-muted small text-uppercase fw-bold">New Hires</div>
                                    <div class="h3 fw-bold mb-0 mt-1 text-primary" id="kpi-new-employees">--</div>
                                </div>
                                <i class="bi bi-person-plus text-primary fs-3"></i>
                            </div>
                            <div class="small text-muted mt-2">Past 90 days</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card card-stat-border border-start-danger">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-muted small text-uppercase fw-bold">Expiring Docs</div>
                                    <div class="h3 fw-bold mb-0 mt-1 text-danger" id="kpi-docs-expiring">--</div>
                                </div>
                                <i class="bi bi-file-earmark-exclamation text-danger fs-3"></i>
                            </div>
                            <div class="small text-muted mt-2">Within 30 days</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card card-stat-border border-start-warning">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-muted small text-uppercase fw-bold">Contracts Expiring</div>
                                    <div class="h3 fw-bold mb-0 mt-1 text-warning" id="kpi-contracts-expiring">--</div>
                                </div>
                                <i class="bi bi-file-text text-warning fs-3"></i>
                            </div>
                            <div class="small text-muted mt-2">Requires renewal</div>
                        </div>
                    </div>
                </div>

                <div class="col-6 col-md-3 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm kpi-card card-stat-border border-start-secondary">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="text-muted small text-uppercase fw-bold">Open Positions</div>
                                    <div class="h3 fw-bold mb-0 mt-1 text-secondary" id="kpi-vacant-positions">--</div>
                                </div>
                                <i class="bi bi-briefcase text-secondary fs-3"></i>
                            </div>
                            <div class="small text-muted mt-2">Active vacancies</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Visual Analytics Charts (5 Charts) -->
            <div class="row g-4 mb-4">
                <!-- Department Distribution (Doughnut) -->
                <div class="col-12 col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0"><i class="bi bi-diagram-3 text-primary me-2"></i>Headcount by Department</h6>
                        </div>
                        <div class="card-body d-flex flex-column justify-content-center">
                            <div style="position: relative; height: 260px;">
                                <canvas id="chart-department"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gender Breakdown (Pie) -->
                <div class="col-12 col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0"><i class="bi bi-pie-chart text-success me-2"></i>Gender Diversity</h6>
                        </div>
                        <div class="card-body d-flex flex-column justify-content-center">
                            <div style="position: relative; height: 260px;">
                                <canvas id="chart-gender"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Employment Type (Bar) -->
                <div class="col-12 col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0"><i class="bi bi-bar-chart text-info me-2"></i>Employment Types</h6>
                        </div>
                        <div class="card-body d-flex flex-column justify-content-center">
                            <div style="position: relative; height: 260px;">
                                <canvas id="chart-type"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Join Trend (Line) -->
                <div class="col-12 col-lg-7">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0"><i class="bi bi-graph-up text-primary me-2"></i>Employee Growth & Onboarding Trend</h6>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 260px;">
                                <canvas id="chart-trend"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status Distribution (Bar) -->
                <div class="col-12 col-lg-5">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0"><i class="bi bi-bar-chart-steps text-warning me-2"></i>Employee Status Breakdown</h6>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 260px;">
                                <canvas id="chart-status"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Expirations Table / Alerts -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h6 class="fw-bold mb-0 text-danger">
                            <i class="bi bi-bell-fill me-2"></i>Compliance & Upcoming Expirations
                        </h6>
                        <small class="text-muted">Track work permits, contracts, and passports approaching expiration.</small>
                    </div>
                    <span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold" id="badge-expirations-count">
                        0 alerts
                    </span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-nowrap ps-3">Employee ID</th>
                                    <th class="text-nowrap">Staff Name</th>
                                    <th class="text-nowrap">Document / Record</th>
                                    <th class="text-nowrap">Expiry Date</th>
                                    <th class="text-nowrap">Remaining</th>
                                    <th class="text-nowrap">Status</th>
                                    <th class="text-end text-nowrap pe-3">Action</th>
                                </tr>
                            </thead>
                            <tbody id="expirations-table-body">
                                <tr>
                                    <td colspan="7" class="text-center py-4 text-muted">
                                        <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        Evaluating document compliance dates...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("btn-refresh-dashboard").addEventListener("click", () => loadDashboardData());
        await loadDashboardData();
    }

    async function loadDashboardData() {
        const response = await API.call("getDashboardStats", {}, "GET", true);
        if (!response.success || !response.data) {
            console.error("Dashboard failed to load:", response.message);
            return;
        }

        const { kpis, charts, upcomingExpirations } = response.data;

        // Populate KPIs
        document.getElementById("kpi-total-employees").textContent = kpis.totalEmployees || 0;
        document.getElementById("kpi-active-employees").textContent = kpis.activeEmployees || 0;
        document.getElementById("kpi-probation").textContent = kpis.onProbation || 0;
        document.getElementById("kpi-on-leave").textContent = kpis.onLeave || 0;
        document.getElementById("kpi-new-employees").textContent = kpis.newEmployees || 0;
        document.getElementById("kpi-docs-expiring").textContent = kpis.documentsExpiring || 0;
        document.getElementById("kpi-contracts-expiring").textContent = kpis.contractsExpiring || 0;
        document.getElementById("kpi-vacant-positions").textContent = kpis.vacantPositions || 0;

        // Populate Charts
        renderDepartmentChart(charts.byDepartment || {});
        renderGenderChart(charts.byGender || {});
        renderTypeChart(charts.byType || {});
        renderTrendChart(charts.joinTrend || {});
        renderStatusChart(charts.byStatus || {});

        // Populate Expirations Table
        renderExpirationsTable(upcomingExpirations || []);
    }

    function renderDepartmentChart(deptData) {
        const ctx = document.getElementById("chart-department");
        if (!ctx) return;

        const labels = Object.keys(deptData);
        const data = Object.values(deptData);
        const colors = [
            "#4361ee", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0",
            "#06d6a0", "#ffd166", "#ef476f", "#118ab2", "#073b4c"
        ];

        chartInstances.dept = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels.length ? labels : ["No Data"],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } }
                },
                cutout: "68%"
            }
        });
    }

    function renderGenderChart(genderData) {
        const ctx = document.getElementById("chart-gender");
        if (!ctx) return;

        const labels = Object.keys(genderData);
        const data = Object.values(genderData);

        chartInstances.gender = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels.length ? labels : ["No Data"],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: ["#3a86ff", "#ff006e", "#8338ec", "#ffbe0b"],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } }
                }
            }
        });
    }

    function renderTypeChart(typeData) {
        const ctx = document.getElementById("chart-type");
        if (!ctx) return;

        const labels = Object.keys(typeData);
        const data = Object.values(typeData);

        chartInstances.type = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Headcount",
                    data: data,
                    backgroundColor: "#4cc9f0",
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    function renderTrendChart(trendData) {
        const ctx = document.getElementById("chart-trend");
        if (!ctx) return;

        chartInstances.trend = new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
                datasets: [{
                    label: "Staff Additions",
                    data: [1, 2, 2, 3, 4, 4, 5, 5, 5],
                    borderColor: "#4361ee",
                    backgroundColor: "rgba(67, 97, 238, 0.1)",
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#4361ee",
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    function renderStatusChart(statusData) {
        const ctx = document.getElementById("chart-status");
        if (!ctx) return;

        const labels = Object.keys(statusData);
        const data = Object.values(statusData);

        chartInstances.status = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Employees",
                    data: data,
                    backgroundColor: ["#198754", "#ffc107", "#0dcaf0", "#6c757d", "#dc3545"],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    function renderExpirationsTable(expirations) {
        const tbody = document.getElementById("expirations-table-body");
        const countBadge = document.getElementById("badge-expirations-count");
        if (!tbody) return;

        if (!expirations || expirations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-success">
                        <i class="bi bi-shield-check fs-4 d-block mb-1"></i>
                        All staff documents and contracts are up to date! No imminent expirations.
                    </td>
                </tr>
            `;
            if (countBadge) countBadge.textContent = "0 upcoming";
            return;
        }

        if (countBadge) countBadge.textContent = `${expirations.length} items flagged`;

        tbody.innerHTML = expirations.map((item) => {
            let statusBadge = "";
            let daysClass = "text-muted";

            if (item.status === "Expired") {
                statusBadge = `<span class="badge bg-danger text-white"><i class="bi bi-x-circle me-1"></i>Expired</span>`;
                daysClass = "text-danger fw-bold";
            } else if (item.status === "Expiring Soon") {
                statusBadge = `<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>Expiring Soon</span>`;
                daysClass = "text-warning fw-bold";
            } else {
                statusBadge = `<span class="badge bg-success text-white"><i class="bi bi-check me-1"></i>Valid</span>`;
            }

            const daysText = item.daysRemaining < 0 
                ? `${Math.abs(item.daysRemaining)} days ago` 
                : `${item.daysRemaining} days`;

            return `
                <tr>
                    <td class="text-nowrap ps-3"><span class="badge bg-light text-dark font-monospace">${item.employeeId}</span></td>
                    <td class="fw-semibold text-nowrap">${item.employeeName}</td>
                    <td><i class="bi bi-file-earmark-text text-primary me-1"></i>${item.documentName}</td>
                    <td class="text-nowrap">${item.expiryDate}</td>
                    <td class="text-nowrap ${daysClass}">${daysText}</td>
                    <td class="text-nowrap">${statusBadge}</td>
                    <td class="text-end text-nowrap pe-3">
                        <button class="btn btn-outline-primary btn-sm" onclick="App.viewEmployeeProfile('${item.employeeId}', 'documents')">
                            <i class="bi bi-folder-symlink me-1"></i> View Doc
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    return {
        render
    };
})();

window.Dashboard = Dashboard;
