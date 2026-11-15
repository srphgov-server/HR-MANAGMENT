/**
 * HR Management System - Employee Directory Module
 * 
 * Searchable, filterable, sortable, and paginated employee directory with CSV export and CRUD.
 */

const Employees = (function () {
    let allEmployees = [];
    let filteredEmployees = [];
    let masterLists = [];

    // Table state
    let currentPage = 1;
    let pageSize = CONFIG.DEFAULT_PAGE_SIZE || 10;
    let sortColumn = "EmployeeID";
    let sortDirection = "asc";

    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-people text-primary me-2"></i><span data-i18n="emp_title">Employee Directory</span></h3>
                    <p class="text-muted mb-0" data-i18n="emp_subtitle">Search, filter, manage staff records, and view profiles.</p>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-outline-success btn-sm" id="btn-export-employees">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="btn_export">Export CSV</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-add-employee" data-permission="employee.create">
                        <i class="bi bi-person-plus-fill me-1"></i> <span data-i18n="emp_add_btn">Add Employee</span>
                    </button>
                </div>
            </div>

            <!-- Filter & Search Card -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <!-- Global Search -->
                        <div class="col-12 col-md-4">
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control border-start-0 bg-light" id="emp-search-input" placeholder="Search by name, ID, email, role, phone...">
                            </div>
                        </div>

                        <!-- Department Filter -->
                        <div class="col-6 col-md-2">
                            <select class="form-select" id="filter-department">
                                <option value="">All Departments</option>
                            </select>
                        </div>

                        <!-- Position Filter -->
                        <div class="col-6 col-md-2">
                            <select class="form-select" id="filter-position">
                                <option value="">All Positions</option>
                            </select>
                        </div>

                        <!-- Status Filter -->
                        <div class="col-6 col-md-2">
                            <select class="form-select" id="filter-status">
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Probation">Probation</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Resigned">Resigned</option>
                                <option value="Terminated">Terminated</option>
                            </select>
                        </div>

                        <!-- Type Filter -->
                        <div class="col-6 col-md-2">
                            <select class="form-select" id="filter-type">
                                <option value="">All Types</option>
                                <option value="Permanent">Permanent</option>
                                <option value="Contract">Contract</option>
                                <option value="Temporary">Temporary</option>
                                <option value="Intern">Intern</option>
                                <option value="Consultant">Consultant</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employee List Table Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" id="employees-table">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3 text-nowrap" style="width: 50px;">Photo</th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="EmployeeID">
                                        Employee ID <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="FirstName">
                                        Employee Name <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="PositionID">
                                        Position <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="DepartmentID">
                                        Department <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="text-nowrap">Manager</th>
                                    <th class="text-nowrap">Type</th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="Status">
                                        Status <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="sortable cursor-pointer text-nowrap" data-col="JoinDate">
                                        Join Date <i class="bi bi-arrow-down-up text-muted small ms-1"></i>
                                    </th>
                                    <th class="text-end pe-3 text-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="employees-table-body">
                                <tr>
                                    <td colspan="10" class="text-center py-5">
                                        <div class="spinner-border text-primary" role="status"></div>
                                        <div class="text-muted mt-2">Loading employee directory...</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination Footer -->
                <div class="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div class="small text-muted" id="pagination-info">Showing 0 of 0 records</div>
                    <div class="d-flex align-items-center gap-2">
                        <label class="small text-muted mb-0">Rows:</label>
                        <select class="form-select form-select-sm" id="select-page-size" style="width: 70px;">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <ul class="pagination pagination-sm mb-0" id="pagination-controls"></ul>
                    </div>
                </div>
            </div>
        `;

        setupEventListeners();
        await loadData();
    }

    function setupEventListeners() {
        // Search & Filter listeners
        const searchInput = document.getElementById("emp-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", debounce(() => {
                currentPage = 1;
                applyFilters();
            }, 250));
        }

        ["filter-department", "filter-position", "filter-status", "filter-type"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener("change", () => {
                currentPage = 1;
                applyFilters();
            });
        });

        // Page size selector
        const pageSizeSelect = document.getElementById("select-page-size");
        if (pageSizeSelect) {
            pageSizeSelect.value = pageSize;
            pageSizeSelect.addEventListener("change", (e) => {
                pageSize = parseInt(e.target.value, 10);
                currentPage = 1;
                renderTable();
            });
        }

        // Sorting
        const sortHeaders = document.querySelectorAll("#employees-table th.sortable");
        sortHeaders.forEach((th) => {
            th.addEventListener("click", () => {
                const col = th.getAttribute("data-col");
                if (sortColumn === col) {
                    sortDirection = sortDirection === "asc" ? "desc" : "asc";
                } else {
                    sortColumn = col;
                    sortDirection = "asc";
                }
                applySort();
                renderTable();
            });
        });

        // Add Employee button
        const addBtn = document.getElementById("btn-add-employee");
        if (addBtn) {
            addBtn.addEventListener("click", () => openEmployeeModal());
        }

        // Export CSV button
        const exportBtn = document.getElementById("btn-export-employees");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => exportToCSV());
        }
    }

    async function loadData() {
        const [empRes, listRes] = await Promise.all([
            API.call("getEmployees", {}, "GET", true),
            API.call("getMasterLists", {}, "GET", true)
        ]);

        if (listRes.success && listRes.data) {
            masterLists = listRes.data;
            populateFilterDropdowns();
        }

        if (empRes.success && empRes.data) {
            allEmployees = empRes.data;
            applyFilters();
        }
    }

    function populateFilterDropdowns() {
        const deptSelect = document.getElementById("filter-department");
        const posSelect = document.getElementById("filter-position");

        const depts = masterLists.filter((l) => l.Category === "Department" && l.IsActive);
        const positions = masterLists.filter((l) => l.Category === "Position" && l.IsActive);

        if (deptSelect) {
            deptSelect.innerHTML = `<option value="">All Departments</option>` +
                depts.map((d) => `<option value="${d.ItemValue}">${d.ItemValue}</option>`).join("");
        }

        if (posSelect) {
            posSelect.innerHTML = `<option value="">All Positions</option>` +
                positions.map((p) => `<option value="${p.ItemValue}">${p.ItemValue}</option>`).join("");
        }
    }

    function applyFilters() {
        const query = (document.getElementById("emp-search-input")?.value || "").toLowerCase().trim();
        const dept = document.getElementById("filter-department")?.value || "";
        const pos = document.getElementById("filter-position")?.value || "";
        const status = document.getElementById("filter-status")?.value || "";
        const type = document.getElementById("filter-type")?.value || "";

        filteredEmployees = allEmployees.filter((emp) => {
            // Global search against multiple fields
            if (query) {
                const fullName = `${emp.FirstName || ""} ${emp.LastName || ""}`.toLowerCase();
                const code = (emp.EmployeeCode || "").toLowerCase();
                const id = (emp.EmployeeID || "").toLowerCase();
                const email = (emp.WorkEmail || emp.PersonalEmail || "").toLowerCase();
                const phone = (emp.Phone || "").toLowerCase();
                const department = (emp.DepartmentID || "").toLowerCase();
                const position = (emp.PositionID || "").toLowerCase();

                const matchesQuery = fullName.includes(query) ||
                                     code.includes(query) ||
                                     id.includes(query) ||
                                     email.includes(query) ||
                                     phone.includes(query) ||
                                     department.includes(query) ||
                                     position.includes(query);
                if (!matchesQuery) return false;
            }

            if (dept && emp.DepartmentID !== dept) return false;
            if (pos && emp.PositionID !== pos) return false;
            if (status && (emp.EmploymentStatusID !== status && emp.Status !== status)) return false;
            if (type && emp.EmploymentTypeID !== type) return false;

            return true;
        });

        applySort();
        renderTable();
    }

    function applySort() {
        filteredEmployees.sort((a, b) => {
            let valA = a[sortColumn] || "";
            let valB = b[sortColumn] || "";

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }

    function renderTable() {
        const tbody = document.getElementById("employees-table-body");
        const paginationInfo = document.getElementById("pagination-info");
        const paginationControls = document.getElementById("pagination-controls");
        if (!tbody) return;

        if (filteredEmployees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <i class="bi bi-person-x fs-1 text-muted d-block mb-2"></i>
                        <h6 class="fw-bold">No employees found</h6>
                        <p class="text-muted small">Try modifying your filters or search terms.</p>
                    </td>
                </tr>
            `;
            if (paginationInfo) paginationInfo.textContent = "Showing 0 of 0 records";
            if (paginationControls) paginationControls.innerHTML = "";
            return;
        }

        const totalRecords = filteredEmployees.length;
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = Math.min(startIdx + pageSize, totalRecords);
        const pageItems = filteredEmployees.slice(startIdx, endIdx);

        tbody.innerHTML = pageItems.map((emp) => {
            const status = emp.EmploymentStatusID || emp.Status || "Active";
            const badge = getStatusBadge(status);
            const photoUrl = emp.EmployeePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80";
            const fullName = `${emp.FirstName || ""} ${emp.LastName || ""}`;

            return `
                <tr>
                    <td class="ps-3 text-nowrap">
                        <img src="${photoUrl}" class="rounded-circle border" width="36" height="36" alt="${fullName}" style="object-fit: cover;" onerror="this.src='https://via.placeholder.com/36?text=HR'">
                    </td>
                    <td class="text-nowrap"><span class="badge bg-light text-dark font-monospace">${emp.EmployeeID}</span></td>
                    <td>
                        <a href="javascript:void(0)" class="fw-bold text-decoration-none text-dark d-block" onclick="App.viewEmployeeProfile('${emp.EmployeeID}')">
                            ${fullName}
                        </a>
                        <small class="text-muted d-block text-truncate" style="max-width: 220px;">${emp.WorkEmail || emp.PersonalEmail || ""}</small>
                    </td>
                    <td>${emp.PositionID || "—"}</td>
                    <td>${emp.DepartmentID || "—"}</td>
                    <td><small class="text-muted">${emp.ManagerID || "—"}</small></td>
                    <td class="text-nowrap"><span class="badge bg-secondary-subtle text-secondary">${emp.EmploymentTypeID || "Permanent"}</span></td>
                    <td class="text-nowrap">${badge}</td>
                    <td class="text-nowrap"><small>${emp.JoinDate || "—"}</small></td>
                    <td class="text-end pe-3 text-nowrap">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" title="View Detailed Profile" onclick="App.viewEmployeeProfile('${emp.EmployeeID}')">
                                <i class="bi bi-person-lines-fill"></i>
                            </button>
                            <button class="btn btn-outline-secondary" title="Edit Employee" onclick="Employees.openEmployeeModal('${emp.EmployeeID}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" title="Archive / Resign" onclick="Employees.archiveEmployee('${emp.EmployeeID}')">
                                <i class="bi bi-archive"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${totalRecords} records`;
        }

        renderPagination(totalPages);
    }

    function getStatusBadge(status) {
        switch (status) {
            case "Active":
                return `<span class="badge bg-success text-white"><i class="bi bi-check-circle me-1"></i>Active</span>`;
            case "Probation":
                return `<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Probation</span>`;
            case "On Leave":
                return `<span class="badge bg-info text-dark"><i class="bi bi-calendar2-week me-1"></i>On Leave</span>`;
            case "Resigned":
                return `<span class="badge bg-secondary text-white"><i class="bi bi-person-dash me-1"></i>Resigned</span>`;
            case "Terminated":
                return `<span class="badge bg-danger text-white"><i class="bi bi-slash-circle me-1"></i>Terminated</span>`;
            default:
                return `<span class="badge bg-light text-dark">${status}</span>`;
        }
    }

    function renderPagination(totalPages) {
        const container = document.getElementById("pagination-controls");
        if (!container) return;

        let html = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="Employees.goToPage(${currentPage - 1})"><i class="bi bi-chevron-left"></i></button>
            </li>
        `;

        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                html += `
                    <li class="page-item ${p === currentPage ? 'active' : ''}">
                        <button class="page-link" onclick="Employees.goToPage(${p})">${p}</button>
                    </li>
                `;
            } else if (p === currentPage - 2 || p === currentPage + 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="Employees.goToPage(${currentPage + 1})"><i class="bi bi-chevron-right"></i></button>
            </li>
        `;

        container.innerHTML = html;
    }

    function goToPage(page) {
        currentPage = page;
        renderTable();
    }

    /**
     * Add / Edit Employee Modal Dialog
     */
    function openEmployeeModal(employeeId = null) {
        const emp = employeeId ? allEmployees.find((e) => e.EmployeeID === employeeId) : {};
        const isEdit = !!employeeId;

        const depts = masterLists.filter((l) => l.Category === "Department" && l.IsActive);
        const positions = masterLists.filter((l) => l.Category === "Position" && l.IsActive);
        const types = masterLists.filter((l) => l.Category === "EmploymentType" && l.IsActive);
        const statuses = masterLists.filter((l) => l.Category === "EmploymentStatus" && l.IsActive);
        const genders = masterLists.filter((l) => l.Category === "Gender" && l.IsActive);

        const modalHtml = `
            <div class="modal fade" id="employeeFormModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${isEdit ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2"></i>
                                ${isEdit ? `Edit Employee (${emp.EmployeeID})` : 'New Employee Registration'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="form-employee" novalidate>
                                <input type="hidden" id="emp-id" value="${emp.EmployeeID || ''}">

                                <div class="row g-3">
                                    <div class="col-12">
                                        <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">1. Personal Demographics</h6>
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label required">First Name</label>
                                        <input type="text" class="form-control" id="emp-first-name" required value="${emp.FirstName || ''}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Middle Name</label>
                                        <input type="text" class="form-control" id="emp-middle-name" value="${emp.MiddleName || ''}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label required">Last Name</label>
                                        <input type="text" class="form-control" id="emp-last-name" required value="${emp.LastName || ''}">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label">Preferred Name</label>
                                        <input type="text" class="form-control" id="emp-pref-name" value="${emp.PreferredName || ''}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Gender</label>
                                        <select class="form-select" id="emp-gender">
                                            ${genders.map((g) => `<option value="${g.ItemValue}" ${emp.Gender === g.ItemValue ? 'selected' : ''}>${g.ItemValue}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Date of Birth</label>
                                        <input type="date" class="form-control" id="emp-dob" value="${emp.DateOfBirth || ''}">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label">Nationality</label>
                                        <input type="text" class="form-control" id="emp-nationality" value="${emp.Nationality || 'American'}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Marital Status</label>
                                        <select class="form-select" id="emp-marital">
                                            <option value="Single" ${emp.MaritalStatus === 'Single' ? 'selected' : ''}>Single</option>
                                            <option value="Married" ${emp.MaritalStatus === 'Married' ? 'selected' : ''}>Married</option>
                                            <option value="Divorced" ${emp.MaritalStatus === 'Divorced' ? 'selected' : ''}>Divorced</option>
                                            <option value="Other" ${emp.MaritalStatus === 'Other' ? 'selected' : ''}>Other</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Photo URL</label>
                                        <input type="url" class="form-control" id="emp-photo" placeholder="https://..." value="${emp.EmployeePhoto || ''}">
                                    </div>

                                    <div class="col-12 mt-4">
                                        <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">2. Contact & Address</h6>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label required">Work Email</label>
                                        <input type="email" class="form-control" id="emp-work-email" required value="${emp.WorkEmail || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Personal Email</label>
                                        <input type="email" class="form-control" id="emp-personal-email" value="${emp.PersonalEmail || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label required">Phone Number</label>
                                        <input type="tel" class="form-control" id="emp-phone" required value="${emp.Phone || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Residential Address</label>
                                        <input type="text" class="form-control" id="emp-address" value="${emp.Address || ''}">
                                    </div>

                                    <div class="col-12 mt-4">
                                        <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">3. Employment & Placement</h6>
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label">Employee Code</label>
                                        <input type="text" class="form-control" id="emp-code" placeholder="e.g. CORP-0105" value="${emp.EmployeeCode || ''}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label required">Department</label>
                                        <select class="form-select" id="emp-dept" required>
                                            ${depts.map((d) => `<option value="${d.ItemValue}" ${emp.DepartmentID === d.ItemValue ? 'selected' : ''}>${d.ItemValue}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label required">Position / Title</label>
                                        <select class="form-select" id="emp-pos" required>
                                            ${positions.map((p) => `<option value="${p.ItemValue}" ${emp.PositionID === p.ItemValue ? 'selected' : ''}>${p.ItemValue}</option>`).join("")}
                                        </select>
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label required">Employment Type</label>
                                        <select class="form-select" id="emp-type" required>
                                            ${types.map((t) => `<option value="${t.ItemValue}" ${emp.EmploymentTypeID === t.ItemValue ? 'selected' : ''}>${t.ItemValue}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label required">Employment Status</label>
                                        <select class="form-select" id="emp-status" required>
                                            ${statuses.map((s) => `<option value="${s.ItemValue}" ${emp.EmploymentStatusID === s.ItemValue ? 'selected' : ''}>${s.ItemValue}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Reporting Manager</label>
                                        <input type="text" class="form-control" id="emp-manager" placeholder="Name or Emp ID" value="${emp.ManagerID || ''}">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label required">Join Date</label>
                                        <input type="date" class="form-control" id="emp-join-date" required value="${emp.JoinDate || new Date().toISOString().substring(0, 10)}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Work Location</label>
                                        <input type="text" class="form-control" id="emp-location" placeholder="e.g. Headquarters / Remote" value="${emp.WorkLocation || 'Headquarters'}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Cost Center</label>
                                        <input type="text" class="form-control" id="emp-cost-center" placeholder="e.g. CC-HR-001" value="${emp.CostCenter || ''}">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary px-4" id="btn-save-employee-submit">
                                <i class="bi bi-save me-1"></i> Save Employee Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Clean up any existing modal element
        const existing = document.getElementById("employeeFormModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("employeeFormModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-save-employee-submit").addEventListener("click", async () => {
            const form = document.getElementById("form-employee");
            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                App.showToast("Please fill in all required fields marked with *", "warning");
                return;
            }

            const empData = {
                EmployeeID: document.getElementById("emp-id").value || undefined,
                FirstName: document.getElementById("emp-first-name").value.trim(),
                MiddleName: document.getElementById("emp-middle-name").value.trim(),
                LastName: document.getElementById("emp-last-name").value.trim(),
                PreferredName: document.getElementById("emp-pref-name").value.trim(),
                Gender: document.getElementById("emp-gender").value,
                DateOfBirth: document.getElementById("emp-dob").value,
                Nationality: document.getElementById("emp-nationality").value.trim(),
                MaritalStatus: document.getElementById("emp-marital").value,
                EmployeePhoto: document.getElementById("emp-photo").value.trim(),
                WorkEmail: document.getElementById("emp-work-email").value.trim(),
                PersonalEmail: document.getElementById("emp-personal-email").value.trim(),
                Phone: document.getElementById("emp-phone").value.trim(),
                Address: document.getElementById("emp-address").value.trim(),
                EmployeeCode: document.getElementById("emp-code").value.trim(),
                DepartmentID: document.getElementById("emp-dept").value,
                PositionID: document.getElementById("emp-pos").value,
                EmploymentTypeID: document.getElementById("emp-type").value,
                EmploymentStatusID: document.getElementById("emp-status").value,
                Status: document.getElementById("emp-status").value,
                ManagerID: document.getElementById("emp-manager").value.trim(),
                JoinDate: document.getElementById("emp-join-date").value,
                WorkLocation: document.getElementById("emp-location").value.trim(),
                CostCenter: document.getElementById("emp-cost-center").value.trim()
            };

            const response = await API.call("saveEmployee", empData, "POST");
            if (response.success) {
                modal.hide();
                App.showToast(`Employee record for ${empData.FirstName} ${empData.LastName} saved successfully.`, "success");
                await loadData();
            } else {
                App.showToast(`Error: ${response.message}`, "danger");
            }
        });
    }

    /**
     * Archive / Resign Employee (Soft Delete)
     */
    async function archiveEmployee(employeeId) {
        const emp = allEmployees.find((e) => e.EmployeeID === employeeId);
        if (!emp) return;

        App.confirmDialog({
            title: "Archive Employee Record",
            message: `Are you sure you want to mark <strong>${emp.FirstName} ${emp.LastName} (${emp.EmployeeID})</strong> as Resigned/Archived? This does not permanently delete the record.`,
            confirmText: "Yes, Archive Employee",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                const response = await API.call("deleteEmployee", { id: employeeId, softDelete: true }, "POST");
                if (response.success) {
                    App.showToast(`Employee ${emp.EmployeeID} status changed to Resigned.`, "info");
                    await loadData();
                } else {
                    App.showToast(response.message, "danger");
                }
            }
        });
    }

    /**
     * Export Employees to CSV
     */
    function exportToCSV() {
        if (!filteredEmployees || filteredEmployees.length === 0) {
            App.showToast("No employee records to export", "warning");
            return;
        }

        const headers = [
            "EmployeeID", "EmployeeCode", "FirstName", "LastName", "WorkEmail",
            "Phone", "Department", "Position", "Manager", "EmploymentType", "Status", "JoinDate"
        ];

        const rows = filteredEmployees.map((e) => [
            e.EmployeeID || "",
            e.EmployeeCode || "",
            `"${(e.FirstName || "").replace(/"/g, '""')}"`,
            `"${(e.LastName || "").replace(/"/g, '""')}"`,
            e.WorkEmail || "",
            e.Phone || "",
            `"${(e.DepartmentID || "").replace(/"/g, '""')}"`,
            `"${(e.PositionID || "").replace(/"/g, '""')}"`,
            `"${(e.ManagerID || "").replace(/"/g, '""')}"`,
            e.EmploymentTypeID || "",
            e.EmploymentStatusID || e.Status || "",
            e.JoinDate || ""
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `HR_Employees_Export_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        App.showToast("Employee list exported to CSV", "success");
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    return {
        render,
        goToPage,
        openEmployeeModal,
        archiveEmployee,
        exportToCSV
    };
})();

window.Employees = Employees;
