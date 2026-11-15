/**
 * Google Apps Script - Central Backend Configuration
 * 
 * Instructions:
 * 1. Open your target Google Sheet.
 * 2. Copy the ID from the URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
 * 3. Paste it into SPREADSHEET_ID below.
 */

const CONFIG = {
    // -------------------------------------------------------------
    // PASTE YOUR GOOGLE SPREADSHEET ID HERE:
    // -------------------------------------------------------------
    SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE",

    // System Settings
    APP_NAME: "ApexHR Suite Backend",
    VERSION: "1.0.0",
    DEFAULT_EXPIRY_DAYS: 30,

    // Sheet Name Constants
    SHEETS: {
        USERS: "Users",
        ROLES: "Roles",
        PERMISSIONS: "Permissions",
        EMPLOYEES: "Employees",
        DOCUMENTS: "Documents",
        SKILLS: "Skills",
        EXPERIENCE: "Experience",
        EDUCATION: "Education",
        TRAINING: "Training",
        CONTACTS: "EmergencyContacts",
        DEPENDENTS: "Dependents",
        PERFORMANCE: "Performance",
        CAREER: "CareerDevelopment",
        ASSETS: "Assets",
        NOTES: "Notes",
        ATTENDANCE: "Attendance",
        LEAVE_REQUESTS: "LeaveRequests",
        LEAVE_BALANCES: "LeaveBalances",
        JOB_OPENINGS: "JobOpenings",
        CANDIDATES: "Candidates",
        PAYROLL: "Payroll",
        MASTER_LISTS: "MasterLists",
        SETTINGS: "Settings",
        AUDIT_LOG: "AuditLog"
    }
};
