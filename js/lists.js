/**
 * HR Management System - Master Data & Dynamic Dropdown Lists
 * 
 * Allows HR Admins to add, edit, reorder, or toggle dropdown values at runtime
 * without modifying source code.
 */

const MasterLists = (function () {
    let allListItems = [];
    let activeCategory = "Department";

    const CATEGORIES = [
        { id: "Department", name: "Departments", icon: "bi-diagram-3" },
        { id: "Position", name: "Positions & Titles", icon: "bi-briefcase" },
        { id: "EmploymentType", name: "Employment Types", icon: "bi-person-badge" },
        { id: "EmploymentStatus", name: "Employment Statuses", icon: "bi-hourglass-split" },
        { id: "Gender", name: "Gender Options", icon: "bi-gender-ambiguous" },
        { id: "SkillLevel", name: "Skill Proficiency Levels", icon: "bi-award" },
        { id: "DocumentType", name: "Document Types", icon: "bi-file-earmark-text" },
        { id: "TrainingType", name: "Training Classifications", icon: "bi-patch-check" },
        { id: "Relationship", name: "Emergency Relationships", icon: "bi-people" }
    ];

    async function render(container) {
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="fw-bold mb-1"><i class="bi bi-list-nested text-primary me-2"></i><span data-i18n="lists_title">Master Data & Dropdown Lists</span></h3>
                    <p class="text-muted mb-0">Configure system dropdown values, departments, and classifications dynamically.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm" id="btn-add-list-item">
                        <i class="bi bi-plus-circle me-1"></i> Add Option to <span id="btn-category-label">Department</span>
                    </button>
                </div>
            </div>

            <div class="row g-3">
                <!-- Left Categories List -->
                <div class="col-md-4 col-lg-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white fw-bold py-3">List Categories</div>
                        <div class="list-group list-group-flush" id="categories-nav">
                            ${CATEGORIES.map((c) => `
                                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}">
                                    <div><i class="bi ${c.icon} me-2"></i>${c.name}</div>
                                    <span class="badge ${c.id === activeCategory ? 'bg-white text-primary' : 'bg-light text-dark'} rounded-pill" id="cat-count-${c.id}">0</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </div>

                <!-- Right Category Options Table -->
                <div class="col-md-8 col-lg-9">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold mb-0" id="current-category-title">Departments</h6>
                                <small class="text-muted" id="current-category-desc">Options active in employee and sub-record forms.</small>
                            </div>
                            <span class="badge bg-light text-dark border" id="category-items-count">0 options configured</span>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="ps-3 text-nowrap" style="width: 70px;">Order</th>
                                            <th class="text-nowrap">Option Value / Label</th>
                                            <th class="text-nowrap">Internal Code</th>
                                            <th class="text-nowrap">Default?</th>
                                            <th class="text-nowrap">Status</th>
                                            <th class="text-end pe-3 text-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="list-items-table-body">
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-muted">Loading options...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupEvents();
        await loadData();
    }

    function setupEvents() {
        const catButtons = document.querySelectorAll("#categories-nav button");
        catButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                catButtons.forEach((b) => {
                    b.classList.remove("active");
                    const bBadge = b.querySelector(".badge");
                    if (bBadge) {
                        bBadge.className = "badge bg-light text-dark rounded-pill";
                    }
                });
                btn.classList.add("active");
                const activeBadge = btn.querySelector(".badge");
                if (activeBadge) {
                    activeBadge.className = "badge bg-white text-primary rounded-pill";
                }

                activeCategory = btn.getAttribute("data-cat");
                const catObj = CATEGORIES.find((c) => c.id === activeCategory);
                document.getElementById("btn-category-label").textContent = catObj ? catObj.name : activeCategory;
                document.getElementById("current-category-title").textContent = catObj ? catObj.name : activeCategory;
                renderCategoryItems();
            });
        });

        document.getElementById("btn-add-list-item").onclick = () => openItemModal();
    }

    async function loadData() {
        const res = await API.call("getMasterLists", {}, "GET", true);
        if (res.success && res.data) {
            allListItems = res.data;
            updateCategoryCounts();
            renderCategoryItems();
        }
    }

    function updateCategoryCounts() {
        CATEGORIES.forEach((c) => {
            const count = allListItems.filter((i) => i.Category === c.id).length;
            const badge = document.getElementById(`cat-count-${c.id}`);
            if (badge) badge.textContent = count;
        });
    }

    function renderCategoryItems() {
        const tbody = document.getElementById("list-items-table-body");
        const countBadge = document.getElementById("category-items-count");
        if (!tbody) return;

        const items = allListItems
            .filter((i) => i.Category === activeCategory)
            .sort((a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0));

        if (countBadge) countBadge.textContent = `${items.length} options configured`;

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="bi bi-inbox fs-2 text-muted d-block mb-2"></i>
                        <h6 class="fw-bold">No options for this category yet</h6>
                        <p class="text-muted small">Click the button above to add the first dropdown option.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = items.map((item) => {
            const isActive = item.IsActive !== false;

            return `
                <tr>
                    <td class="ps-3 text-nowrap"><span class="badge bg-light text-dark font-monospace">${item.DisplayOrder || 1}</span></td>
                    <td class="fw-bold text-nowrap">${item.ItemValue}</td>
                    <td class="text-nowrap"><span class="badge bg-light text-muted font-monospace">${item.ItemCode || '—'}</span></td>
                    <td class="text-nowrap">${item.IsDefault ? '<span class="badge bg-success-subtle text-success"><i class="bi bi-check2 me-1"></i>Default</span>' : '<span class="text-muted small">—</span>'}</td>
                    <td class="text-nowrap"><span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">${isActive ? 'Active' : 'Inactive'}</span></td>
                    <td class="text-end pe-3 text-nowrap">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" title="Edit Option" onclick="MasterLists.openItemModal('${item.ListID}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}" title="${isActive ? 'Deactivate' : 'Activate'}" onclick="MasterLists.toggleItemStatus('${item.ListID}')">
                                <i class="bi ${isActive ? 'bi-eye-slash' : 'bi-eye'}"></i>
                            </button>
                            <button class="btn btn-outline-danger" title="Delete Option" onclick="MasterLists.deleteItem('${item.ListID}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function openItemModal(listId = null) {
        const item = listId ? allListItems.find((i) => i.ListID === listId) : {};
        const isEdit = !!listId;

        const modalHtml = `
            <div class="modal fade" id="masterListModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">${isEdit ? 'Edit Option' : 'Add New Option'}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="form-master-item">
                                <div class="mb-3">
                                    <label class="form-label text-muted small">Category</label>
                                    <input type="text" class="form-control" value="${activeCategory}" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">Option Value / Display Label</label>
                                    <input type="text" class="form-control" id="item-val" required value="${item.ItemValue || ''}" placeholder="e.g. Quality Assurance">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Internal Code (Optional)</label>
                                    <input type="text" class="form-control font-monospace" id="item-code" value="${item.ItemCode || ''}" placeholder="e.g. DEP_QA">
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label">Display Order</label>
                                        <input type="number" class="form-control" id="item-order" value="${item.DisplayOrder || 1}">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Set as Default?</label>
                                        <select class="form-select" id="item-default">
                                            <option value="false" ${!item.IsDefault ? 'selected' : ''}>No</option>
                                            <option value="true" ${item.IsDefault ? 'selected' : ''}>Yes</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-check form-switch mt-2">
                                    <input class="form-check-input" type="checkbox" id="item-active" ${item.IsActive !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="item-active">Active in application dropdowns</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="btn-save-item-submit">Save Option</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById("masterListModal");
        if (existing) existing.remove();

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("masterListModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        document.getElementById("btn-save-item-submit").onclick = async () => {
            const val = document.getElementById("item-val").value.trim();
            if (!val) {
                App.showToast("Option value is required", "warning");
                return;
            }

            const payload = {
                ListID: item.ListID || undefined,
                Category: activeCategory,
                ItemValue: val,
                ItemCode: document.getElementById("item-code").value.trim() || (activeCategory.substring(0, 3).toUpperCase() + "_" + val.substring(0, 3).toUpperCase()),
                DisplayOrder: parseInt(document.getElementById("item-order").value, 10) || 1,
                IsDefault: document.getElementById("item-default").value === "true",
                IsActive: document.getElementById("item-active").checked
            };

            const res = await API.call("saveMasterListItem", payload, "POST");
            if (res.success) {
                modal.hide();
                App.showToast(`Option "${val}" saved into ${activeCategory}`, "success");
                await loadData();
            } else {
                App.showToast(res.message, "danger");
            }
        };
    }

    async function toggleItemStatus(listId) {
        const item = allListItems.find((i) => i.ListID === listId);
        if (!item) return;
        const newStatus = !(item.IsActive !== false);
        const res = await API.call("saveMasterListItem", { ...item, IsActive: newStatus }, "POST");
        if (res.success) {
            App.showToast(`Option ${newStatus ? 'activated' : 'deactivated'}`, "info");
            await loadData();
        }
    }

    async function deleteItem(listId) {
        App.confirmDialog({
            title: "Delete Option",
            message: "Are you sure you want to delete this dropdown option? Existing employee records using this value will retain their text.",
            confirmText: "Delete Option",
            confirmBtnClass: "btn-danger",
            onConfirm: async () => {
                const res = await API.call("deleteMasterListItem", { id: listId }, "POST");
                if (res.success) {
                    App.showToast("Option deleted", "info");
                    await loadData();
                } else {
                    App.showToast(res.message, "danger");
                }
            }
        });
    }

    return {
        render,
        openItemModal,
        toggleItemStatus,
        deleteItem
    };
})();

window.MasterLists = MasterLists;
