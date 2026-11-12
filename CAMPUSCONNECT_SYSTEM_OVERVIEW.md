# CAMPUSCONNECT — SYSTEM ARCHITECTURE & TECHNICAL OVERVIEW
### Spesifikasi Desain Rekayasa Perangkat Lunak, Diagram Relasi, dan Mekanisme Multi-Tenant

> **Dokumen Teknis:** Software Architecture & System Engineering Manual  
> **Aplikasi:** CampusConnect Multi-University Integrated Platform  
> **Model Arsitektur:** Decoupled Client-Server (SPA + RESTful API) with Logical Tenant Partitioning  

---

## 1. Arsitektur Tingkat Tinggi (High-Level Architecture)

CampusConnect mengadopsi pola arsitektur **Decoupled Single Page Application (SPA)** yang berkomunikasi dengan **Laravel RESTful API** secara *stateless* menggunakan autentikasi token bearer **Laravel Sanctum**.

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Client Presentation Layer (React 19 + TypeScript)"]
        SPA["Vite SPA Client (localhost:5173)"]
        Router["React Router v7"]
        AuthCtx["AuthContext & RoleSwitcher State"]
        AxiosClient["Axios HTTP Client with Bearer Interceptor"]
        UI["Tailwind CSS + Framer Motion UI Components"]
    end

    subgraph GatewayLayer ["2. API Gateway & Middleware Security Layer"]
        CORS["CORS Middleware"]
        SanctumAuth["Sanctum Token Authentication"]
        TenantResolver["Tenant & University Scoping Middleware"]
        RBACGate["Role-Based Access Policy Gates"]
    end

    subgraph ServiceLayer ["3. Backend Application Layer (Laravel 11/12)"]
        AuthCtrl["AuthController"]
        FacilityCtrl["FacilityController (Inventory & Loans)"]
        EventCtrl["EventController & QR Scanner Engine"]
        CertCtrl["CertificateController (SHA-256 Engine)"]
        OrgCtrl["OrganizationController"]
        AnalyticsCtrl["AnalyticsController"]
        OtherCtrls["Announcement, Maintenance, Services, Discussion"]
    end

    subgraph PersistenceLayer ["4. Relational Database Layer (MySQL 8.0)"]
        TenancyTables[("universities, faculties, departments")]
        IdentityTables[("users, roles, permissions, user_role_assignments")]
        OperationalTables[("facilities, borrowings, events, registrations, tickets")]
        CommunicationTables[("announcements, discussions, maintenance, services")]
        AuditTables[("activity_logs, certificates")]
    end

    SPA --> Router
    Router --> UI
    UI --> AuthCtx
    AuthCtx --> AxiosClient

    AxiosClient -->|"HTTP/JSON REST API Requests"| CORS
    CORS --> SanctumAuth
    SanctumAuth --> TenantResolver
    TenantResolver --> RBACGate

    RBACGate --> AuthCtrl
    RBACGate --> FacilityCtrl
    RBACGate --> EventCtrl
    RBACGate --> CertCtrl
    RBACGate --> OrgCtrl
    RBACGate --> AnalyticsCtrl
    RBACGate --> OtherCtrls

    AuthCtrl --> IdentityTables
    FacilityCtrl --> OperationalTables
    EventCtrl --> OperationalTables
    CertCtrl --> AuditTables
    OrgCtrl --> OperationalTables
    AnalyticsCtrl --> OperationalTables
    OtherCtrls --> CommunicationTables
    TenantResolver -.->|"Scopes to university_id"| TenancyTables
