/**
 * HR Management System - Employee Profile Workspace (15 Tabs)
 * 
 * Central HR workspace with 15 comprehensive tabs and full sub-record CRUD.
 */

const EmployeeProfile = (function () {
    let currentEmployeeId = null;
    let profileData = null;
    let activeTabId = "tab-overview";

    async function render(container, employeeId, initialTab = "overview") {
        currentEmployeeId = employeeId;
        activeTabId = `tab-${initialTab}`;

        container.innerHTML = `
            <!-- Top Action Header & Breadcrumb -->
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-0">
                        <li class="breadcrumb-item"><a href="javascript:void(0)" onclick="App.navigateTo('employees')"><i class="bi bi-people me-1"></i>Directory</a></li>
                        <li class="breadcrumb-item active" aria-current="page" id="profile-breadcrumb-name">Loading profile...</li>
                    </ol>
                </nav>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-outline-secondary btn-sm" onclick="App.navigateTo('employees')">
                        <i class="bi bi-arrow-left me-1"></i> <span class="d-none d-sm-inline">Back to Directory</span><span class="d-inline d-sm-none">Back</span>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" id="btn-print-profile" onclick="window.print()">
                        <i class="bi bi-printer me-1"></i> <span class="d-none d-sm-inline">Print Profile</span><span class="d-inline d-sm-none">Print</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-edit-main-emp" data-permission="employee.edit">
                        <i class="bi bi-pencil me-1"></i> <span class="d-none d-sm-inline">Edit Employee</span><span class="d-inline d-sm-none">Edit</span>
                    </button>
                </div>
            </div>

            <!-- Profile Summary Header Card -->
            <div class="card border-0 shadow-sm mb-4" id="profile-header-card">
                <div class="card-body p-3 p-md-4">
                    <div class="row align-items-center g-3">
                        <div class="col-auto">
                            <div class="position-relative">
                                <img id="prof-photo" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                                     class="rounded-circle border border-3 border-white shadow-sm"
                                     width="100" height="100" style="object-fit: cover;" alt="Employee Photo"
                                     onerror="this.src='https://via.placeholder.com/100?text=HR'">
                                <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle" id="prof-status-dot"></span>
                            </div>
                        </div>
                        <div class="col-12 col-sm">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <h4 class="fw-bold mb-0" id="prof-full-name">--</h4>
                                <span class="badge bg-light text-dark font-monospace" id="prof-id">EMP-000000</span>
                                <span class="badge bg-primary-subtle text-primary" id="prof-status-badge">Active</span>
                                <span class="badge bg-info-subtle text-info" id="prof-type-badge">Permanent</span>
                            </div>
                            <div class="text-muted mt-1 small" id="prof-role-dept">
                                <i class="bi bi-briefcase me-1"></i> <span id="prof-position">--</span> &bull; 
                                <i class="bi bi-building me-1"></i> <span id="prof-department">--</span>
                            </div>
                            <div class="d-flex gap-2 gap-md-3 text-muted small mt-2 flex-wrap">
                                <div class="text-truncate"><i class="bi bi-envelope me-1"></i> <span id="prof-email">--</span></div>
                                <div class="text-nowrap"><i class="bi bi-telephone me-1"></i> <span id="prof-phone">--</span></div>
                                <div class="text-nowrap"><i class="bi bi-geo-alt me-1"></i> <span id="prof-location">--</span></div>
                                <div class="text-nowrap"><i class="bi bi-calendar-check me-1"></i> Joined: <span id="prof-join-date">--</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile 15 Tabs Navigation -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom p-0">
                    <ul class="nav nav-tabs nav-tabs-bordered profile-tabs-scroll flex-nowrap px-3 pt-2" id="profileTabList" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="tab-overview-link" data-bs-toggle="tab" data-bs-target="#tab-overview" type="button" role="tab">
                                <i class="bi bi-person-badge me-1"></i> Overview
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-personal-link" data-bs-toggle="tab" data-bs-target="#tab-personal" type="button" role="tab">
                                <i class="bi bi-card-text me-1"></i> Personal Info
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-employment-link" data-bs-toggle="tab" data-bs-target="#tab-employment" type="button" role="tab">
                                <i class="bi bi-building-gear me-1"></i> Employment
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-documents-link" data-bs-toggle="tab" data-bs-target="#tab-documents" type="button" role="tab">
                                <i class="bi bi-files me-1"></i> Documents <span class="badge bg-secondary rounded-pill ms-1" id="tab-count-docs">0</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-skills-link" data-bs-toggle="tab" data-bs-target="#tab-skills" type="button" role="tab">
                                <i class="bi bi-award me-1"></i> Skills <span class="badge bg-secondary rounded-pill ms-1" id="tab-count-skills">0</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-experience-link" data-bs-toggle="tab" data-bs-target="#tab-experience" type="button" role="tab">
                                <i class="bi bi-clock-history me-1"></i> Experience
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-education-link" data-bs-toggle="tab" data-bs-target="#tab-education" type="button" role="tab">
                                <i class="bi bi-mortarboard me-1"></i> Education
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-training-link" data-bs-toggle="tab" data-bs-target="#tab-training" type="button" role="tab">
                                <i class="bi bi-patch-check me-1"></i> Training
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-contacts-link" data-bs-toggle="tab" data-bs-target="#tab-contacts" type="button" role="tab">
                                <i class="bi bi-telephone-plus me-1"></i> Emergency Contacts
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-dependents-link" data-bs-toggle="tab" data-bs-target="#tab-dependents" type="button" role="tab">
                                <i class="bi bi-people me-1"></i> Family / Dependents
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-performance-link" data-bs-toggle="tab" data-bs-target="#tab-performance" type="button" role="tab">
                                <i class="bi bi-graph-up-arrow me-1"></i> Performance
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-career-link" data-bs-toggle="tab" data-bs-target="#tab-career" type="button" role="tab">
                                <i class="bi bi-compass me-1"></i> Career Dev
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-leave-link" data-bs-toggle="tab" data-bs-target="#tab-leave" type="button" role="tab">
                                <i class="bi bi-calendar2-range me-1"></i> Leave Summary
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="tab-assets-link" data-bs-toggle="tab" data-bs-target="#tab-assets" type="button" role="tab">
                                <i class="bi bi-laptop me-1"></i> Company Assets
                            </button>
                        </li>
                        <li class="nav-item" role="presentation" id="tab-notes-item">
                            <button class="nav-link" id="tab-notes-link" data-bs-toggle="tab" data-bs-target="#tab-notes" type="button" role="tab">
                                <i class="bi bi-shield-lock me-1"></i> HR Notes
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Tabs Content Panes -->
                <div class="card-body p-4">
                    <div class="tab-content" id="profileTabContent">
                        <!-- 1. Overview Tab -->
                        <div class="tab-pane fade show active" id="tab-overview" role="tabpanel"></div>

                        <!-- 2. Personal Info Tab -->
                        <div class="tab-pane fade" id="tab-personal" role="tabpanel"></div>

                        <!-- 3. Employment Tab -->
                        <div class="tab-pane fade" id="tab-employment" role="tabpanel"></div>

                        <!-- 4. Documents Tab -->
                        <div class="tab-pane fade" id="tab-documents" role="tabpanel"></div>

                        <!-- 5. Skills Tab -->
                        <div class="tab-pane fade" id="tab-skills" role="tabpanel"></div>

                        <!-- 6. Experience Tab -->
                        <div class="tab-pane fade" id="tab-experience" role="tabpanel"></div>

                        <!-- 7. Education Tab -->
                        <div class="tab-pane fade" id="tab-education" role="tabpanel"></div>

                        <!-- 8. Training Tab -->
                        <div class="tab-pane fade" id="tab-training" role="tabpanel"></div>

                        <!-- 9. Emergency Contacts Tab -->
                        <div class="tab-pane fade" id="tab-contacts" role="tabpanel"></div>

                        <!-- 10. Family / Dependents Tab -->
                        <div class="tab-pane fade" id="tab-dependents" role="tabpanel"></div>

                        <!-- 11. Performance Tab -->
                        <div class="tab-pane fade" id="tab-performance" role="tabpanel"></div>

                        <!-- 12. Career Dev Tab -->
                        <div class="tab-pane fade" id="tab-career" role="tabpanel"></div>

                        <!-- 13. Leave Summary Tab -->
                        <div class="tab-pane fade" id="tab-leave" role="tabpanel"></div>

                        <!-- 14. Assets Tab -->
                        <div class="tab-pane fade" id="tab-assets" role="tabpanel"></div>

                        <!-- 15. HR Notes Tab -->
                        <div class="tab-pane fade" id="tab-notes" role="tabpanel"></div>
                    </div>
                </div>
            </div>
        `;

        await loadProfileData();
    }

    async function loadProfileData() {
        const res = await API.call("getEmployee", { id: currentEmployeeId }, "GET", true);
        if (!res.success || !res.data) {
            App.showToast("Failed to load employee profile details", "danger");
            return;
        }

        profileData = res.data;
        populateHeader();
        renderAllTabs();

        // Activate requested tab if provided
        if (activeTabId) {
            const targetLink = document.getElementById(`${activeTabId}-link`);
            if (targetLink) {
                const tabTrigger = new bootstrap.Tab(targetLink);
                tabTrigger.show();
            }
        }
    }

    function populateHeader() {
        const emp = profileData.employee;
        const fullName = `${emp.FirstName || ""} ${emp.LastName || ""}`;

        document.getElementById("profile-breadcrumb-name").textContent = fullName;
        document.getElementById("prof-full-name").textContent = fullName;
        document.getElementById("prof-id").textContent = emp.EmployeeID;
        document.getElementById("prof-position").textContent = emp.PositionID || "Unassigned Position";
        document.getElementById("prof-department").textContent = emp.DepartmentID || "Unassigned Department";
        document.getElementById("prof-email").textContent = emp.WorkEmail || emp.PersonalEmail || "No Email";
        document.getElementById("prof-phone").textContent = emp.Phone || "No Phone";
        document.getElementById("prof-location").textContent = emp.WorkLocation || "Headquarters";
        document.getElementById("prof-join-date").textContent = emp.JoinDate || "—";
        document.getElementById("prof-status-badge").textContent = emp.EmploymentStatusID || emp.Status || "Active";
        document.getElementById("prof-type-badge").textContent = emp.EmploymentTypeID || "Permanent";

        if (emp.EmployeePhoto) {
            document.getElementById("prof-photo").src = emp.EmployeePhoto;
        }

        // Sub-counts
        document.getElementById("tab-count-docs").textContent = (profileData.documents || []).length;
        document.getElementById("tab-count-skills").textContent = (profileData.skills || []).length;

        // Edit button listener
        const editBtn = document.getElementById("btn-edit-main-emp");
        if (editBtn) {
            editBtn.onclick = () => Employees.openEmployeeModal(emp.EmployeeID);
        }

        // Hide notes tab if not HR Admin or Super Admin
        const isHRAccess = Auth.hasPermission("notes.manage") || Auth.hasPermission("*");
        const notesItem = document.getElementById("tab-notes-item");
        if (notesItem && !isHRAccess) {
            notesItem.classList.add("d-none");
        }
    }

    function renderAllTabs() {
        renderOverviewTab();
        renderPersonalTab();
        renderEmploymentTab();
        renderDocumentsTab();
        renderSkillsTab();
        renderExperienceTab();
        renderEducationTab();
        renderTrainingTab();
        renderContactsTab();
        renderDependentsTab();
        renderPerformanceTab();
        renderCareerTab();
        renderLeaveTab();
        renderAssetsTab();
        renderNotesTab();

        if (window.I18n) {
            I18n.translateDOM(document.getElementById("profileTabContent"));
        }
    }

    // -------------------------------------------------------------
    // Tab 1: Overview
    // -------------------------------------------------------------
    function renderOverviewTab() {
        const emp = profileData.employee;
        const container = document.getElementById("tab-overview");
        if (!container) return;

        container.innerHTML = `
            <div class="row g-4">
                <!-- Quick Actions Toolbar -->
                <div class="col-12">
                    <div class="p-3 bg-light rounded-3 d-flex gap-2 flex-wrap align-items-center">
                        <span class="small fw-bold text-muted text-uppercase me-2"><i class="bi bi-lightning-charge-fill text-warning me-1"></i>Quick Actions:</span>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="Employees.openEmployeeModal('${emp.EmployeeID}')"><i class="bi bi-pencil me-1"></i>Edit Profile</button>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="EmployeeProfile.openSubRecordModal('documents')"><i class="bi bi-cloud-upload me-1"></i>Upload Document</button>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="EmployeeProfile.openSubRecordModal('skills')"><i class="bi bi-plus-circle me-1"></i>Add Skill</button>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="EmployeeProfile.openSubRecordModal('experience')"><i class="bi bi-briefcase me-1"></i>Add Experience</button>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="EmployeeProfile.openSubRecordModal('education')"><i class="bi bi-mortarboard me-1"></i>Add Education</button>
                        <button class="btn btn-white btn-sm border shadow-sm" onclick="EmployeeProfile.openSubRecordModal('contacts')"><i class="bi bi-person-lines-fill me-1"></i>Add Contact</button>
                        <button class="btn btn-white btn-sm border shadow-sm text-danger" onclick="EmployeeProfile.openSubRecordModal('notes')"><i class="bi bi-sticky me-1"></i>Add HR Note</button>
                    </div>
                </div>

                <!-- Key Employment Highlights -->
                <div class="col-md-6">
                    <div class="card h-100 border">
                        <div class="card-header bg-white fw-bold"><i class="bi bi-briefcase text-primary me-2"></i>Employment Summary</div>
                        <div class="card-body">
                            <table class="table table-sm table-borderless mb-0">
                                <tr><th class="text-muted" style="width: 40%;">Job Title:</th><td class="fw-semibold">${emp.PositionID || '—'}</td></tr>
                                <tr><th class="text-muted">Department:</th><td>${emp.DepartmentID || '—'}</td></tr>
                                <tr><th class="text-muted">Manager / Supervisor:</th><td>${emp.ManagerID || 'None'}</td></tr>
                                <tr><th class="text-muted">Employment Type:</th><td><span class="badge bg-secondary-subtle text-secondary">${emp.EmploymentTypeID || 'Permanent'}</span></td></tr>
                                <tr><th class="text-muted">Probation Status:</th><td><span class="badge bg-info-subtle text-info">${emp.ProbationStatus || 'Confirmed'}</span></td></tr>
                                <tr><th class="text-muted">Join Date:</th><td>${emp.JoinDate || '—'}</td></tr>
                                <tr><th class="text-muted">Work Location:</th><td>${emp.WorkLocation || 'Headquarters'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Contact & Identity Details -->
                <div class="col-md-6">
                    <div class="card h-100 border">
                        <div class="card-header bg-white fw-bold"><i class="bi bi-person-lines-fill text-success me-2"></i>Primary Contact & Identity</div>
                        <div class="card-body">
                            <table class="table table-sm table-borderless mb-0">
                                <tr><th class="text-muted" style="width: 40%;">Work Email:</th><td><a href="mailto:${emp.WorkEmail}">${emp.WorkEmail || '—'}</a></td></tr>
                                <tr><th class="text-muted">Personal Email:</th><td>${emp.PersonalEmail || '—'}</td></tr>
                                <tr><th class="text-muted">Phone Number:</th><td>${emp.Phone || '—'}</td></tr>
                                <tr><th class="text-muted">Emergency Contact:</th><td>${emp.EmergencyContact || '—'} (${emp.EmergencyPhone || '—'})</td></tr>
                                <tr><th class="text-muted">Residential Address:</th><td>${emp.Address || '—'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 2: Personal Information
    // -------------------------------------------------------------
    function renderPersonalTab() {
        const emp = profileData.employee;
        const container = document.getElementById("tab-personal");
        if (!container) return;

        container.innerHTML = `
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-person text-primary me-2"></i>Legal Demographics & Identification</span>
                            <button class="btn btn-outline-primary btn-sm" onclick="Employees.openEmployeeModal('${emp.EmployeeID}')"><i class="bi bi-pencil me-1"></i>Edit</button>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="text-muted small">Full Legal Name</label>
                                    <div class="fw-semibold">${emp.FirstName || ''} ${emp.MiddleName || ''} ${emp.LastName || ''}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small">Preferred / Alias Name</label>
                                    <div class="fw-semibold">${emp.PreferredName || '—'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small">Date of Birth</label>
                                    <div>${emp.DateOfBirth || '—'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small">Gender</label>
                                    <div>${emp.Gender || '—'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small">Nationality</label>
                                    <div>${emp.Nationality || '—'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small">Marital Status</label>
                                    <div>${emp.MaritalStatus || '—'}</div>
                                </div>
                                <div class="col-md-12">
                                    <label class="text-muted small">Residential Address</label>
                                    <div>${emp.Address || 'No address registered'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card border">
                        <div class="card-header bg-white fw-bold"><i class="bi bi-shield-check text-success me-2"></i>Emergency Direct Line</div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="text-muted small">Designated Contact</label>
                                <div class="fw-bold">${emp.EmergencyContact || 'Not Specified'}</div>
                            </div>
                            <div class="mb-3">
                                <label class="text-muted small">Emergency Phone</label>
                                <div class="fw-semibold text-danger"><i class="bi bi-telephone-fill me-1"></i>${emp.EmergencyPhone || 'Not Specified'}</div>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm w-100" onclick="EmployeeProfile.openSubRecordModal('contacts')">
                                <i class="bi bi-plus-circle me-1"></i> Add More Contacts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 3: Employment Details
    // -------------------------------------------------------------
    function renderEmploymentTab() {
        const emp = profileData.employee;
        const container = document.getElementById("tab-employment");
        if (!container) return;

        container.innerHTML = `
            <div class="card border">
                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-briefcase text-primary me-2"></i>Corporate Employment Placement</span>
                    <button class="btn btn-outline-primary btn-sm" onclick="Employees.openEmployeeModal('${emp.EmployeeID}')"><i class="bi bi-pencil me-1"></i>Edit Placement</button>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-md-4">
                            <label class="text-muted small">Employee System ID</label>
                            <div class="font-monospace fw-bold">${emp.EmployeeID}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Company Badge / Payroll Code</label>
                            <div class="fw-bold">${emp.EmployeeCode || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Cost Center</label>
                            <div>${emp.CostCenter || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Department</label>
                            <div class="fw-semibold">${emp.DepartmentID || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Job Title / Position</label>
                            <div class="fw-semibold">${emp.PositionID || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Direct Reporting Manager</label>
                            <div>${emp.ManagerID || 'Executive Board'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Employment Status</label>
                            <div><span class="badge bg-success-subtle text-success">${emp.EmploymentStatusID || emp.Status || 'Active'}</span></div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Employment Type</label>
                            <div>${emp.EmploymentTypeID || 'Permanent'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Probation Condition</label>
                            <div>${emp.ProbationStatus || 'Confirmed'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Hire / Join Date</label>
                            <div>${emp.JoinDate || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Confirmation Date</label>
                            <div>${emp.ConfirmationDate || '—'}</div>
                        </div>
                        <div class="col-md-4">
                            <label class="text-muted small">Contract End Date</label>
                            <div>${emp.EndDate || 'Indefinite / Permanent'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 4: Documents (With Expiry Monitoring)
    // -------------------------------------------------------------
    function renderDocumentsTab() {
        const docs = profileData.documents || [];
        const container = document.getElementById("tab-documents");
        if (!container) return;

        const now = new Date();
        const threshold = CONFIG.EXPIRY_WARNING_DAYS || 30;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-file-earmark-check text-primary me-2"></i>Official Documents & Credentials</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('documents')">
                    <i class="bi bi-cloud-arrow-up me-1"></i> Upload Document
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle border">
                    <thead class="table-light">
                        <tr>
                            <th>Doc Type</th>
                            <th>Document Name</th>
                            <th>Doc Number</th>
                            <th>Issue Date</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${docs.length === 0 ? `
                            <tr><td colspan="8" class="text-center py-4 text-muted">No documents uploaded for this employee yet.</td></tr>
                        ` : docs.map((d) => {
                            let badge = `<span class="badge bg-success">Valid</span>`;
                            if (d.ExpiryDate) {
                                const diff = Math.ceil((new Date(d.ExpiryDate) - now) / (1000 * 60 * 60 * 24));
                                if (diff < 0) {
                                    badge = `<span class="badge bg-danger">Expired (${Math.abs(diff)}d ago)</span>`;
                                } else if (diff <= threshold) {
                                    badge = `<span class="badge bg-warning text-dark">Expiring (${diff}d left)</span>`;
                                }
                            }

                            return `
                                <tr>
                                    <td><span class="badge bg-light text-dark border">${d.DocumentTypeID || 'Document'}</span></td>
                                    <td class="fw-semibold">
                                        <i class="bi bi-file-earmark-pdf text-danger me-1"></i>
                                        ${d.DocumentName}
                                    </td>
                                    <td><small class="font-monospace">${d.DocumentNumber || '—'}</small></td>
                                    <td><small>${d.IssueDate || '—'}</small></td>
                                    <td><small>${d.ExpiryDate || 'Permanent'}</small></td>
                                    <td>${badge}</td>
                                    <td><small class="text-muted">${d.Remarks || '—'}</small></td>
                                    <td class="text-end">
                                        <div class="btn-group btn-group-sm">
                                            ${d.FileURL ? `<a href="${d.FileURL}" target="_blank" class="btn btn-outline-secondary" title="View File"><i class="bi bi-box-arrow-up-right"></i></a>` : ''}
                                            <button class="btn btn-outline-danger" title="Delete" onclick="EmployeeProfile.deleteSubRecord('documents', '${d.DocumentID}')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 5: Skills
    // -------------------------------------------------------------
    function renderSkillsTab() {
        const skills = profileData.skills || [];
        const container = document.getElementById("tab-skills");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-award text-primary me-2"></i>Technical & Competency Matrix</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('skills')">
                    <i class="bi bi-plus-circle me-1"></i> Add Skill
                </button>
            </div>

            <div class="row g-3">
                ${skills.length === 0 ? `
                    <div class="col-12 text-center py-4 text-muted border rounded">No skills recorded yet.</div>
                ` : skills.map((s) => {
                    const levelColors = {
                        "Beginner": "info",
                        "Intermediate": "primary",
                        "Advanced": "warning",
                        "Expert": "success"
                    };
                    const badgeColor = levelColors[s.SkillLevel] || "secondary";

                    return `
                        <div class="col-md-6 col-xl-4">
                            <div class="card h-100 border shadow-sm">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <span class="badge bg-light text-muted small mb-1">${s.SkillType || 'Competency'}</span>
                                            <h6 class="fw-bold mb-1">${s.SkillName}</h6>
                                        </div>
                                        <button class="btn btn-sm text-danger p-0" onclick="EmployeeProfile.deleteSubRecord('skills', '${s.SkillID}')">
                                            <i class="bi bi-x-circle"></i>
                                        </button>
                                    </div>
                                    <div class="mt-2 d-flex align-items-center gap-2">
                                        <span class="badge bg-${badgeColor}">${s.SkillLevel}</span>
                                        <small class="text-muted">${s.YearsOfExperience || 0} years experience</small>
                                    </div>
                                    ${s.Certification ? `
                                        <div class="small mt-2 pt-2 border-top text-muted">
                                            <i class="bi bi-patch-check-fill text-primary me-1"></i> Cert: <strong>${s.Certification}</strong>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 6: Work Experience
    // -------------------------------------------------------------
    function renderExperienceTab() {
        const exps = profileData.experience || [];
        const container = document.getElementById("tab-experience");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-clock-history text-primary me-2"></i>Prior Employment Experience</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('experience')">
                    <i class="bi bi-plus-circle me-1"></i> Add Experience
                </button>
            </div>

            <div class="timeline position-relative ps-4 border-start border-2 border-primary-subtle ms-3">
                ${exps.length === 0 ? `<div class="text-muted py-3">No prior career records added.</div>` : exps.map((x) => `
                    <div class="mb-4 position-relative">
                        <div class="position-absolute" style="left: -33px; top: 2px;">
                            <span class="p-1 bg-primary text-white rounded-circle"><i class="bi bi-briefcase-fill small"></i></span>
                        </div>
                        <div class="card border shadow-sm">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold mb-0">${x.Position} &bull; <span class="text-primary">${x.Company}</span></h6>
                                        <small class="text-muted">${x.StartDate || '—'} to ${x.EndDate || 'Present'}</small>
                                    </div>
                                    <button class="btn btn-sm btn-outline-danger" onclick="EmployeeProfile.deleteSubRecord('experience', '${x.ExperienceID}')"><i class="bi bi-trash"></i></button>
                                </div>
                                <p class="small text-muted mt-2 mb-1">${x.Responsibilities || 'No responsibilities notes.'}</p>
                                ${x.ReferenceContact ? `<small class="text-muted d-block mt-2"><strong>Reference:</strong> ${x.ReferenceContact}</small>` : ''}
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 7: Education
    // -------------------------------------------------------------
    function renderEducationTab() {
        const edus = profileData.education || [];
        const container = document.getElementById("tab-education");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-mortarboard text-primary me-2"></i>Academic Qualifications</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('education')">
                    <i class="bi bi-plus-circle me-1"></i> Add Education
                </button>
            </div>

            <div class="row g-3">
                ${edus.length === 0 ? `<div class="col-12 text-center py-4 text-muted border rounded">No education history recorded.</div>` : edus.map((e) => `
                    <div class="col-md-6">
                        <div class="card border shadow-sm h-100">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold mb-0">${e.Qualification}</h6>
                                        <div class="text-primary small fw-semibold">${e.Institution}</div>
                                    </div>
                                    <button class="btn btn-sm text-danger p-0" onclick="EmployeeProfile.deleteSubRecord('education', '${e.EducationID}')"><i class="bi bi-trash"></i></button>
                                </div>
                                <div class="small text-muted mt-2">
                                    <div><strong>Field of Study:</strong> ${e.FieldOfStudy || '—'}</div>
                                    <div><strong>Graduation:</strong> ${e.GraduationYear || '—'} &bull; Grade: ${e.Grade || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 8: Training & Certifications
    // -------------------------------------------------------------
    function renderTrainingTab() {
        const trn = profileData.training || [];
        const container = document.getElementById("tab-training");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-patch-check text-primary me-2"></i>Training & Professional Certifications</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('training')">
                    <i class="bi bi-plus-circle me-1"></i> Add Training Record
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle border">
                    <thead class="table-light">
                        <tr>
                            <th>Course / Program</th>
                            <th>Provider</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Certificate ID</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trn.length === 0 ? `<tr><td colspan="7" class="text-center py-4 text-muted">No training programs on record.</td></tr>` : trn.map((t) => `
                            <tr>
                                <td class="fw-semibold">${t.TrainingName}</td>
                                <td>${t.Provider || 'Internal'}</td>
                                <td><span class="badge bg-light text-dark">${t.TrainingType || 'Workshop'}</span></td>
                                <td><small>${t.StartDate || ''} to ${t.EndDate || ''}</small></td>
                                <td><span class="badge bg-success-subtle text-success">${t.Status || 'Completed'}</span></td>
                                <td><small class="font-monospace">${t.Certificate || '—'}</small></td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-danger" onclick="EmployeeProfile.deleteSubRecord('training', '${t.TrainingID}')"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 9: Emergency Contacts
    // -------------------------------------------------------------
    function renderContactsTab() {
        const contacts = profileData.contacts || [];
        const container = document.getElementById("tab-contacts");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-telephone-plus text-primary me-2"></i>Emergency Next-of-Kin Contacts</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('contacts')">
                    <i class="bi bi-plus-circle me-1"></i> Add Contact
                </button>
            </div>

            <div class="row g-3">
                ${contacts.length === 0 ? `<div class="col-12 text-center py-4 text-muted border rounded">No emergency contacts listed.</div>` : contacts.map((c) => `
                    <div class="col-md-6">
                        <div class="card border shadow-sm">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold mb-0">${c.ContactName}</h6>
                                        <span class="badge bg-light text-dark border">${c.Relationship}</span>
                                        ${c.PrimaryContact === 'Yes' ? '<span class="badge bg-danger ms-1">Primary</span>' : ''}
                                    </div>
                                    <button class="btn btn-sm text-danger p-0" onclick="EmployeeProfile.deleteSubRecord('contacts', '${c.ContactID}')"><i class="bi bi-trash"></i></button>
                                </div>
                                <div class="small mt-3">
                                    <div><i class="bi bi-telephone me-1 text-muted"></i> <strong>Phone:</strong> ${c.Phone}</div>
                                    ${c.Email ? `<div><i class="bi bi-envelope me-1 text-muted"></i> <strong>Email:</strong> ${c.Email}</div>` : ''}
                                    ${c.Address ? `<div><i class="bi bi-geo-alt me-1 text-muted"></i> <strong>Address:</strong> ${c.Address}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 10: Family / Dependents
    // -------------------------------------------------------------
    function renderDependentsTab() {
        const deps = profileData.dependents || [];
        const container = document.getElementById("tab-dependents");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-people text-primary me-2"></i>Family & Beneficiary Dependents</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('dependents')">
                    <i class="bi bi-plus-circle me-1"></i> Add Dependent
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle border">
                    <thead class="table-light">
                        <tr>
                            <th>Dependent Name</th>
                            <th>Relationship</th>
                            <th>DOB</th>
                            <th>Gender</th>
                            <th>Beneficiary</th>
                            <th>Remarks</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${deps.length === 0 ? `<tr><td colspan="7" class="text-center py-4 text-muted">No dependents recorded.</td></tr>` : deps.map((d) => `
                            <tr>
                                <td class="fw-semibold">${d.Name}</td>
                                <td>${d.Relationship}</td>
                                <td><small>${d.DateOfBirth || '—'}</small></td>
                                <td>${d.Gender || '—'}</td>
                                <td><span class="badge bg-success-subtle text-success">${d.Beneficiary || 'No'}</span></td>
                                <td><small class="text-muted">${d.Remarks || '—'}</small></td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-danger" onclick="EmployeeProfile.deleteSubRecord('dependents', '${d.DependentID}')"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 11: Performance
    // -------------------------------------------------------------
    function renderPerformanceTab() {
        const perfs = profileData.performance || [];
        const container = document.getElementById("tab-performance");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-graph-up-arrow text-primary me-2"></i>Performance Evaluations & Appraisals</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('performance')">
                    <i class="bi bi-plus-circle me-1"></i> Add Review
                </button>
            </div>

            <div class="row g-3">
                ${perfs.length === 0 ? `<div class="col-12 text-center py-4 text-muted border rounded">No performance reviews recorded yet.</div>` : perfs.map((p) => `
                    <div class="col-12">
                        <div class="card border shadow-sm">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="fw-bold mb-1">${p.ReviewPeriod}</h5>
                                        <div class="text-muted small">Reviewed on: ${p.ReviewDate || '—'} by <strong>${p.Reviewer || 'Manager'}</strong></div>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-primary fs-6">${p.Rating}</span>
                                        <button class="btn btn-sm text-danger ms-2" onclick="EmployeeProfile.deleteSubRecord('performance', '${p.PerformanceID}')"><i class="bi bi-trash"></i></button>
                                    </div>
                                </div>
                                <hr>
                                <div class="row g-3 small">
                                    <div class="col-md-6">
                                        <div class="fw-bold text-success"><i class="bi bi-check2-circle me-1"></i>Key Strengths:</div>
                                        <div>${p.Strengths || '—'}</div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="fw-bold text-warning"><i class="bi bi-lightbulb me-1"></i>Improvement Areas:</div>
                                        <div>${p.ImprovementAreas || '—'}</div>
                                    </div>
                                    <div class="col-12">
                                        <div class="fw-bold text-primary"><i class="bi bi-flag me-1"></i>Agreed Goals & Objectives:</div>
                                        <div>${p.Goals || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 12: Career Development
    // -------------------------------------------------------------
    function renderCareerTab() {
        const car = profileData.career || [];
        const container = document.getElementById("tab-career");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-compass text-primary me-2"></i>Career Progression & Succession Planning</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('career')">
                    <i class="bi bi-plus-circle me-1"></i> Add Career Plan
                </button>
            </div>

            <div class="row g-3">
                ${car.length === 0 ? `<div class="col-12 text-center py-4 text-muted border rounded">No career plans recorded.</div>` : car.map((c) => `
                    <div class="col-12">
                        <div class="card border shadow-sm">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold text-primary mb-1">Target Next Position: ${c.NextPosition || 'Not Specified'}</h6>
                                        <small class="text-muted">Recorded: ${c.CreatedDate || '—'}</small>
                                    </div>
                                    <button class="btn btn-sm text-danger" onclick="EmployeeProfile.deleteSubRecord('career', '${c.CareerID}')"><i class="bi bi-trash"></i></button>
                                </div>
                                <div class="mt-3 small">
                                    <div class="mb-2"><strong>Career Goals:</strong> ${c.CareerGoals || '—'}</div>
                                    <div class="mb-2"><strong>Development Plan:</strong> ${c.DevelopmentPlan || '—'}</div>
                                    <div class="mb-2"><strong>Succession Pathways:</strong> ${c.SuccessionPlan || '—'}</div>
                                    <div><strong>Immediate Actions:</strong> ${c.Actions || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 13: Leave Summary
    // -------------------------------------------------------------
    async function renderLeaveTab() {
        const container = document.getElementById("tab-leave");
        if (!container) return;

        const res = await API.call("getLeaveRequests", { employeeId: currentEmployeeId });
        const requests = (res.success && res.data) ? res.data : [];
        const balances = (res.success && res.balances) ? res.balances : [];
        const bal = balances.find(b => b.EmployeeID === currentEmployeeId) || {
            AnnualEntitled: 20,
            AnnualTaken: 4,
            SickEntitled: 12,
            SickTaken: 1,
            CasualEntitled: 5,
            CasualTaken: 1,
            UnpaidTaken: 0
        };

        const annualLeft = Math.max(0, bal.AnnualEntitled - bal.AnnualTaken);
        const sickLeft = Math.max(0, bal.SickEntitled - bal.SickTaken);
        const casualLeft = Math.max(0, bal.CasualEntitled - bal.CasualTaken);

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h6 class="fw-bold mb-0"><i class="bi bi-calendar2-range text-primary me-2"></i>Leave Balance & Entitlements</h6>
                    <small class="text-muted">Live synchronization with Leave Management System</small>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="App.navigateTo('leave')">
                        <i class="bi bi-arrow-right-circle me-1"></i> Open Leave System
                    </button>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded text-center border">
                        <div class="text-muted small">Annual Leave</div>
                        <div class="h3 fw-bold text-primary mb-0 mt-1">${annualLeft} <small class="fs-6 text-muted">days left</small></div>
                        <div class="small text-muted">${bal.AnnualTaken} used of ${bal.AnnualEntitled} days</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded text-center border">
                        <div class="text-muted small">Sick Leave</div>
                        <div class="h3 fw-bold text-success mb-0 mt-1">${sickLeft} <small class="fs-6 text-muted">days left</small></div>
                        <div class="small text-muted">${bal.SickTaken} used of ${bal.SickEntitled} days</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded text-center border">
                        <div class="text-muted small">Casual / Personal</div>
                        <div class="h3 fw-bold text-warning mb-0 mt-1">${casualLeft} <small class="fs-6 text-muted">days left</small></div>
                        <div class="small text-muted">${bal.CasualTaken} used of ${bal.CasualEntitled} days</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 bg-light rounded text-center border">
                        <div class="text-muted small">Unpaid Leave Taken</div>
                        <div class="h3 fw-bold text-secondary mb-0 mt-1">${bal.UnpaidTaken || 0} <small class="fs-6 text-muted">days</small></div>
                        <div class="small text-muted">Current fiscal year</div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold mb-0">Employee Leave Request History</h6>
                    <span class="badge bg-light text-dark border font-monospace">${requests.length} records</span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr><th>Request ID</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${requests.length === 0 ? `
                                    <tr><td colspan="6" class="text-center py-4 text-muted">No leave requests recorded for this employee.</td></tr>
                                ` : requests.map(r => {
                                    const statusBadges = {
                                        "Approved": `<span class="badge bg-success-subtle text-success border border-success">Approved</span>`,
                                        "Pending": `<span class="badge bg-warning-subtle text-warning border border-warning">Pending</span>`,
                                        "Rejected": `<span class="badge bg-danger-subtle text-danger border border-danger">Rejected</span>`
                                    };
                                    return `
                                        <tr>
                                            <td><span class="font-monospace fw-bold">${r.RequestID}</span></td>
                                            <td><span class="fw-semibold">${r.LeaveType}</span></td>
                                            <td><small class="text-muted">${r.StartDate} &rarr; ${r.EndDate}</small></td>
                                            <td><span class="badge bg-light text-dark border">${r.TotalDays}</span></td>
                                            <td class="text-truncate" style="max-width: 200px;">${r.Reason || '-'}</td>
                                            <td>${statusBadges[r.Status] || r.Status}</td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 14: Assets
    // -------------------------------------------------------------
    function renderAssetsTab() {
        const assets = profileData.assets || [];
        const container = document.getElementById("tab-assets");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-laptop text-primary me-2"></i>Allocated Corporate Assets</h6>
                <button class="btn btn-primary btn-sm" onclick="EmployeeProfile.openSubRecordModal('assets')">
                    <i class="bi bi-plus-circle me-1"></i> Assign Asset
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle border">
                    <thead class="table-light">
                        <tr>
                            <th>Asset Type</th>
                            <th>Device / Item Name</th>
                            <th>Serial Number</th>
                            <th>Issue Date</th>
                            <th>Condition</th>
                            <th>Status</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${assets.length === 0 ? `<tr><td colspan="7" class="text-center py-4 text-muted">No corporate equipment assigned.</td></tr>` : assets.map((a) => `
                            <tr>
                                <td><span class="badge bg-light text-dark border">${a.AssetType}</span></td>
                                <td class="fw-semibold">${a.AssetName}</td>
                                <td><small class="font-monospace">${a.SerialNumber || '—'}</small></td>
                                <td><small>${a.IssueDate || '—'}</small></td>
                                <td><span class="badge bg-info-subtle text-info">${a.Condition || 'Good'}</span></td>
                                <td><span class="badge bg-success-subtle text-success">${a.Status || 'Assigned'}</span></td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-danger" onclick="EmployeeProfile.deleteSubRecord('assets', '${a.AssetID}')"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // Tab 15: HR Confidential Notes
    // -------------------------------------------------------------
    function renderNotesTab() {
        const notes = profileData.notes || [];
        const container = document.getElementById("tab-notes");
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 class="fw-bold mb-0 text-danger"><i class="bi bi-shield-lock-fill me-2"></i>Confidential HR Notes & Case History</h6>
                    <small class="text-muted">Strictly restricted to authorized HR Personnel and Super Administrators.</small>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="EmployeeProfile.openSubRecordModal('notes')">
                    <i class="bi bi-sticky me-1"></i> Add Confidential Note
                </button>
            </div>

            <div class="row g-3">
                ${notes.length === 0 ? `<div class="col-12 text-center py-4 text-muted border rounded">No internal HR case notes logged.</div>` : notes.map((n) => `
                    <div class="col-12">
                        <div class="card border-danger-subtle shadow-sm bg-light">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span class="badge bg-danger text-white me-2">${n.NoteType || 'HR Note'}</span>
                                        <small class="text-muted">${n.CreatedDate} by <strong>${n.CreatedBy || 'HR Admin'}</strong></small>
                                    </div>
                                    <button class="btn btn-sm text-danger p-0" onclick="EmployeeProfile.deleteSubRecord('notes', '${n.NoteID}')"><i class="bi bi-trash"></i></button>
                                </div>
                                <p class="mt-2 mb-0 small text-dark">${n.Note}</p>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    /**
     * Dynamic Modal for Sub-Records
     */
    function openSubRecordModal(subType) {
        let title = "Add Record";
        let bodyHtml = "";

        switch (subType) {
            case "documents":
                title = "Upload Employee Document";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Document Type</label>
                        <select class="form-select" id="sub-doc-type" required>
                            <option value="Passport">Passport</option>
                            <option value="National ID Card">National ID Card</option>
                            <option value="Employment Contract">Employment Contract</option>
                            <option value="Offer Letter">Offer Letter</option>
                            <option value="Work Permit / Visa">Work Permit / Visa</option>
                            <option value="Certificates / Degree">Certificates / Degree</option>
                            <option value="Other HR Document">Other HR Document</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Document Name / Title</label>
                        <input type="text" class="form-control" id="sub-doc-name" required placeholder="e.g. 2026 Passport Renewal">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Document Reference Number</label>
                        <input type="text" class="form-control" id="sub-doc-number" placeholder="e.g. PP-991204">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Issue Date</label>
                            <input type="date" class="form-control" id="sub-doc-issue">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Expiry Date</label>
                            <input type="date" class="form-control" id="sub-doc-expiry">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">File / Cloud URL</label>
                        <input type="url" class="form-control" id="sub-doc-url" placeholder="https://drive.google.com/...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Remarks</label>
                        <textarea class="form-control" id="sub-doc-remarks" rows="2"></textarea>
                    </div>
                `;
                break;

            case "skills":
                title = "Add Technical / Professional Skill";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Skill Name</label>
                        <input type="text" class="form-control" id="sub-skill-name" required placeholder="e.g. Python, Financial Modeling">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Skill Type / Category</label>
                            <input type="text" class="form-control" id="sub-skill-type" placeholder="e.g. Technical, Leadership">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Proficiency Level</label>
                            <select class="form-select" id="sub-skill-level">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate" selected>Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Years of Experience</label>
                        <input type="number" class="form-control" id="sub-skill-exp" min="0" value="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Certification (Optional)</label>
                        <input type="text" class="form-control" id="sub-skill-cert" placeholder="e.g. AWS Certified Developer">
                    </div>
                `;
                break;

            case "experience":
                title = "Add Prior Work Experience";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Company / Employer</label>
                        <input type="text" class="form-control" id="sub-exp-company" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Position Held</label>
                        <input type="text" class="form-control" id="sub-exp-pos" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Start Date</label>
                            <input type="date" class="form-control" id="sub-exp-start">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">End Date</label>
                            <input type="date" class="form-control" id="sub-exp-end">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Key Responsibilities</label>
                        <textarea class="form-control" id="sub-exp-resp" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Reference Contact</label>
                        <input type="text" class="form-control" id="sub-exp-ref">
                    </div>
                `;
                break;

            case "education":
                title = "Add Education Record";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Institution / University</label>
                        <input type="text" class="form-control" id="sub-edu-inst" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label required">Degree / Qualification</label>
                            <input type="text" class="form-control" id="sub-edu-qual" placeholder="e.g. Bachelor of Science" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Field of Study</label>
                            <input type="text" class="form-control" id="sub-edu-field" placeholder="e.g. Computer Science">
                        </div>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Graduation Year</label>
                            <input type="number" class="form-control" id="sub-edu-year" placeholder="2022">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Grade / GPA</label>
                            <input type="text" class="form-control" id="sub-edu-grade" placeholder="e.g. 3.8 / 4.0">
                        </div>
                    </div>
                `;
                break;

            case "training":
                title = "Add Training / Certification";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Course / Program Name</label>
                        <input type="text" class="form-control" id="sub-trn-name" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Provider</label>
                            <input type="text" class="form-control" id="sub-trn-prov">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Training Type</label>
                            <input type="text" class="form-control" id="sub-trn-type" placeholder="Internal / Online / Workshop">
                        </div>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Start Date</label>
                            <input type="date" class="form-control" id="sub-trn-start">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">End Date</label>
                            <input type="date" class="form-control" id="sub-trn-end">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Certificate / Credential ID</label>
                        <input type="text" class="form-control" id="sub-trn-cert">
                    </div>
                `;
                break;

            case "contacts":
                title = "Add Emergency Contact";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Contact Full Name</label>
                        <input type="text" class="form-control" id="sub-cnt-name" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label required">Relationship</label>
                            <select class="form-select" id="sub-cnt-rel">
                                <option value="Spouse">Spouse</option>
                                <option value="Parent">Parent</option>
                                <option value="Child">Child</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label required">Phone Number</label>
                            <input type="tel" class="form-control" id="sub-cnt-phone" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-control" id="sub-cnt-email">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-control" id="sub-cnt-addr">
                    </div>
                `;
                break;

            case "dependents":
                title = "Add Family / Dependent";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Dependent Full Name</label>
                        <input type="text" class="form-control" id="sub-dep-name" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Relationship</label>
                            <input type="text" class="form-control" id="sub-dep-rel" placeholder="Child / Spouse">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Date of Birth</label>
                            <input type="date" class="form-control" id="sub-dep-dob">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Designated Beneficiary?</label>
                        <select class="form-select" id="sub-dep-ben">
                            <option value="No">No</option>
                            <option value="Yes (Primary)">Yes (Primary)</option>
                            <option value="Yes (Secondary)">Yes (Secondary)</option>
                        </select>
                    </div>
                `;
                break;

            case "performance":
                title = "Add Performance Appraisal";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Review Period</label>
                        <input type="text" class="form-control" id="sub-prf-period" required placeholder="e.g. Q3 2026 Appraisal">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Review Date</label>
                            <input type="date" class="form-control" id="sub-prf-date">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Rating</label>
                            <select class="form-select" id="sub-prf-rate">
                                <option value="5 - Exceptional">5 - Exceptional</option>
                                <option value="4 - Exceeds Expectations" selected>4 - Exceeds Expectations</option>
                                <option value="3 - Meets Expectations">3 - Meets Expectations</option>
                                <option value="2 - Needs Improvement">2 - Needs Improvement</option>
                                <option value="1 - Unsatisfactory">1 - Unsatisfactory</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Key Strengths</label>
                        <textarea class="form-control" id="sub-prf-strengths" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Improvement Areas</label>
                        <textarea class="form-control" id="sub-prf-improve" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Agreed Goals</label>
                        <textarea class="form-control" id="sub-prf-goals" rows="2"></textarea>
                    </div>
                `;
                break;

            case "career":
                title = "Add Career & Succession Plan";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label">Target Next Position</label>
                        <input type="text" class="form-control" id="sub-car-next" placeholder="e.g. VP of Engineering">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Career Goals</label>
                        <textarea class="form-control" id="sub-car-goals" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Development Actions</label>
                        <textarea class="form-control" id="sub-car-act" rows="2"></textarea>
                    </div>
                `;
                break;

            case "assets":
                title = "Assign Corporate Asset";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Asset Type</label>
                        <select class="form-select" id="sub-ast-type">
                            <option value="Laptop">Laptop</option>
                            <option value="Mobile Phone">Mobile Phone</option>
                            <option value="Access Card / Key">Access Card / Key</option>
                            <option value="Security Token">Security Token / Yubikey</option>
                            <option value="Vehicle">Company Vehicle</option>
                            <option value="Other">Other Equipment</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Item / Model Name</label>
                        <input type="text" class="form-control" id="sub-ast-name" required placeholder="e.g. MacBook Pro 16 M3">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Serial Number</label>
                            <input type="text" class="form-control" id="sub-ast-sn">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Issue Date</label>
                            <input type="date" class="form-control" id="sub-ast-date" value="${new Date().toISOString().substring(0, 10)}">
                        </div>
                    </div>
                `;
                break;

            case "notes":
                title = "Add Confidential HR Case Note";
                bodyHtml = `
                    <div class="mb-3">
                        <label class="form-label required">Note Category</label>
                        <select class="form-select" id="sub-not-type">
                            <option value="General Milestone">General Milestone</option>
                            <option value="Probation Milestone">Probation Milestone</option>
                            <option value="Performance Incident">Performance Incident</option>
                            <option value="Disciplinary / Warning">Disciplinary / Warning</option>
                            <option value="Compensation Discussion">Compensation Discussion</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Confidential Note</label>
                        <textarea class="form-control" id="sub-not-text" rows="4" required placeholder="Enter confidential case notes..."></textarea>
                    </div>
                `;
                break;
        }

        const modalHtml = `
            <div class="modal fade" id="subRecordModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">${title}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="form-sub-record">
                                ${bodyHtml}
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="btn-save-subrecord">Save Record</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("subRecordModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("subRecordModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-save-subrecord").onclick = async () => {
            const payload = { EmployeeID: currentEmployeeId };

            if (subType === "documents") {
                payload.DocumentTypeID = document.getElementById("sub-doc-type").value;
                payload.DocumentName = document.getElementById("sub-doc-name").value.trim();
                payload.DocumentNumber = document.getElementById("sub-doc-number").value.trim();
                payload.IssueDate = document.getElementById("sub-doc-issue").value;
                payload.ExpiryDate = document.getElementById("sub-doc-expiry").value;
                payload.FileURL = document.getElementById("sub-doc-url").value.trim();
                payload.Remarks = document.getElementById("sub-doc-remarks").value.trim();
                if (!payload.DocumentName) {
                    App.showToast("Please enter document name", "warning");
                    return;
                }
            } else if (subType === "skills") {
                payload.SkillName = document.getElementById("sub-skill-name").value.trim();
                payload.SkillType = document.getElementById("sub-skill-type").value.trim();
                payload.SkillLevel = document.getElementById("sub-skill-level").value;
                payload.YearsOfExperience = parseInt(document.getElementById("sub-skill-exp").value, 10) || 0;
                payload.Certification = document.getElementById("sub-skill-cert").value.trim();
                if (!payload.SkillName) {
                    App.showToast("Please enter skill name", "warning");
                    return;
                }
            } else if (subType === "experience") {
                payload.Company = document.getElementById("sub-exp-company").value.trim();
                payload.Position = document.getElementById("sub-exp-pos").value.trim();
                payload.StartDate = document.getElementById("sub-exp-start").value;
                payload.EndDate = document.getElementById("sub-exp-end").value;
                payload.Responsibilities = document.getElementById("sub-exp-resp").value.trim();
                payload.ReferenceContact = document.getElementById("sub-exp-ref").value.trim();
            } else if (subType === "education") {
                payload.Institution = document.getElementById("sub-edu-inst").value.trim();
                payload.Qualification = document.getElementById("sub-edu-qual").value.trim();
                payload.FieldOfStudy = document.getElementById("sub-edu-field").value.trim();
                payload.GraduationYear = document.getElementById("sub-edu-year").value;
                payload.Grade = document.getElementById("sub-edu-grade").value.trim();
            } else if (subType === "training") {
                payload.TrainingName = document.getElementById("sub-trn-name").value.trim();
                payload.Provider = document.getElementById("sub-trn-prov").value.trim();
                payload.TrainingType = document.getElementById("sub-trn-type").value.trim();
                payload.StartDate = document.getElementById("sub-trn-start").value;
                payload.EndDate = document.getElementById("sub-trn-end").value;
                payload.Certificate = document.getElementById("sub-trn-cert").value.trim();
                payload.Status = "Completed";
            } else if (subType === "contacts") {
                payload.ContactName = document.getElementById("sub-cnt-name").value.trim();
                payload.Relationship = document.getElementById("sub-cnt-rel").value;
                payload.Phone = document.getElementById("sub-cnt-phone").value.trim();
                payload.Email = document.getElementById("sub-cnt-email").value.trim();
                payload.Address = document.getElementById("sub-cnt-addr").value.trim();
                payload.PrimaryContact = "No";
            } else if (subType === "dependents") {
                payload.Name = document.getElementById("sub-dep-name").value.trim();
                payload.Relationship = document.getElementById("sub-dep-rel").value.trim();
                payload.DateOfBirth = document.getElementById("sub-dep-dob").value;
                payload.Beneficiary = document.getElementById("sub-dep-ben").value;
            } else if (subType === "performance") {
                payload.ReviewPeriod = document.getElementById("sub-prf-period").value.trim();
                payload.ReviewDate = document.getElementById("sub-prf-date").value;
                payload.Rating = document.getElementById("sub-prf-rate").value;
                payload.Strengths = document.getElementById("sub-prf-strengths").value.trim();
                payload.ImprovementAreas = document.getElementById("sub-prf-improve").value.trim();
                payload.Goals = document.getElementById("sub-prf-goals").value.trim();
                payload.Reviewer = Auth.getCurrentUser() ? Auth.getCurrentUser().FullName : "HR Manager";
                payload.Status = "Approved";
            } else if (subType === "career") {
                payload.NextPosition = document.getElementById("sub-car-next").value.trim();
                payload.CareerGoals = document.getElementById("sub-car-goals").value.trim();
                payload.DevelopmentPlan = document.getElementById("sub-car-act").value.trim();
                payload.CreatedDate = new Date().toISOString().substring(0, 10);
            } else if (subType === "assets") {
                payload.AssetType = document.getElementById("sub-ast-type").value;
                payload.AssetName = document.getElementById("sub-ast-name").value.trim();
                payload.SerialNumber = document.getElementById("sub-ast-sn").value.trim();
                payload.IssueDate = document.getElementById("sub-ast-date").value;
                payload.Condition = "Good";
                payload.Status = "Assigned";
            } else if (subType === "notes") {
                payload.NoteType = document.getElementById("sub-not-type").value;
                payload.Note = document.getElementById("sub-not-text").value.trim();
                payload.CreatedBy = Auth.getCurrentUser() ? Auth.getCurrentUser().FullName : "HR Officer";
                payload.CreatedDate = new Date().toISOString().replace("T", " ").substring(0, 19);
                payload.Confidential = true;
            }

            const res = await API.call("saveSubRecord", { subType, record: payload }, "POST");
            if (res.success) {
                modal.hide();
                App.showToast("Record added successfully", "success");
                await loadProfileData();
            } else {
                App.showToast(res.message, "danger");
            }
        };
    }

    async function deleteSubRecord(subType, id) {
        App.confirmDialog({
            title: "Delete Record",
            message: "Are you sure you want to delete this record? This action cannot be undone.",
            confirmText: "Yes, Delete",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                const res = await API.call("deleteSubRecord", { subType, id }, "POST");
                if (res.success) {
                    App.showToast("Record deleted", "info");
                    await loadProfileData();
                } else {
                    App.showToast(res.message, "danger");
                }
            }
        });
    }

    return {
        render,
        openSubRecordModal,
        deleteSubRecord
    };
})();

window.EmployeeProfile = EmployeeProfile;
