# ApexHR Suite - HR Management Web Application

A modern, responsive, modular Human Resource Management Web Application using **Google Sheets as the primary relational database**, interfaced via a **Google Apps Script Web App REST API**.

---

## Features & Modules

- **Executive Dashboard**: 8 KPI cards, 5 Chart.js analytics charts (Department, Gender, Employment Type, Join Trend, Status), upcoming document & contract expiration table.
- **Employee Directory**: Instant client-side search, multi-criteria filtering (Department, Position, Status, Type), column sorting, pagination, and CSV export.
- **15-Tab Employee Profile Workspace**:
  1. Overview (Demographic highlights, stats, quick action bar)
  2. Personal Information
  3. Employment Placement & Status
  4. Document Management (Valid, Expiring Soon, Expired badges)
  5. Technical & Competency Skills
  6. Prior Work Experience (Interactive timeline)
  7. Academic Education
  8. Training & Certifications
  9. Emergency Contacts
  10. Family & Dependents
  11. Performance Appraisals & Ratings
  12. Career Development & Succession
  13. Leave Summary & Balances
  14. Company Assets (Laptops, tokens, equipment)
  15. Confidential HR Notes (Role-gated)
- **Attendance & Time Tracking**: Daily punch logs, self-service Clock In/Out kiosk with live clock, on-time & late alerts, remote (WFH) tracking, auto-marking, shift duration analysis, and CSV export.
- **Leave Management System**: Employee leave application workflow, multi-tier manager approvals (one-click Approve/Reject), visual entitlement balances (Annual, Sick, Casual, Unpaid), upcoming leave schedule calendar, and CSV export.
- **Recruitment & Applicant Tracking System (ATS)**: Job requisition postings, multi-stage interactive candidate Kanban pipeline (Applied, Screening, Interview, Offer, Hired, Rejected), candidate ratings (1-5 stars), interview feedback notes, resume attachments, and CSV export.
- **Payroll & Compensation**: Automated monthly payroll runs, base salary + allowances (housing, transport, bonus) calculation, statutory tax & social security deductions, payment status tracking, interactive official printable payslips, and payroll register export.
- **Multilingual Support (Khmer & English)**: Bidirectional language switching with persistent `localStorage` preference, styled using Google Fonts **Battambang** (`km`) and clean system typography (`en`).
- **User & Access Management (RBAC)**: Super Admin, HR Admin, HR Officer, Manager, Employee, Viewer roles. Passwords securely hashed with SHA-256 via browser Web Crypto API.
- **Master Data & Dynamic Dropdown Lists**: Runtime addition/editing of dropdown options (Departments, Positions, Types) without altering source code.
- **Reports Module**: Filter, print, and export CSV reports.
- **System Settings & Audit Log**: Organization profile, localization, document expiry warning threshold, and immutable security audit trail.

---

## Quick Start (Preview / Demo Mode)

You can launch and test the frontend immediately without setting up Google Sheets first!

1. Open `index.html` in any web browser (or via a local live server).
2. The application will detect that `CONFIG.API_URL` is unconfigured and automatically run in **Demo Mode**, loading realistic mock data from `js/mock-data.js`.
3. Use the **Role Switcher** in the top navigation bar to test perspectives (Super Admin, HR Admin, Manager, Employee, Viewer).

---

## Connecting Google Sheets Backend

Follow these 5 simple steps to link your Google Sheets database:

### Step 1: Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it **"HR Management Database"**.
3. Copy the Spreadsheet ID from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`

### Step 2: Open Google Apps Script
1. In your Google Sheet, click **Extensions > Apps Script**.
2. Rename the project to **"ApexHR API"**.

### Step 3: Copy Backend Code
You can choose either option:
- **Option A (Easiest)**: Open `google-apps-script/CombinedCode.gs`, copy the entire file, and paste it into `Code.gs` in Apps Script.
- **Option B (Modular)**: Create separate files matching the `google-apps-script/` directory (`Config.gs`, `Utils.gs`, `Setup.gs`, `Auth.gs`, `Employees.gs`, `SubRecords.gs`, `MasterLists.gs`, `Users.gs`, `AuditLog.gs`, `Code.gs`).

### Step 4: Run Initial Setup
1. In `Config.gs`, paste your Spreadsheet ID into `CONFIG.SPREADSHEET_ID`.
2. In the Apps Script toolbar function dropdown, select **`setupDatabase`** and click **Run**.
3. Grant authorization when prompted by Google.
4. Check your Google Sheet: All 18 tables, headers, and sample data will be created automatically!

### Step 5: Deploy as Web App
1. In Apps Script, click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Set:
   - **Description**: `ApexHR API v1`
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone`
4. Click **Deploy** and copy the **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).
5. Open `js/config.js` in your project and paste the URL:
   ```javascript
   const CONFIG = {
       API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYED_ID/exec",
       ...
   };
   ```
6. Refresh `index.html`. The top bar badge will now indicate **"Connected (Google Sheets)"**!

---

## File Structure

```
d:\CODING LESSION\HR MANAGMENT\
├── index.html                     # Responsive application shell & router view
├── README.md                      # Deployment & setup documentation
├── css/
│   └── style.css                  # Custom theme, responsive drawer, print styles
├── js/
│   ├── config.js                  # Central configuration (API_URL)
│   ├── i18n.js                    # English & Khmer i18n translation engine & Battambang font
│   ├── mock-data.js               # Standalone realistic sample dataset
│   ├── api.js                     # HTTP Client & Google Apps Script bridge
│   ├── auth.js                    # Web Crypto SHA-256 hashing & RBAC
│   ├── dashboard.js               # KPI cards, Chart.js visuals, expiry alerts
│   ├── employees.js               # Employee directory & CRUD modal
│   ├── employee-profile.js        # 15-tab workspace with sub-record modals
│   ├── attendance.js              # Attendance tracking & quick punch kiosk
│   ├── leave.js                   # Leave requests, balances, and calendar
│   ├── recruitment.js             # ATS Kanban pipeline & job requisitions
│   ├── payroll.js                 # Monthly payroll processing & payslips
│   ├── users.js                   # User accounts & role management
│   ├── lists.js                   # Dynamic Master Data management
│   ├── reports.js                 # Exportable reports
│   ├── settings.js                # System settings & audit log viewer
│   └── app.js                     # Lifecycle orchestrator & router
└── google-apps-script/
    ├── Config.gs                  # SPREADSHEET_ID & constants
    ├── Utils.gs                   # Database ORM, auto-ID, CORS responder
    ├── Setup.gs                   # setupDatabase() idempotent schema seeder
    ├── Auth.gs                    # Login validation
    ├── Employees.gs               # Employee CRUD
    ├── SubRecords.gs              # Sub-tables CRUD (Docs, Skills, Experience, etc.)
    ├── MasterLists.gs             # Dropdown options CRUD
    ├── Users.gs                   # User account CRUD
    ├── AuditLog.gs                # Security audit logging
    ├── Code.gs                    # doGet and doPost master dispatcher
    └── CombinedCode.gs            # All-in-one single script file for easy copy-paste
```
