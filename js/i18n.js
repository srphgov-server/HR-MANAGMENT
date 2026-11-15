/**
 * HR Management System - Internationalization (i18n) Module
 * Supports seamless bilingual switching: English (en) and ភាសាខ្មែរ (km)
 * Khmer typography powered by Google Font Battambang.
 */

const I18n = (function () {
    const STORAGE_KEY = "APEX_HR_LANG";
    let currentLang = "en";
    let changeListeners = [];

    const TRANSLATIONS = {
        en: {
            // Brand & Navigation
            brand_name: "ApexHR",
            brand_suite: "Suite",
            sidebar_core_admin: "Core Administration",
            sidebar_system_sec: "System & Security",
            sidebar_workforce_ops: "Workforce Operations",
            nav_dashboard: "Dashboard",
            nav_employees: "Employee Directory",
            nav_reports: "HR Reports",
            nav_users: "User Management",
            nav_lists: "Master Data Lists",
            nav_settings: "System Settings",
            nav_attendance: "Attendance & Time",
            nav_leave: "Leave Mgmt",
            nav_recruitment: "Recruitment & ATS",
            nav_payroll: "Payroll & Payslips",
            footer_company: "ApexHR Enterprise",
            footer_edition: "Google Sheets Edition",

            // Topbar & Auth
            company_name: "Apex Corporate Technologies",
            conn_checking: "Checking...",
            conn_connected: "Connected (Google Sheets)",
            conn_demo: "Demo Mode",
            conn_error: "Connection Error",
            test_perspectives: "Test Role Perspectives:",
            role_superadmin: "Super Admin",
            role_hradmin: "HR Admin",
            role_hrofficer: "HR Officer",
            role_manager: "Manager",
            role_employee: "Employee",
            role_viewer: "Viewer",
            my_profile: "My Profile",
            settings: "Settings",
            logout: "Log Out",
            login: "Log In",
            language: "Language",
            lang_en: "English",
            lang_km: "ភាសាខ្មែរ",

            // Common Buttons & Actions
            btn_add: "Add",
            btn_edit: "Edit",
            btn_delete: "Delete",
            btn_save: "Save",
            btn_cancel: "Cancel",
            btn_confirm: "Confirm",
            btn_close: "Close",
            btn_submit: "Submit",
            btn_export: "Export CSV",
            btn_print: "Print",
            btn_refresh: "Refresh Data",
            btn_view: "View",
            btn_filter: "Filter",
            btn_reset: "Reset",
            btn_back: "Back",

            // Common Table Columns
            th_id: "ID",
            th_employee: "Employee",
            th_department: "Department",
            th_position: "Position",
            th_status: "Status",
            th_type: "Employment Type",
            th_join_date: "Join Date",
            th_contact: "Contact",
            th_actions: "Actions",
            th_date: "Date",
            th_remarks: "Remarks",

            // Dashboard
            dash_title: "Executive HR Dashboard",
            dash_subtitle: "Real-time organizational insights, headcounts, and compliance tracking.",
            kpi_total_staff: "Total Staff",
            kpi_all_headcount: "All headcount",
            kpi_active_staff: "Active Staff",
            kpi_active_desc: "Standard active status",
            kpi_new_joiners: "New Joiners",
            kpi_onboarding_desc: "Joined within 30 days",
            kpi_on_probation: "On Probation",
            kpi_probation_desc: "Under review",
            kpi_on_leave: "On Leave",
            kpi_leave_desc: "Approved absence",
            kpi_contracts_expiring: "Contracts Expiring",
            kpi_contracts_desc: "Renewals needed",
            kpi_docs_expiring: "Docs Expiring",
            kpi_docs_desc: "Compliance action",
            kpi_open_vacancies: "Open Vacancies",
            kpi_vacancies_desc: "Target hires",
            chart_dept: "Department Headcount Distribution",
            chart_gender: "Gender Diversity Breakdown",
            chart_type: "Employment Type Ratio",
            chart_status: "Employment Status Overview",
            chart_join_trend: "Employee Onboarding Trend (2026)",
            tbl_upcoming_exp: "Upcoming Document & Contract Expirations",
            tbl_exp_desc: "Monitors expiring visas, ID cards, certifications, and contracts.",
            btn_view_directory: "View Directory",

            // Employee Directory & Profile
            emp_title: "Employee Directory",
            emp_subtitle: "Search, filter, manage, and inspect comprehensive organizational personnel records.",
            emp_add_btn: "Add New Employee",
            emp_search_placeholder: "Search by name, ID code, title, or email...",
            all_depts: "All Departments",
            all_positions: "All Positions",
            all_statuses: "All Statuses",
            all_types: "All Employment Types",
            status_active: "Active",
            status_probation: "Probation",
            status_on_leave: "On Leave",
            status_resigned: "Resigned",
            status_terminated: "Terminated",

            // Attendance
            att_title: "Attendance & Time Tracking",
            att_subtitle: "Monitor daily punch logs, punctuality, remote work, and shift durations.",
            att_quick_punch: "Quick Clock In/Out",
            att_log_entry: "Log Attendance Entry",
            att_date: "Attendance Date",
            att_auto_mark: "Auto-Mark",
            att_scheduled: "Scheduled Staff",
            att_present_today: "Present Today",
            att_late_arrivals: "Late Arrivals",
            att_remote_wfh: "Remote (WFH)",
            att_on_leave_off: "On Leave / Off",
            att_avg_shift: "Avg Shift Duration",
            att_daily_log: "Daily Attendance Log",
            att_clock_in: "Clock In",
            att_clock_out: "Clock Out",
            att_work_hours: "Work Hours",
            att_work_location: "Work Location",
            att_status_present: "Present",
            att_status_late: "Late",
            att_status_wfh: "Work From Home",
            att_status_halfday: "Half Day",
            att_status_onleave: "On Leave",
            att_status_absent: "Absent",
            att_kiosk_title: "Quick Attendance Kiosk",

            // Leave Management
            leave_title: "Leave Management System",
            leave_subtitle: "Manage leave requests, review pending approvals, and track balance entitlements.",
            leave_apply_btn: "Apply for Leave",
            leave_tab_requests: "Leave Applications & Requests",
            leave_tab_balances: "Entitlements & Balances",
            leave_tab_calendar: "Upcoming Leaves Schedule",
            leave_pending_appr: "Pending Approvals",
            leave_on_leave_today: "On Leave Today",
            leave_appr_month: "Approved This Month",
            leave_total_days: "Total Days Used",
            leave_category: "Leave Category",
            leave_start: "Start Date",
            leave_end: "End Date",
            leave_days: "Days",
            leave_reason: "Reason & Details",
            leave_status_approved: "Approved",
            leave_status_pending: "Pending",
            leave_status_rejected: "Rejected",
            leave_type_annual: "Annual Leave",
            leave_type_sick: "Sick Leave",
            leave_type_casual: "Casual Leave",
            leave_type_maternity: "Maternity Leave",
            leave_type_unpaid: "Unpaid Leave",
            leave_btn_approve: "Approve",
            leave_btn_reject: "Reject",
            leave_remaining: "remaining",

            // Recruitment & ATS
            rec_title: "Recruitment & Talent Acquisition",
            rec_subtitle: "Track open requisitions, candidate pipeline stages, interviews, and offers.",
            rec_add_candidate: "Add Candidate",
            rec_post_job: "Post Job Opening",
            rec_tab_pipeline: "Candidate Pipeline (Kanban)",
            rec_tab_candidates: "All Candidates Directory",
            rec_tab_jobs: "Job Openings & Vacancies",
            rec_active_openings: "Active Openings",
            rec_total_applicants: "Total Applicants",
            rec_in_interview: "In Interview",
            rec_hired: "Hired (2026)",
            rec_stage_applied: "Applied",
            rec_stage_screening: "Screening",
            rec_stage_interview: "Interview",
            rec_stage_offer: "Offer Extended",
            rec_stage_hired: "Hired",
            rec_stage_rejected: "Archived / Rejected",
            rec_move: "Move",
            rec_rating: "Rating",
            rec_exp_years: "Experience",

            // Payroll & Compensation
            pay_title: "Payroll & Compensation",
            pay_subtitle: "Process monthly payroll runs, manage salary structures, and issue employee payslips.",
            pay_run_batch: "Run Monthly Payroll",
            pay_add_entry: "Add Salary Entry",
            pay_export_register: "Export Register",
            pay_net_total: "Net Payroll",
            pay_gross_total: "Gross Total",
            pay_taxes_ded: "Taxes & Deductions",
            pay_avg_net: "Avg Net Salary",
            pay_disbursed: "Disbursed (Paid)",
            pay_pending: "Pending Payouts",
            pay_period: "Payroll Period (Month/Year)",
            pay_tab_register: "Register",
            pay_tab_structures: "Structures",
            pay_base_salary: "Base Salary",
            pay_allowances: "Allowances",
            pay_gross_pay: "Gross Pay",
            pay_deductions: "Deductions",
            pay_net_pay: "Net Pay",
            pay_status_paid: "Paid",
            pay_status_pending: "Pending",
            pay_status_processing: "Processing",
            pay_payslip_title: "Official Salary Payslip",
            pay_print_payslip: "Print Payslip",

            // Settings & System
            set_title: "System Settings & Configuration",
            set_subtitle: "Configure company identity, localization parameters, and view audit events.",
            set_tab_general: "Organization & Localization",
            set_tab_audit: "Security Audit Log",
            set_tab_api: "Google Sheets Backend Connection",
            set_company_identity: "Company Identity",
            set_org_name: "Organization Name",
            set_org_logo: "Logo URL",
            set_org_address: "Headquarters Address",
            set_country: "Default Country",
            set_timezone: "Time Zone",
            set_thresholds: "System Thresholds & Formats",
            set_date_format: "Date Format",
            set_currency: "Currency",
            set_empid_format: "Employee ID Format",
            set_expiry_days: "Document Expiry Alert Window (Days)",
            set_timeout: "Session Inactivity Timeout (Minutes)",
            set_page_size: "Default Table Rows",
            set_language: "System Language",
            set_save_btn: "Save System Settings",

            // Reports, Users, Lists
            rep_title: "Executive HR Reports",
            rep_subtitle: "Generate, review, print, and export compliance and organizational reports.",
            users_title: "User Management",
            lists_title: "Master Data & Dropdown Lists"
        },

        km: {
            // Brand & Navigation
            brand_name: "ApexHR",
            brand_suite: "Suite",
            sidebar_core_admin: "រដ្ឋបាលទូទៅ",
            sidebar_system_sec: "ប្រព័ន្ធ និងសុវត្ថិភាព",
            sidebar_workforce_ops: "ប្រតិបត្តិការបុគ្គលិក",
            nav_dashboard: "ផ្ទាំងគ្រប់គ្រង",
            nav_employees: "បញ្ជីបុគ្គលិក",
            nav_reports: "របាយការណ៍ HR",
            nav_users: "ការគ្រប់គ្រងអ្នកប្រើ",
            nav_lists: "បញ្ជីទិន្នន័យគោល",
            nav_settings: "ការកំណត់ប្រព័ន្ធ",
            nav_attendance: "វត្តមាន និងម៉ោងធ្វើការ",
            nav_leave: "គ្រប់គ្រងច្បាប់សម្រាក",
            nav_recruitment: "ជ្រើសរើសបុគ្គលិក",
            nav_payroll: "បៀវត្សរ៍ និងប័ណ្ណប្រាក់",
            footer_company: "ApexHR សហគ្រាស",
            footer_edition: "កំណែភ្ជាប់ Google Sheets",

            // Topbar & Auth
            company_name: "ក្រុមហ៊ុនបច្ចេកវិទ្យា Apex",
            conn_checking: "កំពុងពិនិត្យ...",
            conn_connected: "បានភ្ជាប់ (Google Sheets)",
            conn_demo: "ទម្រង់សាកល្បង",
            conn_error: "កំហុសក្នុងការតភ្ជាប់",
            test_perspectives: "សាកល្បងតួនាទីអ្នកប្រើប្រាស់:",
            role_superadmin: "អ្នកគ្រប់គ្រងជាន់ខ្ពស់",
            role_hradmin: "អ្នកគ្រប់គ្រង HR",
            role_hrofficer: "មន្ត្រី HR",
            role_manager: "ប្រធានគ្រប់គ្រង",
            role_employee: "បុគ្គលិក",
            role_viewer: "អ្នកមើល",
            my_profile: "ប្រវត្តិរូបរបស់ខ្ញុំ",
            settings: "ការកំណត់",
            logout: "ចាកចេញ",
            login: "ចូលប្រើ",
            language: "ភាសា",
            lang_en: "English",
            lang_km: "ភាសាខ្មែរ",

            // Common Buttons & Actions
            btn_add: "បន្ថែម",
            btn_edit: "កែសម្រួល",
            btn_delete: "លុប",
            btn_save: "រក្សាទុក",
            btn_cancel: "បោះបង់",
            btn_confirm: "បញ្ជាក់",
            btn_close: "បិទ",
            btn_submit: "ដាក់ស្នើ",
            btn_export: "ទាញយក CSV",
            btn_print: "បោះពុម្ព",
            btn_refresh: "ផ្ទុកឡើងវិញ",
            btn_view: "មើល",
            btn_filter: "ត្រង",
            btn_reset: "កំណត់ឡើងវិញ",
            btn_back: "ត្រឡប់ក្រោយ",

            // Common Table Columns
            th_id: "លេខកូដ",
            th_employee: "បុគ្គលិក",
            th_department: "នាយកដ្ឋាន",
            th_position: "មុខតំណែង / តួនាទី",
            th_status: "ស្ថានភាព",
            th_type: "ប្រភេទការងារ",
            th_join_date: "ថ្ងៃចូលធ្វើការ",
            th_contact: "ទំនាក់ទំនង",
            th_actions: "សកម្មភាព",
            th_date: "កាលបរិច្ឆេទ",
            th_remarks: "កំណត់សម្គាល់",

            // Dashboard
            dash_title: "ផ្ទាំងគ្រប់គ្រងធនធានមនុស្សប្រតិបត្តិ",
            dash_subtitle: "ទិន្នន័យជាក់ស្តែងអំពីអង្គភាព ចំនួនបុគ្គលិក និងការអនុវត្តច្បាប់ការងារ។",
            kpi_total_staff: "បុគ្គលិកសរុប",
            kpi_all_headcount: "បុគ្គលិកក្នុងបញ្ជីទាំងអស់",
            kpi_active_staff: "បុគ្គលិកសកម្ម",
            kpi_active_desc: "កំពុងបំពេញការងារ",
            kpi_new_joiners: "បុគ្គលិកចូលថ្មី",
            kpi_onboarding_desc: "ចូលបម្រើក្នុងរយៈពេល ៣០ថ្ងៃ",
            kpi_on_probation: "សាកល្បងការងារ",
            kpi_probation_desc: "ដំណាក់កាលតាមដានការងារ",
            kpi_on_leave: "កំពុងឈប់សម្រាក",
            kpi_leave_desc: "បានអនុម័តច្បាប់ឈប់",
            kpi_contracts_expiring: "កិច្ចសន្យាជិតផុត",
            kpi_contracts_desc: "ត្រូវបន្តកិច្ចសន្យាថ្មី",
            kpi_docs_expiring: "ឯកសារជិតផុត",
            kpi_docs_desc: "ត្រូវបន្តសុពលភាព",
            kpi_open_vacancies: "ដំណែងការងារទំនេរ",
            kpi_vacancies_desc: "ត្រូវការជ្រើសរើស",
            chart_dept: "ការបែងចែកបុគ្គលិកតាមនាយកដ្ឋាន",
            chart_gender: "សមាមាត្រយេនឌ័របុគ្គលិក",
            chart_type: "សមាមាត្រប្រភេទការងារ",
            chart_status: "ទិដ្ឋភាពទូទៅនៃស្ថានភាពការងារ",
            chart_join_trend: "និន្នាការចូលបម្រើការងាររបស់បុគ្គលិក (២០២៦)",
            tbl_upcoming_exp: "ឯកសារ និងកិច្ចសន្យាដែលជិតផុតកំណត់",
            tbl_exp_desc: "តាមដានទិដ្ឋាការ អត្តសញ្ញាណប័ណ្ណ វិញ្ញាបនបត្រ និងកិច្ចសន្យាការងារ។",
            btn_view_directory: "មើលបញ្ជីបុគ្គលិក",

            // Employee Directory & Profile
            emp_title: "បញ្ជីឈ្មោះបុគ្គលិក",
            emp_subtitle: "ស្វែងរក ត្រង គ្រប់គ្រង និងពិនិត្យមើលព័ត៌មានលម្អិតរបស់បុគ្គលិកទាំងអស់។",
            emp_add_btn: "បន្ថែមបុគ្គលិកថ្មី",
            emp_search_placeholder: "ស្វែងរកតាមឈ្មោះ លេខកូដ តួនាទី ឬអ៊ីមែល...",
            all_depts: "គ្រប់នាយកដ្ឋាន",
            all_positions: "គ្រប់តួនាទី",
            all_statuses: "គ្រប់ស្ថានភាព",
            all_types: "គ្រប់ប្រភេទការងារ",
            status_active: "សកម្ម",
            status_probation: "សាកល្បងការងារ",
            status_on_leave: "កំពុងឈប់សម្រាក",
            status_resigned: "លាលែង",
            status_terminated: "បញ្ឈប់",

            // Attendance
            att_title: "វត្តមាន និងម៉ោងធ្វើការ",
            att_subtitle: "តាមដានវត្តមានប្រចាំថ្ងៃ ភាពទៀងទាត់ពេលវេលា ការធ្វើការពីចម្ងាយ និងរយៈពេលវេនការងារ។",
            att_quick_punch: "ចុះវត្តមាន ចូល/ចេញ រហ័ស",
            att_log_entry: "កត់ត្រាវត្តមានបុគ្គលិក",
            att_date: "កាលបរិច្ឆេទវត្តមាន",
            att_auto_mark: "ចុះវត្តមានស្វ័យប្រវត្តិ",
            att_scheduled: "បុគ្គលិកតាមកាលវិភាគ",
            att_present_today: "មានវត្តមានថ្ងៃនេះ",
            att_late_arrivals: "មកយឺត",
            att_remote_wfh: "ធ្វើការពីផ្ទះ (WFH)",
            att_on_leave_off: "ឈប់សម្រាក / ទំនេរ",
            att_avg_shift: "រយៈពេលមធ្យមនៃវេន",
            att_daily_log: "កំណត់ត្រាវត្តមានប្រចាំថ្ងៃ",
            att_clock_in: "ម៉ោងចូល",
            att_clock_out: "ម៉ោងចេញ",
            att_work_hours: "ម៉ោងធ្វើការ",
            att_work_location: "ទីកន្លែងធ្វើការ",
            att_status_present: "មានវត្តមាន",
            att_status_late: "មកយឺត",
            att_status_wfh: "ធ្វើការពីផ្ទះ",
            att_status_halfday: "កន្លះថ្ងៃ",
            att_status_onleave: "ឈប់សម្រាក",
            att_status_absent: "អវត្តមាន",
            att_kiosk_title: "កន្លែងចុះវត្តមានស្វ័យប្រវត្តិ",

            // Leave Management
            leave_title: "ប្រព័ន្ធគ្រប់គ្រងការឈប់សម្រាក",
            leave_subtitle: "គ្រប់គ្រងសំណើសុំច្បាប់ ពិនិត្យការអនុម័ត និងតាមដានសមតុល្យច្បាប់ដែលនៅសល់។",
            leave_apply_btn: "ស្នើសុំច្បាប់ឈប់សម្រាក",
            leave_tab_requests: "ពាក្យស្នើសុំច្បាប់សម្រាក",
            leave_tab_balances: "សមតុល្យ និងសិទ្ធិឈប់សម្រាក",
            leave_tab_calendar: "កាលវិភាគឈប់សម្រាកខាងមុខ",
            leave_pending_appr: "រង់ចាំការអនុម័ត",
            leave_on_leave_today: "ឈប់សម្រាកថ្ងៃនេះ",
            leave_appr_month: "បានអនុម័តក្នុងខែនេះ",
            leave_total_days: "ចំនួនថ្ងៃប្រើប្រាស់សរុប",
            leave_category: "ប្រភេទច្បាប់ឈប់សម្រាក",
            leave_start: "ថ្ងៃចាប់ផ្តើម",
            leave_end: "ថ្ងៃបញ្ចប់",
            leave_days: "ចំនួនថ្ងៃ",
            leave_reason: "មូលហេតុ និងព័ត៌មានលម្អិត",
            leave_status_approved: "បានអនុម័ត",
            leave_status_pending: "កំពុងរង់ចាំ",
            leave_status_rejected: "បានបដិសេធ",
            leave_type_annual: "ច្បាប់ប្រចាំឆ្នាំ",
            leave_type_sick: "ច្បាប់ឈឺ",
            leave_type_casual: "ច្បាប់ផ្ទាល់ខ្លួន",
            leave_type_maternity: "ច្បាប់លំហែមាតុភាព",
            leave_type_unpaid: "ច្បាប់គ្មានប្រាក់ឈ្នួល",
            leave_btn_approve: "អនុម័ត",
            leave_btn_reject: "បដិសេធ",
            leave_remaining: "នៅសល់",

            // Recruitment & ATS
            rec_title: "ការជ្រើសរើសបុគ្គលិក និងទេពកោសល្យ",
            rec_subtitle: "តាមដានដំណែងការងារទំនេរ ដំណាក់កាលជ្រើសរើសបេក្ខជន ការសម្ភាសន៍ និងការផ្តល់ការងារ។",
            rec_add_candidate: "បន្ថែមបេក្ខជន",
            rec_post_job: "ប្រកាសរើសបុគ្គលិក",
            rec_tab_pipeline: "បំពង់ជ្រើសរើសបេក្ខជន (Kanban)",
            rec_tab_candidates: "បញ្ជីឈ្មោះបេក្ខជនទាំងអស់",
            rec_tab_jobs: "ដំណែងការងារទំនេរ",
            rec_active_openings: "ដំណែងកំពុងរើស",
            rec_total_applicants: "បេក្ខជនដាក់ពាក្យសរុប",
            rec_in_interview: "កំពុងសម្ភាសន៍",
            rec_hired: "បានជ្រើសរើស (២០២៦)",
            rec_stage_applied: "បានដាក់ពាក្យ",
            rec_stage_screening: "ពិនិត្យប្រវត្តិរូប",
            rec_stage_interview: "កំពុងសម្ភាសន៍",
            rec_stage_offer: "បានផ្តល់ការងារ",
            rec_stage_hired: "បានជ្រើសរើស",
            rec_stage_rejected: "បដិសេធ / រក្សាទុក",
            rec_move: "ផ្លាស់ប្តូរ",
            rec_rating: "ការវាយតម្លៃ",
            rec_exp_years: "បទពិសោធន៍",

            // Payroll & Compensation
            pay_title: "ប្រាក់បៀវត្សរ៍ និងសំណង",
            pay_subtitle: "ដំណើរការបើកប្រាក់បៀវត្សរ៍ប្រចាំខែ គ្រប់គ្រងរចនាសម្ព័ន្ធប្រាក់ខែ និងចេញប័ណ្ណបើកប្រាក់។",
            pay_run_batch: "ដំណើរការបើកប្រាក់បៀវត្សរ៍",
            pay_add_entry: "បន្ថែមទិន្នន័យប្រាក់ខែ",
            pay_export_register: "ទាញយកបញ្ជីប្រាក់ខែ",
            pay_net_total: "ប្រាក់បៀវត្សរ៍សុទ្ធសរុប",
            pay_gross_total: "ប្រាក់បៀវត្សរ៍សរុប",
            pay_taxes_ded: "ពន្ធ និងការកាត់កង",
            pay_avg_net: "ប្រាក់ខែសុទ្ធមធ្យម",
            pay_disbursed: "បានទូទាត់រួច",
            pay_pending: "រង់ចាំការទូទាត់",
            pay_period: "កាលបរិច្ឆេទបើកប្រាក់ខែ (ខែ/ឆ្នាំ)",
            pay_tab_register: "បញ្ជីបើកប្រាក់",
            pay_tab_structures: "រចនាសម្ព័ន្ធប្រាក់ខែ",
            pay_base_salary: "ប្រាក់ខែគោល",
            pay_allowances: "ប្រាក់ឧបត្ថម្ភ",
            pay_gross_pay: "ប្រាក់បៀវត្សរ៍សរុប",
            pay_deductions: "ប្រាក់កាត់កង",
            pay_net_pay: "ប្រាក់បៀវត្សរ៍សុទ្ធ",
            pay_status_paid: "បានទូទាត់",
            pay_status_pending: "រង់ចាំ",
            pay_status_processing: "កំពុងដំណើរការ",
            pay_payslip_title: "ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ផ្លូវការ",
            pay_print_payslip: "បោះពុម្ពប័ណ្ណបើកប្រាក់",

            // Settings & System
            set_title: "ការកំណត់ប្រព័ន្ធ និងទម្រង់ទូទៅ",
            set_subtitle: "កំណត់អត្តសញ្ញាណក្រុមហ៊ុន ប៉ារ៉ាម៉ែត្រភាសា និងមើលកំណត់ហេតុសវនកម្ម។",
            set_tab_general: "អង្គភាព និងការកំណត់ភាសា",
            set_tab_audit: "កំណត់ហេតុសវនកម្មសុវត្ថិភាព",
            set_tab_api: "ការតភ្ជាប់ Google Sheets Backend",
            set_company_identity: "អត្តសញ្ញាណក្រុមហ៊ុន",
            set_org_name: "ឈ្មោះស្ថាប័ន / ក្រុមហ៊ុន",
            set_org_logo: "តំណភ្ជាប់រូបសញ្ញា (Logo URL)",
            set_org_address: "អាសយដ្ឋានការិយាល័យកណ្តាល",
            set_country: "ប្រទេសលំនាំដើម",
            set_timezone: "តំបន់ពេលវេលា (Time Zone)",
            set_thresholds: "ទម្រង់ប្រព័ន្ធ និងលក្ខខណ្ឌកំណត់",
            set_date_format: "ទម្រង់កាលបរិច្ឆេទ",
            set_currency: "រូបិយប័ណ្ណ",
            set_empid_format: "ទម្រង់លេខកូដសម្គាល់បុគ្គលិក",
            set_expiry_days: "ការជូនដំណឹងឯកសារជិតផុតកំណត់ (ថ្ងៃ)",
            set_timeout: "រយៈពេលកំណត់សុពលភាពចូលប្រើ (នាទី)",
            set_page_size: "ចំនួនជួរដេកតារាងលំនាំដើម",
            set_language: "ភាសាប្រព័ន្ធ",
            set_save_btn: "រក្សាទុកការកំណត់ប្រព័ន្ធ",

            // Reports, Users, Lists
            rep_title: "របាយការណ៍ធនធានមនុស្សប្រតិបត្តិ",
            rep_subtitle: "បង្កើត ពិនិត្យ បោះពុម្ព និងទាញយករបាយការណ៍ធនធានមនុស្សជា CSV។",
            users_title: "ការគ្រប់គ្រងអ្នកប្រើប្រាស់ និងសិទ្ធិ",
            lists_title: "បញ្ជីទិន្នន័យគោល និងជម្រើសជ្រើសរើស"
        }
    };

    /**
     * Retrieve translated text by key
     */
    function t(key, fallback = "") {
        if (!key) return fallback;
        const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        if (dict && dict[key] !== undefined) {
            return dict[key];
        }
        // Fallback to English if missing in Khmer
        if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
            return TRANSLATIONS.en[key];
        }
        return fallback || key;
    }

    /**
     * Get current active language code ('en' or 'km')
     */
    function getLanguage() {
        return currentLang;
    }

    /**
     * Set active language and apply to DOM and typography
     */
    function setLanguage(lang, silent = false) {
        const targetLang = (lang === "km") ? "km" : "en";
        currentLang = targetLang;

        try {
            localStorage.setItem(STORAGE_KEY, targetLang);
        } catch (e) {
            console.warn("Could not save language to localStorage:", e);
        }

        // Apply HTML lang attribute
        document.documentElement.lang = targetLang;

        // Toggle Khmer font class for typography
        if (targetLang === "km") {
            document.body.classList.add("lang-km");
        } else {
            document.body.classList.remove("lang-km");
        }

        // Update Topbar Dropdown UI
        updateLanguageSwitcherUI();

        // Translate all data-i18n elements in DOM
        translateDOM(document);

        // Notify registered listeners (e.g. App to refresh current active view)
        changeListeners.forEach(fn => {
            try {
                fn(targetLang);
            } catch (err) {
                console.error("Error in language change listener:", err);
            }
        });

        // Trigger custom event for custom components or chart updates
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: targetLang } }));

        if (!silent && window.App && typeof App.showToast === "function") {
            const toastMsg = targetLang === "km" 
                ? "បានប្តូរភាសាទៅជាភាសាខ្មែរដោយជោគជ័យ (Font Battambang)"
                : "Switched language to English successfully";
            App.showToast(toastMsg, "info");
        }
    }

    function updateLanguageSwitcherUI() {
        const labelEl = document.getElementById("current-language-label");
        if (labelEl) {
            labelEl.textContent = currentLang === "km" ? "ភាសាខ្មែរ" : "English";
        }

        const checkEn = document.getElementById("check-lang-en");
        const checkKm = document.getElementById("check-lang-km");
        if (checkEn && checkKm) {
            if (currentLang === "km") {
                checkKm.classList.remove("d-none");
                checkEn.classList.add("d-none");
            } else {
                checkEn.classList.remove("d-none");
                checkKm.classList.add("d-none");
            }
        }
    }

    /**
     * Translate DOM nodes containing data-i18n attributes
     */
    function translateDOM(root = document) {
        if (!root) return;

        // Translate textContent / innerHTML
        const translatables = root.querySelectorAll("[data-i18n]");
        translatables.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (key) {
                const text = t(key);
                if (text) {
                    el.textContent = text;
                }
            }
        });

        // Translate placeholders
        const placeholders = root.querySelectorAll("[data-i18n-placeholder]");
        placeholders.forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (key) {
                const text = t(key);
                if (text) {
                    el.placeholder = text;
                }
            }
        });

        // Translate titles / aria-labels
        const titles = root.querySelectorAll("[data-i18n-title]");
        titles.forEach(el => {
            const key = el.getAttribute("data-i18n-title");
            if (key) {
                const text = t(key);
                if (text) {
                    el.title = text;
                    el.setAttribute("aria-label", text);
                }
            }
        });
    }

    /**
     * Register callback to execute on language change
     */
    function onLanguageChange(callback) {
        if (typeof callback === "function") {
            changeListeners.push(callback);
        }
    }

    /**
     * Initialize language from localStorage or settings
     */
    function init() {
        let savedLang = "en";
        try {
            savedLang = localStorage.getItem(STORAGE_KEY) || "en";
        } catch (e) {
            savedLang = "en";
        }

        setLanguage(savedLang, true);

        // Bind clicks on language dropdown items
        document.querySelectorAll(".lang-switch-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const lang = item.getAttribute("data-lang");
                if (lang) {
                    setLanguage(lang);
                }
            });
        });
    }

    return {
        init,
        t,
        getLanguage,
        setLanguage,
        translateDOM,
        onLanguageChange,
        TRANSLATIONS
    };
})();

window.I18n = I18n;
