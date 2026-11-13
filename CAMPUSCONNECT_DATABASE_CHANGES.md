# CAMPUSCONNECT — DATABASE SCHEMA EXPANSION SPECIFICATION

**Platform**: CampusConnect (Multi-University Ecosystem)  
**Database**: MySQL 8.x (InnoDB, utf8mb4_unicode_ci)  
**Migration Framework**: Laravel 11 Database Migrations  

Dokumen ini mendokumentasikan secara rinci seluruh penambahan skema database, tabel baru, kolom relasional, indeks performa, foreign key constraints, serta mekanisme rollback.

---

## 1. Migrasi Baru yang Diterapkan

| No | File Migrasi | Tabel Terkait | Tujuan Utama |
|---|---|---|---|
| 1 | `2026_11_13_050001_create_community_safety_and_privacy_tables.php` | `content_reports`, `user_blocks`, `user_mutes`, `user_privacy_settings`, `saved_posts`, `campus_posts` (alter), `campus_post_comments` (alter) | Sistem moderasi pelaporan konten, blokir/mute pengguna, preferensi privasi, dan bookmark postingan. |
| 2 | `2026_11_13_050002_create_academic_progress_tables.php` | `academic_semesters`, `academic_courses` | Riwayat akademik, semester, IPS/IPK, SKS lulus, dan transkrip nilai per matakuliah. |
| 3 | `2026_11_13_050003_create_campus_map_tables.php` | `campus_locations` | Titik koordinat Latitude & Longitude gedung, fakultas, laboratorium, dan fasilitas kampus. |
| 4 | `2026_11_13_050004_create_career_center_tables.php` | `career_opportunities`, `career_applications`, `career_bookmarks` | Portal karier, magang bersertifikat, lamaran online dengan CV, dan bookmark peluang. |
| 5 | `2026_11_13_050005_create_digital_library_tables.php` | `library_items`, `library_loans` | Katalog perpustakaan terpadu, stok buku, peminjaman 14 hari, dan kalkulasi denda keterlambatan. |
| 6 | `2026_11_13_050006_create_event_org_doc_chat_enhancements_tables.php` | `event_waitlists`, `organization_finances`, `document_versions`, `group_conversations`, `group_conversation_members`, `direct_messages` (alter) | Antrean tunggu tiket acara, pembukuan kas organisasi, riwayat versi dokumen, dan lampiran berkas DM. |

---

## 2. Rincian Skema Tabel Baru

### A. Tabel `content_reports`
Menyimpan tiket laporan pelanggaran dari civitas akademika kepada tim moderator kampus.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `reporter_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `users.id` (ON DELETE CASCADE)
- `university_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `universities.id` (ON DELETE CASCADE)
- `reportable_type`: VARCHAR(50) (e.g., `'post'`, `'comment'`, `'user'`)
- `reportable_id`: BIGINT UNSIGNED
- `category`: ENUM('inappropriate', 'harassment', 'hate_speech', 'spam', 'false_information', 'plagiarism', 'other')
- `reason`: TEXT
- `status`: ENUM('pending', 'under_review', 'resolved', 'dismissed'), DEFAULT 'pending'
- `action_taken`: ENUM('none', 'content_hidden', 'user_warned', 'user_suspended', 'dismissed'), DEFAULT 'none'
- `moderator_id`: BIGINT UNSIGNED NULL, Foreign Key $\rightarrow$ `users.id` (ON DELETE SET NULL)
- `moderator_notes`: TEXT NULL
- `resolved_at`: TIMESTAMP NULL
- `created_at`, `updated_at`: TIMESTAMP
- **Indeks**: `['university_id', 'status']`, `['reportable_type', 'reportable_id']`, `['reporter_id', 'created_at']`

### B. Tabel `user_blocks` & `user_mutes`
- `user_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `users.id`
- `target_user_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `users.id`
- `reason`: VARCHAR(255) NULL
- **Constraint**: `UNIQUE KEY ['user_id', 'target_user_id']`

### C. Tabel `user_privacy_settings`
- `user_id`: BIGINT UNSIGNED UNIQUE, Foreign Key $\rightarrow$ `users.id`
- `profile_visibility`: ENUM('public', 'campus_only', 'private'), DEFAULT 'campus_only'
- `direct_messages_permission`: ENUM('everyone', 'campus_only', 'none'), DEFAULT 'campus_only'
- `show_academic_progress`: BOOLEAN, DEFAULT true
- `allow_tagging`: BOOLEAN, DEFAULT true
- `notify_on_like`: BOOLEAN, DEFAULT true
- `notify_on_comment`: BOOLEAN, DEFAULT true
- `notify_on_follow`: BOOLEAN, DEFAULT true
- `notify_on_events`: BOOLEAN, DEFAULT true
- `notify_on_borrowings`: BOOLEAN, DEFAULT true

