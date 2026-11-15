/**
 * HR Management System - Configuration
 * 
 * Replace API_URL with your deployed Google Apps Script Web App URL.
 * When API_URL is set to "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" or empty,
 * the application automatically operates in Demo / Preview Mode with sample data.
 */
const CONFIG = {
    // -------------------------------------------------------------
    // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW:
    // -------------------------------------------------------------
    API_URL: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
    
    // Application Info
    APP_NAME: "ApexHR Suite",
    APP_VERSION: "1.0.0",
    
    // System Defaults
    DATE_FORMAT: "YYYY-MM-DD",
    DEFAULT_PAGE_SIZE: 10,
    EXPIRY_WARNING_DAYS: 30,
    SESSION_TIMEOUT_MINS: 60,
    
    // Auto-ID Prefixes
    ID_PREFIXES: {
        EMPLOYEE: "EMP-",
        DOCUMENT: "DOC-",
        SKILL: "SKL-",
        EXPERIENCE: "EXP-",
        EDUCATION: "EDU-",
        TRAINING: "TRN-",
        CONTACT: "CNT-",
        DEPENDENT: "DEP-",
        PERFORMANCE: "PRF-",
        CAREER: "CAR-",
        ASSET: "AST-",
        NOTE: "NOT-",
        USER: "USR-",
        LIST: "LST-",
        LOG: "LOG-"
    }
};

// Freeze configuration to prevent accidental runtime modifications
if (typeof Object.freeze === "function") {
    Object.freeze(CONFIG.ID_PREFIXES);
}