```

---

## 2. Mekanisme Multi-Tenant (Logical Tenant Isolation)

Sistem multi-tenant CampusConnect diimplementasikan menggunakan arsitektur **Shared Database with Logical Tenant Isolation**.

### Prinsip Kerja:
1. **Pemisahan Logis berbasis `university_id`:** Seluruh tabel operasional dan data institusi memiliki kolom foreign key `university_id` yang terindeks:
   - `faculties` & `departments`
   - `facilities` (alat inventaris lab) & `facility_borrowings` (peminjaman)
   - `events` & `event_registrations`
   - `organizations` & `work_programs`
   - `announcements` & `announcement_categories`
   - `maintenance_reports` (laporan kerusakan)
   - `service_requests` (surat aktif & transkrip)
   - `documents` (arsip pedoman kampus)
2. **Scoping Query Otomatis di Backend:**
   Ketika pengguna terautentikasi mengirimkan request, controller mengekstrak `active_assignment->university_id`. Query Eloquent secara ketat menyaring data:
   ```php
   $facilities = Facility::where('university_id', $activeUniversityId)->get();
   ```
3. **Pencegahan Eksploitasi Parameter:**
   Pengguna UIR tidak dapat menyuntikkan `university_id = 2` pada payload request untuk mengakses atau memanipulasi data ITN, karena backend memvalidasi hak akses penugasan (*assignment*) pengguna sebelum mengeksekusi operasi.
4. **Platform Core (Super Admin):**
   Super Admin memiliki peran platform-wide yang mengabaikan tenant filter pada modul pemantauan global, seperti persetujuan kampus baru dan audit logs sistem.

---

## 3. Diagram Relasi Entitas Utama (Database ERD Summary)

Basis data MySQL mencakup **44 tabel relasional**. Diagram berikut menggambarkan keterhubungan entitas inti:

```mermaid
erDiagram
    UNIVERSITIES ||--o{ FACULTIES : contains
    FACULTIES ||--o{ DEPARTMENTS : organizes
    UNIVERSITIES ||--o{ USER_ROLE_ASSIGNMENTS : scopes
    DEPARTMENTS ||--o{ USER_ROLE_ASSIGNMENTS : scopes
    USERS ||--o{ USER_ROLE_ASSIGNMENTS : assigned
    ROLES ||--o{ USER_ROLE_ASSIGNMENTS : defines
    USERS ||--o| STUDENT_PROFILES : has
    USERS ||--o| LECTURER_PROFILES : has

    UNIVERSITIES ||--o{ FACILITIES : owns
    DEPARTMENTS ||--o{ FACILITIES : manages
    FACILITIES ||--o{ FACILITY_BORROWINGS : loaned_in
    USERS ||--o{ FACILITY_BORROWINGS : borrows

    UNIVERSITIES ||--o{ EVENTS : hosts
    EVENTS ||--o{ EVENT_REGISTRATIONS : receives
    USERS ||--o{ EVENT_REGISTRATIONS : books
    EVENT_REGISTRATIONS ||--o| EVENT_ATTENDANCES : checked_in

    UNIVERSITIES ||--o{ CERTIFICATES : issues
    USERS ||--o{ CERTIFICATES : awards
    EVENTS ||--o| CERTIFICATES : generates

    UNIVERSITIES ||--o{ ORGANIZATIONS : establishes
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : consists_of
    USERS ||--o{ ORGANIZATION_MEMBERS : participates

    UNIVERSITIES ||--o{ ACTIVITY_LOGS : records
    USERS ||--o{ ACTIVITY_LOGS : performs
```

---

## 4. Alur Komunikasi End-to-End (Workflow Sequence Diagrams)

### A. Alur Peminjaman Alat Lab (Equipment Borrowing State Machine)
```mermaid
sequenceDiagram
    autonumber
    actor Student as Mahasiswa (Alex)
    participant Frontend as React Client
    participant API as Laravel REST API
    participant DB as MySQL Database
    actor Admin as Dept Admin (Agus)

    Student->>Frontend: Klik "Borrow Item" & isi tanggal pinjam
    Frontend->>API: POST /api/v1/borrowings (facility_id, dates, purpose)
    API->>DB: Check available_quantity >= requested
    API->>DB: INSERT facility_borrowings (status = 'pending')
    DB-->>API: Borrowing Created (ID: 101)
    API-->>Frontend: 201 Created (Pending Approval)

    Admin->>Frontend: Buka "Borrowing Approvals"
    Frontend->>API: GET /api/v1/borrowings
    API-->>Frontend: Daftar peminjaman pending
    Admin->>Frontend: Klik "Approve"
    Frontend->>API: POST /api/v1/borrowings/101/approve
    API->>DB: UPDATE status = 'approved'

    Admin->>Frontend: Mahasiswa ambil barang -> Klik "Record Pickup"
    Frontend->>API: POST /api/v1/borrowings/101/pickup
    API->>DB: UPDATE status = 'picked_up', picked_up_at = NOW()

    Admin->>Frontend: Mahasiswa kembalikan barang -> Klik "Record Return"
    Frontend->>API: POST /api/v1/borrowings/101/return (condition = 'good')
    API->>DB: DB::transaction (UPDATE status='returned', RESTORE available_quantity +1)
    DB-->>API: Transaction Committed
    API-->>Frontend: 200 OK (Stok Pulih & Selesai)
```

---

### B. Alur Tiket QR Code & Validasi Anti-Duplikasi
```mermaid
sequenceDiagram
    autonumber
    actor Participant as Mahasiswa (Alex)
    participant Client as React Client
    participant API as Laravel Event Engine
    participant DB as MySQL Database
    actor Officer as Petugas Scanner

    Participant->>Client: Klik "Register Now" pada event
    Client->>API: POST /api/v1/events/{id}/register
    API->>DB: DB::transaction (lockForUpdate check quota)
    API->>DB: Generate Ticket Code TCK-XXXXXXXX & QR Token (SHA-256)
    DB-->>API: Ticket Registered
    API-->>Client: 201 Created + Ticket Data
    Client-->>Participant: Tampilkan Kartu Tiket & QR Code SVG

    Officer->>Client: Scan QR Code via Kamera / Input Manual
    Client->>API: POST /api/v1/events/verify-ticket (token: TCK-XXXXXXXX)
    API->>DB: SELECT registration WHERE ticket_code = token
    alt Belum Pernah Hadir (status == 'registered')
        API->>DB: UPDATE status = 'attended', checked_in_at = NOW()
        API->>DB: INSERT event_attendances
        API-->>Client: 200 OK (Check-In Confirmed - Hijau)
    else Sudah Pernah Hadir (status == 'attended')
        API-->>Client: 409 Conflict (DUPLICATE CHECK-IN PREVENTED - Merah)
    end
```

---

## 5. Keamanan & Integritas Data (Security Architecture)

1. **Otentikasi Aman (Bearer Tokens):**
   - Menggunakan token Sanctum dengan *hashed token storage* di tabel `personal_access_tokens`.
   - Token disimpan secara aman di browser client dan dikirim via header `Authorization: Bearer <token>`.
2. **Hashing Kata Sandi:**
   - Semua password di-hash menggunakan algoritma **Bcrypt** standar industri dengan *cost factor* 12.
3. **Pencegahan Concurrency Conflict (Race Conditions):**
   - Kuota pendaftaran event dan stok barang inventaris dilindungi dengan `DB::transaction()` dan penguncian baris pesimistik `lockForUpdate()`.
4. **Verifikasi Kriptografis Publik:**
   - Setiap e-sertifikat dilengkapi `verify_hash` unik yang di-generate dari gabungan nomor seri, ID penerima, dan timestamp menggunakan fungsi hash SHA-256:
     ```php
     $verifyHash = hash('sha256', $certNumber . '-' . $recipient->id . '-' . time());
     ```
   - Halaman publik `/verify/:hash` mencocokkan hash tersebut secara langsung ke database tanpa membuka celah data privat.
5. **Audit Logging Komprehensif:**
   - Seluruh aktivitas mutasi penting (login, persetujuan peminjaman, registrasi universitas, update password) dicatat otomatis di tabel `activity_logs` beserta metadata alamat IP (`$request->ip()`) dan User Agent klien.

---

*Spesifikasi Arsitektur Sistem CampusConnect v1.0.0 — Siap untuk Produksi dan Uji Sidang Akademik.*