### D. Tabel `saved_posts`
- `user_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `users.id`
- `post_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `campus_posts.id`
- **Constraint**: `UNIQUE KEY ['user_id', 'post_id']`

### E. Tabel `academic_semesters` & `academic_courses`
- `academic_semesters`:
  - `user_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `users.id`
  - `university_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `universities.id`
  - `semester_number`: INT (1 s/d 8)
  - `academic_year`: VARCHAR(20) (e.g. `'2025/2026'`)
  - `term`: ENUM('odd', 'even', 'short')
  - `gpa`: DECIMAL(3, 2)
  - `cgpa`: DECIMAL(3, 2)
  - `credits_taken`: INT
  - `credits_passed`: INT
  - `is_simulation`: BOOLEAN DEFAULT true
- `academic_courses`:
  - `academic_semester_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `academic_semesters.id`
  - `course_code`: VARCHAR(20)
  - `course_name`: VARCHAR(255)
  - `credits`: INT
  - `grade`: VARCHAR(5) NULL (A, A-, B+, dll.)
  - `grade_point`: DECIMAL(3, 2) NULL (4.00, 3.75, 3.50, dll.)
  - `attendance_percentage`: DECIMAL(5, 2) DEFAULT 100.00
  - `status`: ENUM('enrolled', 'passed', 'failed', 'withdrawn')

### F. Tabel `campus_locations`
- `university_id`: BIGINT UNSIGNED, Foreign Key $\rightarrow$ `universities.id`
- `name`: VARCHAR(255)
- `category`: ENUM('faculty', 'department', 'library', 'laboratory', 'auditorium', 'classroom', 'canteen', 'parking', 'general')
- `latitude`: DECIMAL(10, 8)
- `longitude`: DECIMAL(11, 8)
- `building_number`: VARCHAR(50) NULL
- `floor`: VARCHAR(50) NULL
- `description`: TEXT NULL
- `photo_url`: VARCHAR(255) NULL
- `operating_hours`: VARCHAR(100) NULL
- `contact_phone`: VARCHAR(50) NULL

### G. Tabel `career_opportunities` & `career_applications`
- `career_opportunities`:
  - `title`, `company_name`, `company_logo`, `location`, `type` (internship, full_time, part_time, scholarship, competition), `workplace_type` (remote, onsite, hybrid), `salary_range`, `requirements`, `application_deadline`, `is_verified`
- `career_applications`:
  - `opportunity_id`, `user_id`, `cv_url`, `portfolio_url`, `cover_letter`, `status` (submitted, under_review, accepted, rejected, withdrawn)

### H. Tabel `library_items` & `library_loans`
- `library_items`:
  - `title`, `author`, `publisher`, `publication_year`, `isbn`, `category`, `call_number`, `cover_image`, `file_url`, `total_stock`, `available_stock`, `is_digital_only`
- `library_loans`:
  - `library_item_id`, `user_id`, `borrowed_at`, `due_at`, `returned_at`, `status` (borrowed, returned, overdue), `fine_amount` (Rp 1.000 / hari keterlambatan)

### I. Tabel Penunjang Organisasi, Acara & Dokumen
- `event_waitlists`: `['event_id', 'user_id', 'queue_position', 'status']`
- `organization_finances`: `['organization_id', 'type', 'title', 'amount', 'category', 'transaction_date', 'notes']`
- `document_versions`: `['document_id', 'version', 'file_name', 'file_path', 'file_size', 'changelog', 'uploaded_by']`

---

## 3. Alter Kolom pada Tabel yang Ada

1. **`campus_posts`**:
   - Ditambahkan: `is_hidden` (BOOLEAN DEFAULT false)
   - Ditambahkan: `hidden_reason` (VARCHAR(255) NULL)
   - Ditambahkan: `edited_at` (TIMESTAMP NULL)
2. **`campus_post_comments`**:
   - Ditambahkan: `is_hidden` (BOOLEAN DEFAULT false)
3. **`direct_messages`**:
   - Ditambahkan: `attachment_url` (VARCHAR(255) NULL)
   - Ditambahkan: `attachment_name` (VARCHAR(255) NULL)
   - Ditambahkan: `attachment_type` (VARCHAR(50) NULL)
   - Ditambahkan: `group_id` (BIGINT UNSIGNED NULL)

---

## 4. Prosedur Rollback Migrasi

Apabila diperlukan rollback skema:
```bash
php artisan migrate:rollback --step=6
```
Semua alter column akan di-drop secara aman melalui metode `down()` yang telah dilengkapi pemeriksaan `hasColumn()` dan `dropForeign()`.

