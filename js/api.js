/**
 * HR Management System - API Client & Data Access Layer
 * 
 * Manages communication with the Google Apps Script Web App API.
 * Seamlessly falls back to rich local demo state when CONFIG.API_URL is unconfigured.
 */

const API = (function () {
    let connectionState = "disconnected"; // "connecting", "connected-api", "connected-demo", "error"
    let statusListeners = [];

    // Local in-memory repository initialized from localStorage or SAMPLE_DATA for Demo Mode
    let demoStore = null;

    function initDemoStore() {
        try {
            const saved = localStorage.getItem("APEX_HR_DEMO_STORE");
            if (saved) {
                demoStore = JSON.parse(saved);
                // Backfill expansion collections if they are missing in cached localStorage
                const s = window.SAMPLE_DATA || {};
                if (!demoStore.attendance) demoStore.attendance = JSON.parse(JSON.stringify(s.attendance || []));
                if (!demoStore.leaveRequests) demoStore.leaveRequests = JSON.parse(JSON.stringify(s.leaveRequests || []));
                if (!demoStore.leaveBalances) demoStore.leaveBalances = JSON.parse(JSON.stringify(s.leaveBalances || []));
                if (!demoStore.jobOpenings) demoStore.jobOpenings = JSON.parse(JSON.stringify(s.jobOpenings || []));
                if (!demoStore.candidates) demoStore.candidates = JSON.parse(JSON.stringify(s.candidates || []));
                if (!demoStore.payroll) demoStore.payroll = JSON.parse(JSON.stringify(s.payroll || []));
                if (s.users && Array.isArray(s.users)) {
                    if (!demoStore.users) demoStore.users = [];
                    s.users.forEach(sampleU => {
                        if (!demoStore.users.some(u => u.Username.toLowerCase() === sampleU.Username.toLowerCase() || u.UserID === sampleU.UserID)) {
                            demoStore.users.push(JSON.parse(JSON.stringify(sampleU)));
                        }
                    });
                }
                saveDemoStore();
            } else {
                demoStore = JSON.parse(JSON.stringify(window.SAMPLE_DATA || {}));
                saveDemoStore();
            }
        } catch (e) {
            console.warn("Could not access localStorage, using memory store:", e);
            demoStore = JSON.parse(JSON.stringify(window.SAMPLE_DATA || {}));
        }
    }

    function saveDemoStore() {
        try {
            if (demoStore) {
                localStorage.setItem("APEX_HR_DEMO_STORE", JSON.stringify(demoStore));
            }
        } catch (e) {
            console.warn("Failed to persist demo store:", e);
        }
    }

    function isConfigured() {
        return (
            CONFIG.API_URL &&
            CONFIG.API_URL.trim() !== "" &&
            !CONFIG.API_URL.includes("PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") &&
            CONFIG.API_URL.startsWith("http")
        );
    }

    function setConnectionState(newState, detail = "") {
        connectionState = newState;
        statusListeners.forEach((fn) => fn(newState, detail));
    }

    function onStatusChange(callback) {
        statusListeners.push(callback);
    }

    /**
     * Test connection to Google Apps Script or initialize Demo Mode
     */
    async function testConnection() {
        setConnectionState("connecting", "Verifying connection to HR backend...");

        if (!isConfigured()) {
            initDemoStore();
            setConnectionState(
                "connected-demo",
                "Operating in Demo Mode (Local Storage / Sample Data). Connect to Google Sheets by setting CONFIG.API_URL."
            );
            return {
                success: true,
                mode: "demo",
                message: "Connected to local mock database"
            };
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=ping`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data && data.success) {
                setConnectionState("connected-api", "Successfully connected to Google Sheets backend via Apps Script Web App.");
                return { success: true, mode: "api", data: data.data };
            } else {
                throw new Error(data.message || "Unknown error from Google Apps Script");
            }
        } catch (err) {
            console.error("API Connection Error:", err);
            initDemoStore();
            setConnectionState(
                "connected-demo",
                `Unable to reach Google Sheets API (${err.message}). Defaulted safely to Demo Mode.`
            );
            return { success: false, mode: "demo", error: err.message };
        }
    }

    /**
     * Show / Hide Global Loading Indicator
     */
    function showLoading(message = "Processing request...") {
        const overlay = document.getElementById("global-loading-overlay");
        const text = document.getElementById("global-loading-text");
        if (overlay) {
            if (text) text.textContent = message;
            overlay.classList.remove("d-none");
        }
    }

    function hideLoading() {
        const overlay = document.getElementById("global-loading-overlay");
        if (overlay) overlay.classList.add("d-none");
    }

    /**
     * Core Request Dispatcher
     */
    async function call(action, payload = {}, method = "POST", silent = false) {
        if (!silent) showLoading(`Executing: ${action}...`);

        try {
            if (!isConfigured() || connectionState === "connected-demo") {
                // Execute mock response locally with realistic latency
                await new Promise((r) => setTimeout(r, silent ? 30 : 180));
                const res = handleDemoAction(action, payload);
                if (!silent) hideLoading();
                return res;
            }

            // Real Google Apps Script Web App Execution
            let url = CONFIG.API_URL;
            let options = {
                method: method,
                headers: {
                    "Content-Type": "text/plain;charset=utf-8" // Avoid browser preflight OPTION issues with Apps Script
                }
            };

            if (method === "GET") {
                const params = new URLSearchParams({ action, ...payload });
                url += (url.includes("?") ? "&" : "?") + params.toString();
            } else {
                options.body = JSON.stringify({
                    action: action,
                    data: payload,
                    sessionToken: Auth.getSessionToken ? Auth.getSessionToken() : null,
                    timestamp: new Date().toISOString()
                });
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Server returned HTTP status ${response.status}`);
            }

            const result = await response.json();
            if (!silent) hideLoading();

            if (!result.success) {
                throw new Error(result.message || "Failed to complete request");
            }

            return result;
        } catch (error) {
            if (!silent) hideLoading();
            console.error(`API execution error on [${action}]:`, error);
            App.showToast(`API Error: ${error.message}`, "danger");
            return {
                success: false,
                data: null,
                message: error.message || "Unable to complete request"
            };
        }
    }

    /**
     * Demo Data Handler (Local Storage Simulation)
     */
    function handleDemoAction(action, data) {
        if (!demoStore) initDemoStore();

        switch (action) {
            case "ping":
                return { success: true, data: { status: "OK", version: CONFIG.APP_VERSION }, message: "System online" };

            case "login": {
                const user = demoStore.users.find(
                    (u) => (u.Username.toLowerCase() === data.username.toLowerCase() || u.Email.toLowerCase() === data.username.toLowerCase()) &&
                           u.PasswordHash === data.passwordHash &&
                           u.Status === "Active"
                );
                if (user) {
                    user.LastLogin = new Date().toISOString().replace("T", " ").substring(0, 19);
                    saveDemoStore();
                    return {
                        success: true,
                        data: {
                            user: { ...user, PasswordHash: undefined },
                            token: "DEMO-SESSION-TOKEN-" + Date.now()
                        },
                        message: "Login successful"
                    };
                }
                return { success: false, message: "Invalid username or password" };
            }

            case "getDashboardStats": {
                const totalEmployees = demoStore.employees.length;
                const active = demoStore.employees.filter((e) => e.Status === "Active" || e.EmploymentStatusID === "Active").length;
                const probation = demoStore.employees.filter((e) => e.EmploymentStatusID === "Probation" || e.Status === "Probation").length;
                const onLeave = demoStore.employees.filter((e) => e.EmploymentStatusID === "On Leave" || e.Status === "On Leave").length;

                // Department breakdown
                const byDept = {};
                demoStore.employees.forEach((e) => {
                    const dept = e.DepartmentID || "Unassigned";
                    byDept[dept] = (byDept[dept] || 0) + 1;
                });

                // Gender breakdown
                const byGender = {};
                demoStore.employees.forEach((e) => {
                    const g = e.Gender || "Unspecified";
                    byGender[g] = (byGender[g] || 0) + 1;
                });

                // Employment Type breakdown
                const byType = {};
                demoStore.employees.forEach((e) => {
                    const t = e.EmploymentTypeID || "Permanent";
                    byType[t] = (byType[t] || 0) + 1;
                });

                // Status breakdown
                const byStatus = {};
                demoStore.employees.forEach((e) => {
                    const s = e.EmploymentStatusID || e.Status || "Active";
                    byStatus[s] = (byStatus[s] || 0) + 1;
                });

                // Upcoming expirations (documents with ExpiryDate)
                const now = new Date();
                const warningThreshold = new Date();
                warningThreshold.setDate(now.getDate() + (CONFIG.EXPIRY_WARNING_DAYS || 30));

                const expirations = [];
                demoStore.documents.forEach((doc) => {
                    if (doc.ExpiryDate) {
                        const expDate = new Date(doc.ExpiryDate);
                        const emp = demoStore.employees.find((e) => e.EmployeeID === doc.EmployeeID);
                        const diffTime = expDate - now;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        let expStatus = "Valid";
                        if (diffDays < 0) expStatus = "Expired";
                        else if (diffDays <= (CONFIG.EXPIRY_WARNING_DAYS || 30)) expStatus = "Expiring Soon";

                        expirations.push({
                            employeeId: doc.EmployeeID,
                            employeeName: emp ? `${emp.FirstName} ${emp.LastName}` : "Unknown",
                            documentName: doc.DocumentName || doc.DocumentTypeID,
                            expiryDate: doc.ExpiryDate,
                            daysRemaining: diffDays,
                            status: expStatus
                        });
                    }
                });

                // Sort expirations by days remaining
                expirations.sort((a, b) => a.daysRemaining - b.daysRemaining);

                return {
                    success: true,
                    data: {
                        kpis: {
                            totalEmployees,
                            activeEmployees: active,
                            newEmployees: 1,
                            onProbation: probation,
                            onLeave,
                            contractsExpiring: expirations.filter((x) => x.status === "Expiring Soon").length,
                            documentsExpiring: expirations.filter((x) => x.status === "Expiring Soon" || x.status === "Expired").length,
                            vacantPositions: 2
                        },
                        charts: {
                            byDepartment: byDept,
                            byGender,
                            byType,
                            byStatus,
                            joinTrend: {
                                "Jan": 1, "Mar": 1, "May": 1, "Jul": 1, "Sep": 1
                            }
                        },
                        upcomingExpirations: expirations
                    }
                };
            }

            case "getEmployees": {
                return {
                    success: true,
                    data: demoStore.employees,
                    message: "Employees loaded successfully"
                };
            }

            case "getEmployee": {
                const emp = demoStore.employees.find((e) => e.EmployeeID === data.id);
                if (!emp) return { success: false, message: "Employee record not found" };

                return {
                    success: true,
                    data: {
                        employee: emp,
                        documents: demoStore.documents.filter((d) => d.EmployeeID === data.id),
                        skills: demoStore.skills.filter((s) => s.EmployeeID === data.id),
                        experience: demoStore.experience.filter((x) => x.EmployeeID === data.id),
                        education: demoStore.education.filter((ed) => ed.EmployeeID === data.id),
                        training: demoStore.training.filter((t) => t.EmployeeID === data.id),
                        contacts: demoStore.contacts.filter((c) => c.EmployeeID === data.id),
                        dependents: demoStore.dependents.filter((dp) => dp.EmployeeID === data.id),
                        performance: demoStore.performance.filter((p) => p.EmployeeID === data.id),
                        career: demoStore.career.filter((cr) => cr.EmployeeID === data.id),
                        assets: demoStore.assets.filter((a) => a.EmployeeID === data.id),
                        notes: demoStore.notes.filter((n) => n.EmployeeID === data.id)
                    }
                };
            }

            case "updateEmployeePhoto": {
                const empId = data.EmployeeID || data.id;
                const photo = data.EmployeePhoto !== undefined ? data.EmployeePhoto : (data.photo !== undefined ? data.photo : "");
                const idx = demoStore.employees.findIndex((e) => e.EmployeeID === empId);
                if (idx >= 0) {
                    demoStore.employees[idx].EmployeePhoto = photo;
                    demoStore.employees[idx].UpdatedDate = new Date().toISOString().substring(0, 10);
                    demoStore.employees[idx].UpdatedBy = Auth.getCurrentUser() ? Auth.getCurrentUser().Username : "Admin";
                    saveDemoStore();
                    return { success: true, data: demoStore.employees[idx], message: "Profile photo updated successfully" };
                }
                return { success: false, message: "Employee [" + empId + "] not found" };
            }

            case "saveEmployee": {
                const emp = data;
                const nowStr = new Date().toISOString().substring(0, 10);
                if (!emp.EmployeeID) {
                    // Generate new ID
                    const maxId = demoStore.employees.reduce((max, cur) => {
                        const num = parseInt(cur.EmployeeID.replace("EMP-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    emp.EmployeeID = "EMP-" + String(maxId + 1).padStart(6, "0");
                    emp.CreatedDate = nowStr;
                    emp.CreatedBy = Auth.getCurrentUser() ? Auth.getCurrentUser().Username : "Admin";
                    emp.Status = emp.Status || "Active";
                    demoStore.employees.unshift(emp);
                } else {
                    const idx = demoStore.employees.findIndex((e) => e.EmployeeID === emp.EmployeeID);
                    if (idx >= 0) {
                        emp.UpdatedDate = nowStr;
                        emp.UpdatedBy = Auth.getCurrentUser() ? Auth.getCurrentUser().Username : "Admin";
                        demoStore.employees[idx] = { ...demoStore.employees[idx], ...emp };
                    }
                }
                saveDemoStore();
                return { success: true, data: emp, message: "Employee saved successfully" };
            }

            case "deleteEmployee": {
                const idx = demoStore.employees.findIndex((e) => e.EmployeeID === data.id);
                if (idx >= 0) {
                    if (data.permanent) {
                        demoStore.employees.splice(idx, 1);
                    } else {
                        // Soft delete / mark resigned
                        demoStore.employees[idx].Status = "Resigned";
                        demoStore.employees[idx].EmploymentStatusID = "Resigned";
                        demoStore.employees[idx].UpdatedDate = new Date().toISOString().substring(0, 10);
                    }
                    saveDemoStore();
                    return { success: true, message: "Employee record updated/archived" };
                }
                return { success: false, message: "Employee not found" };
            }

            case "saveSubRecord": {
                const { subType, record } = data;
                const collectionName = subType.toLowerCase();
                if (!demoStore[collectionName]) {
                    demoStore[collectionName] = [];
                }

                const prefixMap = {
                    documents: "DOC-",
                    skills: "SKL-",
                    experience: "EXP-",
                    education: "EDU-",
                    training: "TRN-",
                    contacts: "CNT-",
                    dependents: "DEP-",
                    performance: "PRF-",
                    career: "CAR-",
                    assets: "AST-",
                    notes: "NOT-"
                };

                const idKeyMap = {
                    documents: "DocumentID",
                    skills: "SkillID",
                    experience: "ExperienceID",
                    education: "EducationID",
                    training: "TrainingID",
                    contacts: "ContactID",
                    dependents: "DependentID",
                    performance: "PerformanceID",
                    career: "CareerID",
                    assets: "AssetID",
                    notes: "NoteID"
                };

                const idKey = idKeyMap[collectionName];
                const prefix = prefixMap[collectionName] || "REC-";

                if (!record[idKey]) {
                    const maxId = demoStore[collectionName].reduce((max, cur) => {
                        const num = parseInt(String(cur[idKey] || "").replace(prefix, ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    record[idKey] = prefix + String(maxId + 1).padStart(6, "0");
                    record.CreatedDate = new Date().toISOString().substring(0, 10);
                    demoStore[collectionName].push(record);
                } else {
                    const idx = demoStore[collectionName].findIndex((r) => r[idKey] === record[idKey]);
                    if (idx >= 0) {
                        demoStore[collectionName][idx] = { ...demoStore[collectionName][idx], ...record };
                    }
                }
                saveDemoStore();
                return { success: true, data: record, message: `${subType} saved successfully` };
            }

            case "deleteSubRecord": {
                const { subType, id } = data;
                const collectionName = subType.toLowerCase();
                const idKeyMap = {
                    documents: "DocumentID",
                    skills: "SkillID",
                    experience: "ExperienceID",
                    education: "EducationID",
                    training: "TrainingID",
                    contacts: "ContactID",
                    dependents: "DependentID",
                    performance: "PerformanceID",
                    career: "CareerID",
                    assets: "AssetID",
                    notes: "NoteID"
                };
                const idKey = idKeyMap[collectionName];
                if (demoStore[collectionName]) {
                    demoStore[collectionName] = demoStore[collectionName].filter((r) => r[idKey] !== id);
                    saveDemoStore();
                    return { success: true, message: "Record deleted successfully" };
                }
                return { success: false, message: "Collection not found" };
            }

            case "getMasterLists": {
                return { success: true, data: demoStore.masterLists, message: "Master lists retrieved" };
            }

            case "saveMasterListItem": {
                const item = data;
                if (!item.ListID) {
                    const maxId = demoStore.masterLists.reduce((max, cur) => {
                        const num = parseInt(cur.ListID.replace("LST-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    item.ListID = "LST-" + String(maxId + 1).padStart(3, "0");
                    demoStore.masterLists.push(item);
                } else {
                    const idx = demoStore.masterLists.findIndex((l) => l.ListID === item.ListID);
                    if (idx >= 0) demoStore.masterLists[idx] = { ...demoStore.masterLists[idx], ...item };
                }
                saveDemoStore();
                return { success: true, data: item, message: "Option saved successfully" };
            }

            case "deleteMasterListItem": {
                demoStore.masterLists = demoStore.masterLists.filter((l) => l.ListID !== data.id);
                saveDemoStore();
                return { success: true, message: "Option deleted" };
            }

            case "getUsers": {
                const safeUsers = demoStore.users.map((u) => ({ ...u, PasswordHash: undefined }));
                return { success: true, data: safeUsers, roles: demoStore.roles };
            }

            case "saveUser": {
                const user = data;
                if (!user.UserID) {
                    const maxId = demoStore.users.reduce((max, cur) => {
                        const num = parseInt(cur.UserID.replace("USR-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    user.UserID = "USR-" + String(maxId + 1).padStart(6, "0");
                    user.CreatedDate = new Date().toISOString().substring(0, 10);
                    demoStore.users.push(user);
                } else {
                    const idx = demoStore.users.findIndex((u) => u.UserID === user.UserID);
                    if (idx >= 0) {
                        if (!user.PasswordHash) delete user.PasswordHash;
                        demoStore.users[idx] = { ...demoStore.users[idx], ...user };
                    }
                }
                saveDemoStore();
                return { success: true, data: user, message: "User updated" };
            }

            // Attendance actions
            case "getAttendance": {
                let records = demoStore.attendance || [];
                if (data && data.date) {
                    records = records.filter(r => r.Date === data.date);
                }
                if (data && data.employeeId) {
                    records = records.filter(r => r.EmployeeID === data.employeeId);
                }
                return { success: true, data: records };
            }

            case "saveAttendance": {
                const att = { ...data };
                if (!att.AttendanceID) {
                    const maxId = (demoStore.attendance || []).reduce((max, cur) => {
                        const num = parseInt(cur.AttendanceID.replace("ATT-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    att.AttendanceID = "ATT-" + String(maxId + 1).padStart(6, "0");
                    if (!demoStore.attendance) demoStore.attendance = [];
                    demoStore.attendance.unshift(att);
                } else {
                    const idx = demoStore.attendance.findIndex(a => a.AttendanceID === att.AttendanceID);
                    if (idx >= 0) {
                        demoStore.attendance[idx] = { ...demoStore.attendance[idx], ...att };
                    }
                }
                saveDemoStore();
                return { success: true, data: att, message: "Attendance record saved" };
            }

            case "deleteAttendance": {
                const idx = (demoStore.attendance || []).findIndex(a => a.AttendanceID === data.id);
                if (idx >= 0) {
                    demoStore.attendance.splice(idx, 1);
                    saveDemoStore();
                    return { success: true, message: "Attendance record deleted" };
                }
                return { success: false, message: "Attendance record not found" };
            }

            // Leave actions
            case "getLeaveRequests": {
                let records = demoStore.leaveRequests || [];
                if (data && data.employeeId) {
                    records = records.filter(r => r.EmployeeID === data.employeeId);
                }
                if (data && data.status && data.status !== "All") {
                    records = records.filter(r => r.Status === data.status);
                }
                return { success: true, data: records, balances: demoStore.leaveBalances || [] };
            }

            case "saveLeaveRequest": {
                const req = { ...data };
                if (!req.RequestID) {
                    const maxId = (demoStore.leaveRequests || []).reduce((max, cur) => {
                        const num = parseInt(cur.RequestID.replace("LEV-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    req.RequestID = "LEV-" + String(maxId + 1).padStart(6, "0");
                    req.AppliedDate = req.AppliedDate || new Date().toISOString().substring(0, 10);
                    req.Status = req.Status || "Pending";
                    if (!demoStore.leaveRequests) demoStore.leaveRequests = [];
                    demoStore.leaveRequests.unshift(req);
                } else {
                    const idx = demoStore.leaveRequests.findIndex(r => r.RequestID === req.RequestID);
                    if (idx >= 0) {
                        demoStore.leaveRequests[idx] = { ...demoStore.leaveRequests[idx], ...req };
                    }
                }
                saveDemoStore();
                return { success: true, data: req, message: "Leave request submitted successfully" };
            }

            case "updateLeaveStatus": {
                const { id, status, approver, remarks } = data;
                const idx = (demoStore.leaveRequests || []).findIndex(r => r.RequestID === id);
                if (idx >= 0) {
                    demoStore.leaveRequests[idx].Status = status;
                    if (approver) demoStore.leaveRequests[idx].ApprovedBy = approver;
                    demoStore.leaveRequests[idx].ApprovedDate = new Date().toISOString().substring(0, 10);
                    if (remarks) demoStore.leaveRequests[idx].Remarks = remarks;
                    
                    // Deduct from balance if approved
                    if (status === "Approved") {
                        const empId = demoStore.leaveRequests[idx].EmployeeID;
                        const days = parseFloat(demoStore.leaveRequests[idx].TotalDays) || 0;
                        const type = demoStore.leaveRequests[idx].LeaveType || "";
                        const bal = (demoStore.leaveBalances || []).find(b => b.EmployeeID === empId);
                        if (bal) {
                            if (type.includes("Annual")) bal.AnnualTaken = (bal.AnnualTaken || 0) + days;
                            else if (type.includes("Sick")) bal.SickTaken = (bal.SickTaken || 0) + days;
                            else if (type.includes("Casual")) bal.CasualTaken = (bal.CasualTaken || 0) + days;
                        }
                    }

                    saveDemoStore();
                    return { success: true, data: demoStore.leaveRequests[idx], message: `Leave request ${status}` };
                }
                return { success: false, message: "Leave request not found" };
            }

            case "getLeaveBalances": {
                return { success: true, data: demoStore.leaveBalances || [] };
            }

            case "saveLeaveBalance": {
                const bal = data;
                if (!demoStore.leaveBalances) demoStore.leaveBalances = [];
                const idx = demoStore.leaveBalances.findIndex(b => b.EmployeeID === bal.EmployeeID);
                if (idx >= 0) {
                    demoStore.leaveBalances[idx] = { ...demoStore.leaveBalances[idx], ...bal };
                } else {
                    demoStore.leaveBalances.push(bal);
                }
                saveDemoStore();
                return { success: true, data: bal, message: "Leave balance updated" };
            }

            // Recruitment actions
            case "getJobOpenings": {
                return { success: true, data: demoStore.jobOpenings || [], candidates: demoStore.candidates || [] };
            }

            case "saveJobOpening": {
                const job = { ...data };
                if (!job.JobID) {
                    const maxId = (demoStore.jobOpenings || []).reduce((max, cur) => {
                        const num = parseInt(cur.JobID.replace("JOB-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    job.JobID = "JOB-" + String(maxId + 1).padStart(6, "0");
                    job.ApplicantsCount = 0;
                    job.Status = job.Status || "Open";
                    if (!demoStore.jobOpenings) demoStore.jobOpenings = [];
                    demoStore.jobOpenings.unshift(job);
                } else {
                    const idx = demoStore.jobOpenings.findIndex(j => j.JobID === job.JobID);
                    if (idx >= 0) {
                        demoStore.jobOpenings[idx] = { ...demoStore.jobOpenings[idx], ...job };
                    }
                }
                saveDemoStore();
                return { success: true, data: job, message: "Job opening saved" };
            }

            case "deleteJobOpening": {
                const idx = (demoStore.jobOpenings || []).findIndex(j => j.JobID === data.id);
                if (idx >= 0) {
                    demoStore.jobOpenings.splice(idx, 1);
                    saveDemoStore();
                    return { success: true, message: "Job opening removed" };
                }
                return { success: false, message: "Job opening not found" };
            }

            case "getCandidates": {
                let candidates = demoStore.candidates || [];
                if (data && data.jobId) {
                    candidates = candidates.filter(c => c.JobID === data.jobId);
                }
                if (data && data.stage && data.stage !== "All") {
                    candidates = candidates.filter(c => c.Stage === data.stage);
                }
                return { success: true, data: candidates, jobOpenings: demoStore.jobOpenings || [] };
            }

            case "saveCandidate": {
                const can = { ...data };
                if (!can.CandidateID) {
                    const maxId = (demoStore.candidates || []).reduce((max, cur) => {
                        const num = parseInt(cur.CandidateID.replace("CAN-", ""), 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    can.CandidateID = "CAN-" + String(maxId + 1).padStart(6, "0");
                    can.AppliedDate = can.AppliedDate || new Date().toISOString().substring(0, 10);
                    can.Stage = can.Stage || "Applied";
                    if (!demoStore.candidates) demoStore.candidates = [];
                    demoStore.candidates.unshift(can);

                    // Update applicant count in job opening
                    if (can.JobID) {
                        const job = (demoStore.jobOpenings || []).find(j => j.JobID === can.JobID);
                        if (job) job.ApplicantsCount = (job.ApplicantsCount || 0) + 1;
                    }
                } else {
                    const idx = demoStore.candidates.findIndex(c => c.CandidateID === can.CandidateID);
                    if (idx >= 0) {
                        demoStore.candidates[idx] = { ...demoStore.candidates[idx], ...can };
                    }
                }
                saveDemoStore();
                return { success: true, data: can, message: "Candidate record saved" };
            }

            case "updateCandidateStage": {
                const { id, stage, notes } = data;
                const idx = (demoStore.candidates || []).findIndex(c => c.CandidateID === id);
                if (idx >= 0) {
                    demoStore.candidates[idx].Stage = stage;
                    if (notes) demoStore.candidates[idx].Notes = notes;
                    saveDemoStore();
                    return { success: true, data: demoStore.candidates[idx], message: `Candidate stage updated to ${stage}` };
                }
                return { success: false, message: "Candidate not found" };
            }

            case "deleteCandidate": {
                const idx = (demoStore.candidates || []).findIndex(c => c.CandidateID === data.id);
                if (idx >= 0) {
                    const jobId = demoStore.candidates[idx].JobID;
                    demoStore.candidates.splice(idx, 1);
                    if (jobId) {
                        const job = (demoStore.jobOpenings || []).find(j => j.JobID === jobId);
                        if (job && job.ApplicantsCount > 0) job.ApplicantsCount--;
                    }
                    saveDemoStore();
                    return { success: true, message: "Candidate record removed" };
                }
                return { success: false, message: "Candidate not found" };
            }

            // Payroll actions
            case "getPayrollRecords": {
                let records = demoStore.payroll || [];
                if (data && data.monthYear) {
                    records = records.filter(p => p.MonthYear === data.monthYear);
                }
                if (data && data.employeeId) {
                    records = records.filter(p => p.EmployeeID === data.employeeId);
                }
                return { success: true, data: records, employees: demoStore.employees || [] };
            }

            case "savePayrollRecord": {
                const pay = { ...data };
                const base = parseFloat(pay.BaseSalary) || 0;
                const housing = parseFloat(pay.HousingAllowance) || 0;
                const transport = parseFloat(pay.TransportAllowance) || 0;
                const bonus = parseFloat(pay.Bonus) || 0;
                pay.GrossSalary = base + housing + transport + bonus;

                const tax = parseFloat(pay.TaxDeduction) || 0;
                const pension = parseFloat(pay.PensionDeduction) || 0;
                const health = parseFloat(pay.HealthInsurance) || 0;
                pay.TotalDeductions = tax + pension + health;
                pay.NetSalary = pay.GrossSalary - pay.TotalDeductions;

                if (!pay.PayrollID) {
                    const ym = pay.MonthYear ? pay.MonthYear.replace("-", "") : "202611";
                    const maxId = (demoStore.payroll || []).reduce((max, cur) => {
                        const parts = cur.PayrollID.split("-");
                        const num = parseInt(parts[2], 10) || 0;
                        return Math.max(max, num);
                    }, 0);
                    pay.PayrollID = `PAY-${ym}-` + String(maxId + 1).padStart(3, "0");
                    if (!demoStore.payroll) demoStore.payroll = [];
                    demoStore.payroll.unshift(pay);
                } else {
                    const idx = demoStore.payroll.findIndex(p => p.PayrollID === pay.PayrollID);
                    if (idx >= 0) {
                        demoStore.payroll[idx] = { ...demoStore.payroll[idx], ...pay };
                    }
                }
                saveDemoStore();
                return { success: true, data: pay, message: "Payroll record updated successfully" };
            }

            case "updatePayrollStatus": {
                const { id, status, paymentDate } = data;
                const idx = (demoStore.payroll || []).findIndex(p => p.PayrollID === id);
                if (idx >= 0) {
                    demoStore.payroll[idx].PaymentStatus = status;
                    if (paymentDate) demoStore.payroll[idx].PaymentDate = paymentDate;
                    saveDemoStore();
                    return { success: true, data: demoStore.payroll[idx], message: `Payment status updated to ${status}` };
                }
                return { success: false, message: "Payroll record not found" };
            }

            case "generatePayrollRun": {
                const { monthYear } = data;
                if (!demoStore.payroll) demoStore.payroll = [];
                const activeEmps = (demoStore.employees || []).filter(e => e.Status === "Active");
                const created = [];
                
                activeEmps.forEach((emp) => {
                    const exists = demoStore.payroll.find(p => p.MonthYear === monthYear && p.EmployeeID === emp.EmployeeID);
                    if (!exists) {
                        const prev = demoStore.payroll.find(p => p.EmployeeID === emp.EmployeeID);
                        const base = prev ? prev.BaseSalary : 6500;
                        const housing = prev ? prev.HousingAllowance : Math.round(base * 0.12);
                        const transport = prev ? prev.TransportAllowance : 400;
                        const bonus = 0;
                        const gross = base + housing + transport + bonus;
                        const tax = Math.round(gross * 0.18);
                        const pension = Math.round(base * 0.06);
                        const health = 250;
                        const deductions = tax + pension + health;
                        const net = gross - deductions;

                        const ym = monthYear.replace("-", "");
                        const newPay = {
                            PayrollID: `PAY-${ym}-` + String(demoStore.payroll.length + 1).padStart(3, "0"),
                            MonthYear: monthYear,
                            EmployeeID: emp.EmployeeID,
                            BaseSalary: base,
                            HousingAllowance: housing,
                            TransportAllowance: transport,
                            Bonus: bonus,
                            GrossSalary: gross,
                            TaxDeduction: tax,
                            PensionDeduction: pension,
                            HealthInsurance: health,
                            TotalDeductions: deductions,
                            NetSalary: net,
                            PaymentStatus: "Pending",
                            PaymentDate: "",
                            BankName: prev ? prev.BankName : "Commercial Bank",
                            AccountNumber: prev ? prev.AccountNumber : "****" + Math.floor(1000 + Math.random() * 9000)
                        };
                        demoStore.payroll.unshift(newPay);
                        created.push(newPay);
                    }
                });
                saveDemoStore();
                return { success: true, data: created, message: `Generated ${created.length} payroll entries for ${monthYear}` };
            }

            case "getSettings": {
                return { success: true, data: demoStore.settings };
            }

            case "saveSettings": {
                demoStore.settings = { ...demoStore.settings, ...data };
                saveDemoStore();
                return { success: true, data: demoStore.settings, message: "Settings saved successfully" };
            }

            case "getAuditLogs": {
                return { success: true, data: demoStore.auditLogs || [] };
            }

            case "resetDemoData": {
                localStorage.removeItem("APEX_HR_DEMO_STORE");
                initDemoStore();
                return { success: true, message: "Demo data reset to factory defaults" };
            }

            default:
                return { success: false, message: `Action [${action}] is not implemented in demo provider.` };
        }
    }

    return {
        isConfigured,
        testConnection,
        getConnectionState: () => connectionState,
        onStatusChange,
        call,
        showLoading,
        hideLoading,
        initDemoStore
    };
})();

window.API = API;
