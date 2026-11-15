/**
 * HR Management System - Recruitment & Applicant Tracking System (ATS)
 * 
 * Provides end-to-end recruitment lifecycle: job requisition management,
 * multi-stage candidate Kanban pipeline, ratings, interview notes, and CSV export.
 */

const Recruitment = (function () {
    let jobOpenings = [];
    let candidatesList = [];
    let activeTab = "pipeline"; // "pipeline", "candidates", "jobs"
    let filterJobId = "All";
    let filterStage = "All";
    let searchQuery = "";

    const STAGES = [
        { id: "Applied", label: "Applied", badgeClass: "bg-info-subtle text-info border-info", icon: "bi-inbox" },
        { id: "Screening", label: "Screening", badgeClass: "bg-primary-subtle text-primary border-primary", icon: "bi-telephone" },
        { id: "Interview", label: "Interview", badgeClass: "bg-warning-subtle text-warning border-warning", icon: "bi-people" },
        { id: "Offer", label: "Offer Extended", badgeClass: "bg-purple-subtle text-purple border-purple", icon: "bi-award" },
        { id: "Hired", label: "Hired", badgeClass: "bg-success-subtle text-success border-success", icon: "bi-check-circle" },
        { id: "Rejected", label: "Archived / Rejected", badgeClass: "bg-danger-subtle text-danger border-danger", icon: "bi-x-circle" }
    ];

    async function loadData() {
        const [jobsRes, candRes] = await Promise.all([
            API.call("getJobOpenings"),
            API.call("getCandidates")
        ]);

        if (jobsRes.success) {
            jobOpenings = jobsRes.data || [];
        }
        if (candRes.success) {
            candidatesList = candRes.data || [];
        }
    }

    async function render(container) {
        API.showLoading("Loading recruitment pipeline...");
        await loadData();
        API.hideLoading();

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-person-badge text-primary me-2"></i><span data-i18n="rec_title">Recruitment & Talent Acquisition</span></h3>
                    <p class="text-muted mb-0" data-i18n="rec_subtitle">Track open requisitions, candidate pipeline stages, interviews, and offers.</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-outline-primary btn-sm" id="btn-add-candidate">
                        <i class="bi bi-person-plus me-1"></i> <span data-i18n="rec_add_candidate">Add Candidate</span>
                    </button>
                    <button class="btn btn-primary btn-sm" id="btn-create-job">
                        <i class="bi bi-briefcase me-1"></i> <span data-i18n="rec_post_job">Post Job Opening</span>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="btn-export-recruitment">
                        <i class="bi bi-file-earmark-spreadsheet me-1"></i> <span data-i18n="btn_export">Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="row g-3 mb-4" id="recruitment-kpi-row">
                <!-- Injected via renderKPIs() -->
            </div>

            <!-- Sub-Navigation Tabs -->
            <ul class="nav nav-pills mb-3" id="recruitment-tabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'pipeline' ? 'active' : ''}" data-tab="pipeline">
                        <i class="bi bi-kanban me-1"></i> <span data-i18n="rec_tab_pipeline">Candidate Pipeline (Kanban)</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'candidates' ? 'active' : ''}" data-tab="candidates">
                        <i class="bi bi-people me-1"></i> <span data-i18n="rec_tab_candidates">All Candidates Directory</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link ${activeTab === 'jobs' ? 'active' : ''}" data-tab="jobs">
                        <i class="bi bi-briefcase me-1"></i> <span data-i18n="rec_tab_jobs">Job Openings & Vacancies</span>
                    </button>
                </li>
            </ul>

            <!-- Dynamic View Container -->
            <div id="recruitment-tab-content">
                <!-- Injected dynamically -->
            </div>
        `;

        attachEventListeners();
        renderActiveTab();
    }

    function attachEventListeners() {
        const tabs = document.querySelectorAll("#recruitment-tabs button");
        tabs.forEach(btn => {
            btn.addEventListener("click", () => {
                tabs.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeTab = btn.getAttribute("data-tab");
                renderActiveTab();
            });
        });

        const addCandBtn = document.getElementById("btn-add-candidate");
        if (addCandBtn) addCandBtn.addEventListener("click", () => openCandidateModal());

        const createJobBtn = document.getElementById("btn-create-job");
        if (createJobBtn) createJobBtn.addEventListener("click", () => openJobModal());

        const exportBtn = document.getElementById("btn-export-recruitment");
        if (exportBtn) exportBtn.addEventListener("click", exportCSV);
    }

    function renderActiveTab() {
        renderKPIs();
        const content = document.getElementById("recruitment-tab-content");
        if (!content) return;

        if (activeTab === "pipeline") {
            renderPipelineView(content);
        } else if (activeTab === "candidates") {
            renderCandidatesTableView(content);
        } else if (activeTab === "jobs") {
            renderJobsView(content);
        }
    }

    function renderKPIs() {
        const kpiRow = document.getElementById("recruitment-kpi-row");
        if (!kpiRow) return;

        const openJobsCount = jobOpenings.filter(j => j.Status === "Open").length;
        const totalCandidates = candidatesList.length;
        const inInterviewCount = candidatesList.filter(c => c.Stage === "Interview").length;
        const hiredCount = candidatesList.filter(c => c.Stage === "Hired").length;

        kpiRow.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="rec_active_openings">${I18n.t('rec_active_openings')}</div>
                                <div class="h2 fw-bold mb-0 text-primary mt-1">${openJobsCount}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-primary-subtle text-primary">
                                <i class="bi bi-briefcase fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Published requisitions</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="rec_total_applicants">${I18n.t('rec_total_applicants')}</div>
                                <div class="h2 fw-bold mb-0 text-dark mt-1">${totalCandidates}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-info-subtle text-info">
                                <i class="bi bi-people fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Active candidates in talent pool</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="rec_in_interview">${I18n.t('rec_in_interview')}</div>
                                <div class="h2 fw-bold mb-0 text-warning mt-1">${inInterviewCount}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-warning-subtle text-warning">
                                <i class="bi bi-chat-left-dots fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Panel & technical evaluations</small>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase" data-i18n="rec_hired">${I18n.t('rec_hired')}</div>
                                <div class="h2 fw-bold mb-0 text-success mt-1">${hiredCount}</div>
                            </div>
                            <div class="kpi-icon-badge rounded-circle p-2 bg-success-subtle text-success">
                                <i class="bi bi-check-circle fs-4"></i>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">Closed-won requisitions</small>
                    </div>
                </div>
            </div>
        `;
    }

    function renderPipelineView(container) {
        container.innerHTML = `
            <!-- Filter Bar -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-semibold mb-1">Filter by Job Opening</label>
                            <select class="form-select form-select-sm" id="kanban-filter-job">
                                <option value="All">All Job Positions</option>
                                ${jobOpenings.map(j => `<option value="${j.JobID}" ${filterJobId === j.JobID ? 'selected' : ''}>${j.JobTitle} (${j.DepartmentID})</option>`).join("")}
                            </select>
                        </div>
                        <div class="col-12 col-md-8">
                            <label class="form-label small fw-semibold mb-1">Search Candidate</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control" id="kanban-filter-search" placeholder="Search candidate name, email, or skill notes..." value="${searchQuery}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Kanban Board Grid -->
            <div class="kanban-board-wrapper" style="overflow-x: auto; padding-bottom: 1rem;">
                <div class="d-flex gap-3" style="min-width: 1100px;">
                    ${STAGES.map(stage => {
                        const stageCandidates = getFilteredCandidates().filter(c => c.Stage === stage.id);
                        return `
                            <div class="kanban-column flex-fill" style="min-width: 260px; max-width: 320px;">
                                <div class="card border-0 shadow-sm bg-light-subtle h-100">
                                    <div class="card-header bg-white py-2 px-3 d-flex justify-content-between align-items-center border-bottom">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge ${stage.badgeClass} rounded-pill p-1 px-2 font-monospace">
                                                <i class="bi ${stage.icon} me-1"></i>${stage.label}
                                            </span>
                                        </div>
                                        <span class="badge bg-secondary-subtle text-secondary rounded-pill font-monospace">${stageCandidates.length}</span>
                                    </div>
                                    <div class="card-body p-2 d-flex flex-column gap-2" style="min-height: 400px; max-height: 70vh; overflow-y: auto;">
                                        ${stageCandidates.length === 0 ? `
                                            <div class="text-center py-4 text-muted small">
                                                <i class="bi bi-dash-circle opacity-50 d-block mb-1"></i>
                                                No candidates
                                            </div>
                                        ` : stageCandidates.map(c => renderKanbanCard(c)).join("")}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;

        const jobFilter = document.getElementById("kanban-filter-job");
        const searchInput = document.getElementById("kanban-filter-search");

        if (jobFilter) {
            jobFilter.addEventListener("change", (e) => {
                filterJobId = e.target.value;
                renderActiveTab();
            });
        }
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                renderActiveTab();
            });
        }
    }

    function getFilteredCandidates() {
        return candidatesList.filter(c => {
            if (filterJobId !== "All" && c.JobID !== filterJobId) return false;
            if (filterStage !== "All" && c.Stage !== filterStage) return false;
            if (searchQuery) {
                const name = (c.FullName || "").toLowerCase();
                const email = (c.Email || "").toLowerCase();
                const notes = (c.Notes || "").toLowerCase();
                const role = (c.CurrentRole || "").toLowerCase();
                if (!name.includes(searchQuery) && !email.includes(searchQuery) && !notes.includes(searchQuery) && !role.includes(searchQuery)) {
                    return false;
                }
            }
            return true;
        });
    }

    function renderKanbanCard(c) {
        const job = jobOpenings.find(j => j.JobID === c.JobID) || { JobTitle: "Position", DepartmentID: "" };
        const stars = Array(5).fill(0).map((_, i) => `
            <i class="bi ${i < (c.Rating || 0) ? 'bi-star-fill text-warning' : 'bi-star text-muted opacity-25'}" style="font-size: 0.72rem;"></i>
        `).join("");

        return `
            <div class="card border border-light-subtle shadow-sm bg-white kanban-candidate-card">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="fw-bold text-dark mb-0 font-monospace" style="font-size: 0.9rem;">
                            <a href="javascript:void(0)" class="text-decoration-none text-dark" onclick="Recruitment.viewCandidate('${c.CandidateID}')">
                                ${c.FullName}
                            </a>
                        </h6>
                        <div class="d-flex align-items-center">${stars}</div>
                    </div>
                    <div class="text-primary small fw-semibold text-truncate mb-1" style="font-size: 0.78rem;">
                        <i class="bi bi-briefcase me-1"></i>${job.JobTitle}
                    </div>
                    <div class="text-muted small text-truncate mb-2" style="font-size: 0.75rem;">
                        ${c.CurrentRole || 'Candidate'} &bull; ${c.ExperienceYears || 0} yrs exp
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-1 border-top border-light-subtle">
                        <small class="text-muted" style="font-size: 0.7rem;">
                            <i class="bi bi-clock me-1"></i>${c.AppliedDate || ''}
                        </small>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light border py-0 px-2 dropdown-toggle" data-bs-toggle="dropdown" style="font-size: 0.75rem;">
                                Move
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                                ${STAGES.map(s => `
                                    <li>
                                        <button class="dropdown-item ${s.id === c.Stage ? 'active' : ''}" onclick="Recruitment.changeStage('${c.CandidateID}', '${s.id}')">
                                            <i class="bi ${s.icon} me-2"></i> ${s.label}
                                        </button>
                                    </li>
                                `).join("")}
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <button class="dropdown-item text-danger" onclick="Recruitment.deleteCandidate('${c.CandidateID}')">
                                        <i class="bi bi-trash me-2"></i> Remove Candidate
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCandidatesTableView(container) {
        const filtered = getFilteredCandidates();

        container.innerHTML = `
            <!-- Filter Toolbar -->
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Target Job</label>
                            <select class="form-select form-select-sm" id="table-filter-job">
                                <option value="All">All Job Positions</option>
                                ${jobOpenings.map(j => `<option value="${j.JobID}" ${filterJobId === j.JobID ? 'selected' : ''}>${j.JobTitle}</option>`).join("")}
                            </select>
                        </div>
                        <div class="col-6 col-md-3">
                            <label class="form-label small fw-semibold mb-1">Stage</label>
                            <select class="form-select form-select-sm" id="table-filter-stage">
                                <option value="All">All Stages</option>
                                ${STAGES.map(s => `<option value="${s.id}" ${filterStage === s.id ? 'selected' : ''}>${s.label}</option>`).join("")}
                            </select>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-semibold mb-1">Search Candidate</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" class="form-control" id="table-filter-search" placeholder="Search by name, email, or role..." value="${searchQuery}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold mb-0">Candidate Master Directory</h6>
                    <span class="badge bg-light text-dark border font-monospace">${filtered.length} candidates</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Candidate</th>
                                <th>Applying For</th>
                                <th>Experience</th>
                                <th>Stage</th>
                                <th>Rating</th>
                                <th>Applied Date</th>
                                <th>Contact Details</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="8" class="text-center py-5 text-muted">
                                        <i class="bi bi-people fs-1 text-secondary opacity-50 d-block mb-2"></i>
                                        No candidates found matching the criteria.
                                    </td>
                                </tr>
                            ` : filtered.map(c => {
                                const job = jobOpenings.find(j => j.JobID === c.JobID) || { JobTitle: "General Applicant", DepartmentID: "" };
                                const stageObj = STAGES.find(s => s.id === c.Stage) || STAGES[0];
                                return `
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">
                                                <a href="javascript:void(0)" class="text-decoration-none text-dark" onclick="Recruitment.viewCandidate('${c.CandidateID}')">
                                                    ${c.FullName}
                                                </a>
                                            </div>
                                            <div class="text-muted small">${c.CurrentRole || '-'}</div>
                                        </td>
                                        <td>
                                            <div class="fw-semibold small">${job.JobTitle}</div>
                                            <div class="text-muted small">${job.DepartmentID || ''}</div>
                                        </td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${c.ExperienceYears || 0} yrs</span></td>
                                        <td>
                                            <span class="badge ${stageObj.badgeClass}"><i class="bi ${stageObj.icon} me-1"></i>${stageObj.label}</span>
                                        </td>
                                        <td>
                                            <div class="text-warning small">
                                                ${Array(5).fill(0).map((_, i) => `<i class="bi ${i < (c.Rating || 0) ? 'bi-star-fill' : 'bi-star text-muted opacity-25'}"></i>`).join("")}
                                            </div>
                                        </td>
                                        <td><span class="text-muted small">${c.AppliedDate || '-'}</span></td>
                                        <td>
                                            <div class="small"><i class="bi bi-envelope me-1 text-muted"></i>${c.Email || '-'}</div>
                                            <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${c.Phone || '-'}</div>
                                        </td>
                                        <td class="text-end">
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary py-1 px-2" title="View details" onclick="Recruitment.viewCandidate('${c.CandidateID}')">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-primary py-1 px-2" title="Edit candidate" onclick="Recruitment.editCandidate('${c.CandidateID}')">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-outline-danger py-1 px-2" title="Delete candidate" onclick="Recruitment.deleteCandidate('${c.CandidateID}')">
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
            </div>
        `;

        const jobFilter = document.getElementById("table-filter-job");
        const stageFilter = document.getElementById("table-filter-stage");
        const searchInput = document.getElementById("table-filter-search");

        if (jobFilter) {
            jobFilter.addEventListener("change", (e) => {
                filterJobId = e.target.value;
                renderActiveTab();
            });
        }
        if (stageFilter) {
            stageFilter.addEventListener("change", (e) => {
                filterStage = e.target.value;
                renderActiveTab();
            });
        }
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                renderActiveTab();
            });
        }
    }

    function renderJobsView(container) {
        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0">Open Job Requisitions</h6>
                        <small class="text-muted">Headcount requirements across departments</small>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="Recruitment.openJobModal()">
                        <i class="bi bi-plus-circle me-1"></i> Create Requisition
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Job Title</th>
                                <th>Department</th>
                                <th>Type</th>
                                <th>Positions</th>
                                <th>Applicants</th>
                                <th>Target Closing</th>
                                <th>Salary Budget</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jobOpenings.map(j => {
                                const statusBadges = {
                                    "Open": `<span class="badge bg-success-subtle text-success border border-success">Open</span>`,
                                    "In Review": `<span class="badge bg-warning-subtle text-warning border border-warning">In Review</span>`,
                                    "Filled": `<span class="badge bg-primary-subtle text-primary border border-primary">Filled</span>`,
                                    "Closed": `<span class="badge bg-secondary-subtle text-secondary border border-secondary">Closed</span>`
                                };

                                return `
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">${j.JobTitle}</div>
                                            <div class="text-muted font-monospace small" style="font-size: 0.75rem;">${j.JobID}</div>
                                        </td>
                                        <td><span class="small fw-semibold">${j.DepartmentID}</span></td>
                                        <td><span class="badge bg-light text-dark border">${j.EmploymentType || 'Permanent'}</span></td>
                                        <td><span class="fw-bold">${j.Positions || 1}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-link text-decoration-none p-0 fw-bold" onclick="Recruitment.filterByJob('${j.JobID}')">
                                                ${j.ApplicantsCount || 0} applicants <i class="bi bi-arrow-right-short"></i>
                                            </button>
                                        </td>
                                        <td><span class="small text-muted">${j.ClosingDate || '-'}</span></td>
                                        <td>
                                            <span class="small font-monospace text-dark">$${(j.SalaryMin || 0).toLocaleString()} - $${(j.SalaryMax || 0).toLocaleString()}</span>
                                        </td>
                                        <td>${statusBadges[j.Status] || j.Status}</td>
                                        <td class="text-end">
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-secondary py-1 px-2" title="Edit Opening" onclick="Recruitment.openJobModal('${j.JobID}')">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-outline-danger py-1 px-2" title="Delete Opening" onclick="Recruitment.deleteJob('${j.JobID}')">
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
            </div>
        `;
    }

    function filterByJob(jobId) {
        filterJobId = jobId;
        activeTab = "pipeline";
        const tabs = document.querySelectorAll("#recruitment-tabs button");
        tabs.forEach(b => {
            if (b.getAttribute("data-tab") === "pipeline") b.classList.add("active");
            else b.classList.remove("active");
        });
        renderActiveTab();
    }

    function openJobModal(jobId = null) {
        const existingJob = jobId ? jobOpenings.find(j => j.JobID === jobId) : null;
        const modalId = "jobOpeningModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${existingJob ? 'bi-pencil' : 'bi-briefcase'} text-primary me-2"></i>
                                ${existingJob ? 'Edit Job Requisition' : 'Create Job Opening'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-job-opening">
                                <input type="hidden" id="modal-job-id" value="${existingJob ? existingJob.JobID : ''}">
                                <div class="row g-2 mb-3">
                                    <div class="col-md-8">
                                        <label class="form-label small fw-semibold">Job Title <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="modal-job-title" value="${existingJob ? existingJob.JobTitle : ''}" required placeholder="e.g. Senior Backend Engineer">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Department <span class="text-danger">*</span></label>
                                        <select class="form-select" id="modal-job-dept" required>
                                            <option value="Engineering & IT" ${existingJob && existingJob.DepartmentID === 'Engineering & IT' ? 'selected' : ''}>Engineering & IT</option>
                                            <option value="Human Resources" ${existingJob && existingJob.DepartmentID === 'Human Resources' ? 'selected' : ''}>Human Resources</option>
                                            <option value="Finance & Accounting" ${existingJob && existingJob.DepartmentID === 'Finance & Accounting' ? 'selected' : ''}>Finance & Accounting</option>
                                            <option value="Sales & Marketing" ${existingJob && existingJob.DepartmentID === 'Sales & Marketing' ? 'selected' : ''}>Sales & Marketing</option>
                                            <option value="Operations" ${existingJob && existingJob.DepartmentID === 'Operations' ? 'selected' : ''}>Operations</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Employment Type</label>
                                        <select class="form-select" id="modal-job-type">
                                            <option value="Permanent" ${existingJob && existingJob.EmploymentType === 'Permanent' ? 'selected' : ''}>Permanent Full-time</option>
                                            <option value="Contract" ${existingJob && existingJob.EmploymentType === 'Contract' ? 'selected' : ''}>Contract</option>
                                            <option value="Temporary" ${existingJob && existingJob.EmploymentType === 'Temporary' ? 'selected' : ''}>Temporary</option>
                                            <option value="Intern" ${existingJob && existingJob.EmploymentType === 'Intern' ? 'selected' : ''}>Internship</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Open Positions</label>
                                        <input type="number" class="form-control" id="modal-job-positions" value="${existingJob ? existingJob.Positions : 1}" min="1">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Status</label>
                                        <select class="form-select" id="modal-job-status">
                                            <option value="Open" ${existingJob && existingJob.Status === 'Open' ? 'selected' : ''}>Open</option>
                                            <option value="In Review" ${existingJob && existingJob.Status === 'In Review' ? 'selected' : ''}>In Review</option>
                                            <option value="Filled" ${existingJob && existingJob.Status === 'Filled' ? 'selected' : ''}>Filled</option>
                                            <option value="Closed" ${existingJob && existingJob.Status === 'Closed' ? 'selected' : ''}>Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Salary Range Min ($)</label>
                                        <input type="number" class="form-control" id="modal-job-salmin" value="${existingJob ? existingJob.SalaryMin : 60000}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Salary Range Max ($)</label>
                                        <input type="number" class="form-control" id="modal-job-salmax" value="${existingJob ? existingJob.SalaryMax : 90000}">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold">Closing Target Date</label>
                                        <input type="date" class="form-control" id="modal-job-closing" value="${existingJob ? existingJob.ClosingDate : '2026-12-31'}">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Role Description</label>
                                    <textarea class="form-control" id="modal-job-desc" rows="2" placeholder="Summary of responsibilities...">${existingJob ? (existingJob.Description || '') : ''}</textarea>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Key Requirements & Skills</label>
                                    <textarea class="form-control" id="modal-job-reqs" rows="2" placeholder="Required degrees, technologies, years of experience...">${existingJob ? (existingJob.Requirements || '') : ''}</textarea>
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Job Requisition</button>
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

        const form = document.getElementById("form-job-opening");
        form.onsubmit = async (e) => {
            e.preventDefault();
            modal.hide();
            API.showLoading("Saving job opening...");
            const jobData = {
                JobID: document.getElementById("modal-job-id").value || undefined,
                JobTitle: document.getElementById("modal-job-title").value,
                DepartmentID: document.getElementById("modal-job-dept").value,
                EmploymentType: document.getElementById("modal-job-type").value,
                Positions: parseInt(document.getElementById("modal-job-positions").value, 10) || 1,
                Status: document.getElementById("modal-job-status").value,
                SalaryMin: parseFloat(document.getElementById("modal-job-salmin").value) || 0,
                SalaryMax: parseFloat(document.getElementById("modal-job-salmax").value) || 0,
                ClosingDate: document.getElementById("modal-job-closing").value,
                Description: document.getElementById("modal-job-desc").value,
                Requirements: document.getElementById("modal-job-reqs").value
            };

            await API.call("saveJobOpening", jobData);
            await loadData();
            renderActiveTab();
            API.hideLoading();
            App.showToast("Job requisition saved successfully", "success");
        };
    }

    function openCandidateModal(candId = null) {
        const existingCand = candId ? candidatesList.find(c => c.CandidateID === candId) : null;
        const modalId = "candidateModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">
                                <i class="bi ${existingCand ? 'bi-pencil' : 'bi-person-plus'} text-primary me-2"></i>
                                ${existingCand ? 'Edit Candidate Profile' : 'Add Applicant / Candidate'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-candidate-modal">
                                <input type="hidden" id="modal-cand-id" value="${existingCand ? existingCand.CandidateID : ''}">
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Full Name <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="modal-cand-name" value="${existingCand ? existingCand.FullName : ''}" required placeholder="e.g. John Doe">
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Email Address <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="modal-cand-email" value="${existingCand ? existingCand.Email : ''}" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Phone Number</label>
                                        <input type="text" class="form-control" id="modal-cand-phone" value="${existingCand ? (existingCand.Phone || '') : ''}">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Target Job Position <span class="text-danger">*</span></label>
                                    <select class="form-select" id="modal-cand-job" required>
                                        ${jobOpenings.map(j => `
                                            <option value="${j.JobID}" ${existingCand && existingCand.JobID === j.JobID ? 'selected' : ''}>
                                                ${j.JobTitle} (${j.DepartmentID})
                                            </option>
                                        `).join("")}
                                    </select>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Current Title / Employer</label>
                                        <input type="text" class="form-control" id="modal-cand-role" value="${existingCand ? (existingCand.CurrentRole || '') : ''}" placeholder="e.g. Software Dev at Acme">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Years of Experience</label>
                                        <input type="number" step="0.5" class="form-control" id="modal-cand-exp" value="${existingCand ? (existingCand.ExperienceYears || 3) : 3}">
                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Recruitment Stage</label>
                                        <select class="form-select" id="modal-cand-stage">
                                            ${STAGES.map(s => `
                                                <option value="${s.id}" ${existingCand && existingCand.Stage === s.id ? 'selected' : ''}>${s.label}</option>
                                            `).join("")}
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-semibold">Candidate Rating (1-5)</label>
                                        <select class="form-select" id="modal-cand-rating">
                                            <option value="5" ${existingCand && existingCand.Rating === 5 ? 'selected' : ''}>5 Stars - Outstanding</option>
                                            <option value="4" ${existingCand && existingCand.Rating === 4 ? 'selected' : ''}>4 Stars - Strong Fit</option>
                                            <option value="3" ${!existingCand || (existingCand && existingCand.Rating === 3) ? 'selected' : ''}>3 Stars - Average</option>
                                            <option value="2" ${existingCand && existingCand.Rating === 2 ? 'selected' : ''}>2 Stars - Weak Fit</option>
                                            <option value="1" ${existingCand && existingCand.Rating === 1 ? 'selected' : ''}>1 Star - Not Recommended</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Resume / Portfolio URL</label>
                                    <input type="url" class="form-control" id="modal-cand-resume" value="${existingCand ? (existingCand.ResumeURL || '') : ''}" placeholder="https://drive.google.com/... or linkedin">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Interview Notes & Feedback</label>
                                    <textarea class="form-control" id="modal-cand-notes" rows="2" placeholder="Key strengths, interview observations...">${existingCand ? (existingCand.Notes || '') : ''}</textarea>
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-2">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Candidate</button>
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

        const form = document.getElementById("form-candidate-modal");
        form.onsubmit = async (e) => {
            e.preventDefault();
            modal.hide();
            API.showLoading("Saving candidate...");
            const data = {
                CandidateID: document.getElementById("modal-cand-id").value || undefined,
                FullName: document.getElementById("modal-cand-name").value,
                Email: document.getElementById("modal-cand-email").value,
                Phone: document.getElementById("modal-cand-phone").value,
                JobID: document.getElementById("modal-cand-job").value,
                CurrentRole: document.getElementById("modal-cand-role").value,
                ExperienceYears: parseFloat(document.getElementById("modal-cand-exp").value) || 0,
                Stage: document.getElementById("modal-cand-stage").value,
                Rating: parseInt(document.getElementById("modal-cand-rating").value, 10) || 3,
                ResumeURL: document.getElementById("modal-cand-resume").value,
                Notes: document.getElementById("modal-cand-notes").value
            };

            await API.call("saveCandidate", data);
            await loadData();
            renderActiveTab();
            API.hideLoading();
            App.showToast("Candidate profile saved successfully", "success");
        };
    }

    async function changeStage(candId, newStage) {
        API.showLoading("Updating stage...");
        const res = await API.call("updateCandidateStage", {
            id: candId,
            stage: newStage
        });

        if (res.success) {
            App.showToast(`Candidate moved to ${newStage}`, "success");
            await loadData();
            renderActiveTab();
        } else {
            App.showToast(res.message || "Failed to update stage", "danger");
        }
        API.hideLoading();
    }

    function viewCandidate(candId) {
        const c = candidatesList.find(cand => cand.CandidateID === candId);
        if (!c) return;
        const job = jobOpenings.find(j => j.JobID === c.JobID) || { JobTitle: "Position", DepartmentID: "" };
        const stageObj = STAGES.find(s => s.id === c.Stage) || STAGES[0];

        const modalId = "candidateDetailModal";
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">Candidate: ${c.FullName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-3">
                            <div class="text-center mb-3">
                                <div class="avatar-initials bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-4 mb-2" style="width: 54px; height: 54px;">
                                    ${(c.FullName[0] || 'C')}
                                </div>
                                <h5 class="fw-bold mb-0">${c.FullName}</h5>
                                <div class="text-muted small">${c.CurrentRole || 'Applicant'}</div>
                                <div class="mt-2">
                                    <span class="badge ${stageObj.badgeClass}"><i class="bi ${stageObj.icon} me-1"></i>${stageObj.label}</span>
                                    <span class="badge bg-warning-subtle text-warning border border-warning ms-1">${c.Rating || 0} / 5 Stars</span>
                                </div>
                            </div>

                            <table class="table table-sm table-borderless mb-3">
                                <tr><th class="text-muted w-35">Job Position:</th><td class="fw-bold">${job.JobTitle} (${job.DepartmentID})</td></tr>
                                <tr><th class="text-muted">Email:</th><td><a href="mailto:${c.Email}">${c.Email}</a></td></tr>
                                <tr><th class="text-muted">Phone:</th><td>${c.Phone || '-'}</td></tr>
                                <tr><th class="text-muted">Experience:</th><td>${c.ExperienceYears || 0} years</td></tr>
                                <tr><th class="text-muted">Applied Date:</th><td>${c.AppliedDate || '-'}</td></tr>
                                <tr>
                                    <th class="text-muted">Resume:</th>
                                    <td>
                                        ${c.ResumeURL ? `<a href="${c.ResumeURL}" target="_blank" class="btn btn-xs btn-outline-primary py-0 px-2"><i class="bi bi-file-earmark-pdf me-1"></i>Open Resume</a>` : '<span class="text-muted">Not provided</span>'}
                                    </td>
                                </tr>
                            </table>

                            <div class="bg-light p-3 rounded">
                                <div class="small fw-bold text-dark mb-1">Interview Assessment & Feedback:</div>
                                <p class="small text-muted mb-0">${c.Notes || 'No notes added yet.'}</p>
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0 d-flex justify-content-between">
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="Recruitment.deleteCandidate('${c.CandidateID}')">
                                <i class="bi bi-trash me-1"></i> Delete
                            </button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="Recruitment.editCandidate('${c.CandidateID}')">
                                    <i class="bi bi-pencil me-1"></i> Edit
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
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
    }

    function editCandidate(candId) {
        const detailModal = document.getElementById("candidateDetailModal");
        if (detailModal) {
            const m = bootstrap.Modal.getInstance(detailModal);
            if (m) m.hide();
        }
        openCandidateModal(candId);
    }

    function deleteCandidate(candId) {
        const detailModal = document.getElementById("candidateDetailModal");
        if (detailModal) {
            const m = bootstrap.Modal.getInstance(detailModal);
            if (m) m.hide();
        }

        App.confirmDialog({
            title: "Delete Candidate",
            message: "Are you sure you want to remove this candidate from the recruitment pipeline?",
            confirmText: "Delete",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                API.showLoading("Deleting candidate...");
                await API.call("deleteCandidate", { id: candId });
                await loadData();
                renderActiveTab();
                API.hideLoading();
                App.showToast("Candidate removed from pipeline", "success");
            }
        });
    }

    function deleteJob(jobId) {
        App.confirmDialog({
            title: "Delete Job Opening",
            message: "Are you sure you want to remove this job requisition?",
            confirmText: "Delete",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                API.showLoading("Deleting job requisition...");
                await API.call("deleteJobOpening", { id: jobId });
                await loadData();
                renderActiveTab();
                API.hideLoading();
                App.showToast("Job requisition deleted", "success");
            }
        });
    }

    function exportCSV() {
        if (candidatesList.length === 0) {
            App.showToast("No candidates to export", "warning");
            return;
        }

        const headers = ["CandidateID", "FullName", "Email", "Phone", "JobID", "JobTitle", "Stage", "ExperienceYears", "Rating", "AppliedDate", "Notes"];
        const rows = candidatesList.map(c => {
            const job = jobOpenings.find(j => j.JobID === c.JobID) || {};
            return [
                c.CandidateID,
                `"${c.FullName}"`,
                `"${c.Email}"`,
                `"${c.Phone || ''}"`,
                c.JobID,
                `"${job.JobTitle || ''}"`,
                c.Stage,
                c.ExperienceYears || 0,
                c.Rating || 0,
                c.AppliedDate || '',
                `"${(c.Notes || '').replace(/"/g, '""')}"`
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ApexHR_Candidates_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        App.showToast("Candidates CSV exported", "info");
    }

    return {
        render,
        changeStage,
        viewCandidate,
        editCandidate,
        deleteCandidate,
        openCandidateModal,
        openJobModal,
        deleteJob,
        filterByJob
    };
})();

window.Recruitment = Recruitment;