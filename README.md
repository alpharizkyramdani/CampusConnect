# CampusConnect — Multi-University Integrated Digital Platform

> **"One Platform, Every Campus, Connected."**

[![Laravel](https://img.shields.io/badge/Backend-Laravel%2011%2F12-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20TypeScript-blue.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/License-Academic%20RPL-green.svg)](#)

---

## 1. Executive Summary & Project Overview

**CampusConnect** is an enterprise-grade, multi-university integrated digital platform engineered to unify universities, academic faculties, departments, students, lecturers, student activity units (UKM), student governance bodies (BEM/DPM/HIMA), and campus administrators into one synchronized ecosystem.

Rather than fragmenting campus operations across disconnected chat groups, spreadsheets, paper loan slips, and isolated legacy portals, CampusConnect provides an end-to-end, multi-tenant digital hub covering:
- **Logical Multi-Tenant Architecture:** Independent data isolation for participating universities while enabling global verification and cross-campus collaboration.
- **Contextual Multi-Role RBAC:** Granular role and permission management supporting users holding simultaneous roles (e.g., Student + UKM Leader).
- **Paperless Equipment Loan Lifecycle:** Real-time stock reservation, multi-stage approval (Pending → Approved → Picked Up → Returned), and physical condition tracking.
- **Automated Event & Digital Ticketing:** QR check-in scanning with duplicate prevention and cryptographic ticket validation.
- **Digital Credentialing & Verification:** Cryptographic SHA-256 hash certificate verification accessible publicly without login.
- **Student Activity Portfolio:** Verified co-curricular transcript generation and one-click PDF export for job applications and graduation requirements.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with Vite & TypeScript
- **Styling:** Tailwind CSS with Custom Theme (`#2563EB` Royal Blue, `#172B4D` Deep Navy, `#F8FAFC` Clean Canvas)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts & Data Analytics:** Recharts (Responsive Area, Bar, and Stat Metrics)
- **Routing:** React Router v7 with Nested Protected Layouts & Dynamic Auth Guards
- **HTTP Client:** Axios with JWT/Sanctum Bearer Token Interceptors
- **QR Engine:** `qrcode.react` (SVG QR generation) & HTML5 Canvas / Camera Barcode Scanner
- **Document Export:** jsPDF for instant verified portfolio export

### Backend
- **Framework:** Laravel 11/12 RESTful API
- **Language:** PHP 8.4 (Herd Lite / XAMPP compatible)
- **Authentication:** Laravel Sanctum (Stateful & Bearer Token Authentication)
- **Authorization:** Granular RBAC, Policy Gates, and Scoped Tenant Middleware
- **Database Engine:** MySQL 8.0 / MariaDB with Strict Foreign Keys, Transactions, and Pessimistic Locking (`lockForUpdate`)
- **Logging & Security:** Database Activity/Audit Trail logging IP, User Agent, and JSON snapshots

---

## 3. Multi-University Tenancy Architecture

CampusConnect employs a **Shared Database with Logical Tenant Isolation** architecture:

```
CampusConnect Ecosystem
 ├── University A (e.g. Universitas Indonesia Raya - UIR)
 │    ├── Faculty of Engineering
 │    │    └── Informatics Engineering Dept (Inventory, Loans, Facilities)
 │    ├── Student Organizations (UKM Robotics, BEM Faculty of Engineering)
 │    └── Campus Services, Academic Calendar, Maintenance Reports
 │
 ├── University B (e.g. Institut Teknologi Nusantara - ITN)
 │    ├── Faculty of Information Technology
 │    │    └── Computer Science Dept
 │    ├── Student Organizations (UKM Cyber Security)
 │    └── Campus Services, Academic Calendar, Maintenance Reports
 │
 └── Platform Core (Super Admin)
      ├── University Registration & Onboarding Approval
      ├── Cross-Campus Digital Certificate Public Verification
      ├── Platform-Wide Analytics & System Audit Logs
      └── Global User Directory & Tenancy Activation
```

- Every institution-specific table (`faculties`, `departments`, `organizations`, `events`, `facilities`, `maintenance_reports`, `service_requests`, `documents`, etc.) contains a `university_id` foreign key.
- Eloquent queries and API controllers enforce tenant isolation based on the user's active university context.
- Cross-tenant leakage is strictly prevented at the backend database query layer.

---

## 4. User Roles & Permission Matrix

| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | Platform-Wide | Register/Approve universities, global audit logs, cross-campus analytics, manage platform admins. |
| **Campus Admin** | University | Manage campus profile, academic calendar, campus announcements, approve UKM/Ormawa registrations, moderate services. |
| **Department Admin** | Department | Department equipment catalog, approve/reject borrowing requests, record pickup & return conditions, stock adjustments. |
| **UKM Admin** | Student Unit | Unit profile, recruit members, create activities, issue event tickets, QR check-in attendance, analytics. |
| **Ormawa Admin** | BEM / HIMA | Governance structure, work programs, publish events, coordinate campus activities, announcements. |
| **Student** | Campus | Browse events, digital QR tickets, borrow equipment, submit damage reports, Lost & Found, download verified certificates, portfolio. |
| **Lecturer** | Academic | Academic announcements, educational events, campus directory, research activities, student portfolio review. |

### Contextual Multi-Role System
CampusConnect allows a single account to hold multiple assignments simultaneously. A student can serve as a UKM President and switch between their Student view and UKM Admin view instantly using the integrated **Role Switcher** in the top navigation bar without logging out.

---

## 5. System Architecture & Directory Structure

```
CampusConnect/
├── frontend/                         # React 19 + TypeScript + Vite Application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Sidebar, Layout, RoleSwitcher, NotificationDropdown
│   │   │   └── ui/                   # StatCard, Badge, Modal reusable UI elements
│   │   ├── contexts/                 # AuthContext (state, tokens, active role switching)
│   │   ├── pages/                    # 24 Complete Module Pages
│   │   ├── routes/                   # AppRoutes (Public & Role-Guarded Protected Routes)
│   │   ├── services/                 # Axios API client instance with interceptors
│   │   ├── types/                    # Strict TypeScript interfaces and data models
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Application entry point
│   │   └── index.css                 # Tailwind CSS definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # Laravel 11/12 RESTful API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/      # 16 Specialized REST Controllers
│   │   │   └── Middleware/           # Tenant and RBAC authorization
│   │   └── Models/                   # 25+ Eloquent Models with Relationships
│   ├── database/
│   │   ├── migrations/               # 8 Migration files (44 Relational Tables)
│   │   └── seeders/                  # DatabaseSeeder with realistic institutions, users, and seed data
│   ├── routes/
│   │   └── api.php                   # 85+ Registered API Endpoints with /api/v1 prefix
│   ├── tests/
│   │   └── Feature/                  # PHPUnit test suite (Workflow, Auth, Tenancy, QR Scanner)
│   ├── .env                          # Backend environment configuration
│   └── composer.json
│
└── README.md                         # Master Documentation
```

---

## 6. Database Schema (44 Relational Tables)

1. **Platform & Tenancy:** `universities`, `university_registration_requests`, `university_settings`, `faculties`, `departments`.
2. **Identity & RBAC:** `users`, `roles`, `permissions`, `role_permissions`, `user_role_assignments`, `student_profiles`, `lecturer_profiles`.
3. **Organizations:** `organizations`, `organization_members`, `organization_applications`, `work_programs`.
4. **Communication:** `announcement_categories`, `announcements`, `announcement_reads`, `notifications`.
5. **Events & Digital Tickets:** `event_categories`, `events`, `event_registrations`, `event_attendances`, `academic_events`.
6. **Facilities & Inventory:** `facility_categories`, `facilities`, `facility_borrowings`, `inventory_movements`.
7. **Maintenance & Public Safety:** `maintenance_reports`, `maintenance_updates`, `lost_found_items`, `item_claims`.
8. **Student Services & Academic Records:** `service_types`, `service_requests`, `document_categories`, `documents`, `certificates`, `student_activities`, `achievements`.
9. **Collaboration & Security:** `discussion_categories`, `discussion_posts`, `discussion_comments`, `discussion_reports`, `activity_logs`.

---

## 7. Demo Accounts & Credentials

All test accounts share the standard password: `password`

| Role | Name | Email | Institution / Context |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Budi Wicaksono | `superadmin@campusconnect.id` | Platform Headquarters |
| **Campus Admin (UIR)** | Hendra Gunawan, S.Kom | `admin.uir@campusconnect.id` | Universitas Indonesia Raya |
| **Campus Admin (ITN)** | Ir. Ratna Juwita, M.T. | `admin.itn@campusconnect.id` | Institut Teknologi Nusantara |
| **Department Admin** | Agus Wicaksono, M.Kom | `dept.ti@uir.ac.id` | Dept. Teknik Informatika - UIR |
| **UKM Admin** | Bayu Pratama | `ukm.robotics@uir.ac.id` | UKM Robotics Club - UIR |
| **Ormawa Admin** | Dimas Anggara | `bem.ft@uir.ac.id` | BEM Fakultas Teknik - UIR |
| **Student (Multi-Role)** | Alex Chandra | `student.alex@uir.ac.id` | Student + UKM Admin (UIR) |
| **Student** | Budi Santoso | `student.budi@itn.ac.id` | Student (ITN) |
| **Lecturer** | Dr. Sarah Nurhaliza | `lecturer.sarah@uir.ac.id` | Dosen Teknik Informatika - UIR |

> [!TIP]
> The login screen (`http://localhost:5173/login`) features **1-Click Demo Login** buttons that allow testing any role instantly without typing credentials.

---

## 8. Installation & Setup Guide

### Prerequisites
- PHP >= 8.2 or 8.4 with `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` extensions
- Composer >= 2.6
- Node.js >= 20.x and npm
- MySQL Server (via XAMPP, Laragon, Herd, or native service)

### Step 1: Database Setup
Start your local MySQL service (e.g. via XAMPP Control Panel) on `127.0.0.1:3306`.
Create the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Backend Configuration
```bash
cd backend

# Install PHP dependencies
composer install --no-scripts

# Setup environment variables
cp .env.example .env
php artisan key:generate

# Execute database migrations and seed realistic records
php artisan migrate:fresh --seed

# Create storage symlink
php artisan storage:link

# Start the Laravel REST API server
php artisan serve --port=8000
```
Backend API will be live at `http://127.0.0.1:8000`.

### Step 3: Frontend Configuration
In a new terminal window:
```bash
cd frontend

# Install node dependencies
npm.cmd install

# Start the Vite development server
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```
Frontend web application will be live at `http://127.0.0.1:5173`.

---

## 9. Automated Testing & Verification

The backend includes a comprehensive PHPUnit feature test suite covering critical academic workflows across all modules:

```bash
cd backend
php artisan test
```

### Verified Test Cases (19 Suites / 66 Assertions):
1. `test_auth_login_returns_token_and_roles`: Validates Sanctum authentication token issuance and role assignments.
2. `test_unauthenticated_requests_are_rejected`: Confirms 401 Unauthorized protection on private endpoints.
3. `test_public_universities_listing`: Ensures public endpoint accessibility.
4. `test_equipment_borrowing_lifecycle`: Validates complete loan workflow (Student loan request → Department Admin approval → Pickup → Physical Return & Stock adjustment).
5. `test_event_registration_and_qr_attendance`: Validates ticket issuance, live QR verification, and 409 Duplicate Check-in Prevention.
6. `test_certificate_public_verification`: Confirms cryptographic SHA-256 hash and serial number authenticity verification.
7. `test_multi_tenant_isolation_uir_and_itn`: Validates strict tenant scoping between UIR and ITN datasets.
8. `test_user_profile_and_password_update`: Verifies name/phone editing, old password validation, and secure Bcrypt updating.
9. `test_reset_password_endpoint`: Verifies self-service password reset via email.
10. `test_facility_maintenance_report_lifecycle`: Validates damage ticket creation and progression to resolved status.
11. `test_student_service_request_lifecycle`: Validates academic letter requests and admin completion.
12. `test_discussion_forum_thread`: Validates community posts and threaded nested comments.
13. `test_portfolio_activity_and_achievement`: Validates extracurricular activity logs and award entries.
14. `test_campus_announcement_crud`: Validates announcement creation, public broadcasting, and deletion.
15. `test_lost_and_found_posting_and_claim`: Validates lost/found registry and private proof-of-ownership claim submission.
16. `test_document_repository_download_counter`: Validates download counter increments and role permissions.
17. `test_super_admin_university_registration_approval`: Validates institutional onboarding submission and Super Admin approval.

---

## 10. Comprehensive Documentation Suite

| Document | Purpose & Contents |
| :--- | :--- |
| [README.md](file:///c:/xampp/htdocs/CampusConnect/README.md) | Architectural manual, setup instructions, technology stack, and demo accounts. |
| [CAMPUSCONNECT_TEST_GUIDE.md](file:///c:/xampp/htdocs/CampusConnect/CAMPUSCONNECT_TEST_GUIDE.md) | Step-by-step user and evaluator testing guide for all 18 modules and 7 roles. |
| [CAMPUSCONNECT_QA_REPORT.md](file:///c:/xampp/htdocs/CampusConnect/CAMPUSCONNECT_QA_REPORT.md) | Comprehensive QA test report with module matrix, bug registry, and responsiveness audit. |
| [.env.example](file:///c:/xampp/htdocs/CampusConnect/.env.example) | Environment template for local and production deployment. |

---

## 10. Key Modules Overview

### 1. Equipment Inventory & Borrowing
- Complete lifecycle: `pending` → `approved` → `picked_up` → `returned` / `rejected`.
- Automatic quantity tracking with transaction safety.
- Condition check on return (`good`, `fair`, `damaged`).

### 2. Events & Real-Time QR Scanner
- Concurrency-safe event registration preventing overselling of seats.
- Dynamic QR code generation for digital tickets (`TCK-XXXXXX`).
- Real-time QR camera scanner and manual barcode input with instant feedback.
- Anti-duplicate attendance scanner alert.

### 3. Student Activity Portfolio & Certificates
- Consolidated co-curricular record (Events, Competitions, Organizational leadership).
- One-click PDF generation via client-side jsPDF.
- Cryptographically verifiable certificates with public verification URL `/verify/{hash}`.

### 4. Campus Services & Document Center
- Academic transcript requests, active student letters, and official recommendations with digital workflow status (`submitted` → `processing` → `completed`).
- Searchable university document repository with download counters and role-based permissions (`public`, `campus`, `staff`).

### 5. Facility Maintenance & Lost and Found
- 6-stage maintenance ticket tracking (`reported` → `under_review` → `scheduled` → `in_progress` → `resolved` → `rejected`).
- Lost and Found registry with private proof-of-ownership claim submission and administrative verification.

---

## 11. Academic Suitability (Rekayasa Perangkat Lunak)

CampusConnect adheres to recognized Software Engineering best practices:
- **Clean Architecture & Separation of Concerns:** Decoupled React frontend and Laravel REST API.
- **Data Integrity:** Relational constraints, indexed foreign keys, database cascades, and transactions.
- **Defensive Engineering:** Strict server-side Form Requests, role-based authorization, rate limiting, and duplicate prevention.
- **User Experience:** Consistent Blue-White Premium aesthetic, responsive mobile sidebar, instant feedback toasts, and modal interactions.

---

*Developed for the Academic Community. Built with excellence for multi-campus connectivity.*

