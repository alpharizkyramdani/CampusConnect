# CAMPUSCONNECT — PRESENTATION & DEMONSTRATION GUIDE
## Panduan Resmi Presentasi & Demonstrasi Langsung di Hadapan Penguji

> **Nama Produk:** CampusConnect Multi-University Integrated Platform  
> **Tagline:** *"One Platform, Every Campus, Connected."*  
> **Target Audiens:** Dosen Pembimbing, Dosen Penguji Sidang RPL, dan Evaluator Perangkat Lunak  
> **Durasi Ideal Presentasi:** 15 – 25 Menit

---

## 1. Latar Belakang & Tujuan Aplikasi

### Masalah Nyata di Lingkungan Kampus:
1. **Fragmentasi Sistem:** Mahasiswa harus menggunakan banyak portal terpisah untuk mengecek pengumuman, meminjam proyektor/alat lab, mendaftar event, dan meminta surat aktif kuliah.
2. **Keterbatasan Single-Campus:** Kebanyakan aplikasi kampus bersifat tertutup dan tidak mampu menghubungkan kolaborasi lintas universitas dalam satu ekosistem terpadu.
3. **Peminjaman Alat Konvensional:** Masih mengandalkan formulir kertas atau chat WhatsApp yang rawan kehilangan riwayat dan perebutan stok.
4. **Pemalsuan Sertifikat:** Maraknya sertifikat seminar/lomba digital tanpa tanda tangan kriptografis yang valid dan tidak dapat diverifikasi publik secara instan.

### Solusi CampusConnect:
**CampusConnect** menghadirkan satu platform multi-kampus terintegrasi dengan arsitektur multi-tenant logis, sistem hak akses fleksibel (*Role-Based Access Control* dengan *Role Switcher*), tiket digital ber-QR Code dengan anti-duplikasi, verifikasi sertifikat SHA-256 publik, dan ekspor portofolio kegiatan resmi mahasiswa ke format PDF.

---

## 2. Tabel Akun Demo untuk Presentasi

Semua akun demo menggunakan password yang sama: **`password`**

| Role Persona | Email Akun | Konteks Kampus | Fitur Kunci yang Ditunjukkan |
|:---|:---|:---|:---|
| **Super Admin** | `superadmin@campusconnect.id` | Platform Headquarters | Global Analytics, University Approval, Audit Logs |
| **Campus Admin (UIR)** | `admin.uir@campusconnect.id` | Universitas Islam Riau (UIR) | Campus Announcements, Academic Calendar, E-Services |
| **Campus Admin (ITN)** | `admin.itn@campusconnect.id` | Institut Teknologi Nasional (ITN) | Data Isolation Comparison vs UIR |
| **Department Admin** | `dept.ti@uir.ac.id` | Dept. Teknik Informatika (UIR) | Lab Inventory, Borrowing Approval & Return Check |
| **UKM Admin** | `ukm.robotics@uir.ac.id` | UKM Robotics Club (UIR) | Event Publishing, QR Ticket Check-In Scanner |
| **Ormawa Admin** | `bem.ft@uir.ac.id` | BEM Fakultas Teknik (UIR) | Work Programs, Member Recruitment Queue |
| **Student (Alex)** | `student.alex@uir.ac.id` | Student + UKM Admin (UIR) | **Role Switcher Demo**, Event Tickets, Equipment Loan |
| **Student (Budi)** | `student.budi@itn.ac.id` | Student (ITN) | ITN Scoped Student Hub |
| **Lecturer (Sarah)** | `lecturer.sarah@uir.ac.id` | Dosen Informatika (UIR) | Academic Announcements, Public Directory Profile |

> [!TIP]
> Di halaman Login (`http://127.0.0.1:5173/login`), gunakan panel **Quick Test Accounts (Click to Fill)** untuk masuk ke akun manapun hanya dengan 1 kali klik.

---

## 3. Alur Skenario Demonstrasi Runtut (Live Demo Script)

Ikuti 16 langkah berurutan ini agar demonstrasi di hadapan penguji berjalan lancar dan mengesankan:

### Babak 1: Pembukaan & Landing Page (Menit 00:00 – 03:00)
1. **Buka URL:** `http://127.0.0.1:5173/`
2. **Poin Penjelasan:**
   - Jelaskan konsep *"One Platform, Every Campus, Connected."*
   - Tunjukkan kartu universitas mitra yang terhubung: **Universitas Islam Riau (UIR)** dan **Institut Teknologi Nasional (ITN)**.
   - Sorot fitur unggulan di landing page: *Multi-Tenant Isolation, QR Code Attendance, Paperless Inventory, Cryptographic Certificate Verification*.

### Babak 2: Super Admin Platform Console (Menit 03:00 – 06:00)
3. **Login:** Klik *Sign In*, klik tombol instan **Super Admin** (`superadmin@campusconnect.id`).
4. **Poin Penjelasan:**
   - Tunjukkan **Platform Analytics Dashboard** yang merefleksikan seluruh universitas yang terdaftar.
   - Buka menu **User Directory** (`/users`): Tunjukkan kemampuan aktivasi/penangguhan akun dan penugasan role.
   - Buka menu **System Audit Logs** (`/audit-logs`): Tunjukkan catatan riwayat keamanan sistem yang mencatat alamat IP, waktu, dan aksi sensitif secara permanen.

### Babak 3: Campus Admin & Pembatasan Multi-Tenant (Menit 06:00 – 09:00)
5. **Login:** Logout, lalu klik tombol instan **Admin UIR** (`admin.uir@campusconnect.id`).
6. **Poin Penjelasan:**
   - Perhatikan badge institusi di navbar atas: **Universitas Islam Riau (UIR)**.
   - Tunjukkan **Campus Announcements** (`/announcements`): Pengumuman kampus dengan tingkat urgensi (*Urgent, High, Normal*).
   - Tunjukkan **Academic Calendar** (`/calendar`): Jadwal semester dan UTS/UAS terintegrasi.
   - Tunjukkan **Student Services Desk** (`/services`): Tempat admin memproses permohonan surat aktif kuliah dan transkrip mahasiswa.

### Babak 4: Student Hub & Fitur Unggulan Role Switcher (Menit 09:00 – 13:00)
7. **Login:** Logout, lalu klik tombol instan **Alex Chandra** (`student.alex@uir.ac.id`).
8. **Demonstrasi Role Switcher:**
   - Tunjukkan bahwa Alex login sebagai **Student**.
   - Buka dropdown **Role Switcher** di navbar kanan atas.
   - Ubah peran menjadi **UKM Admin (UKM Robotics Club)**.
   - Tunjukkan perubahan instan pada antarmuka: Sidebar berubah menjadi *Manage Events, QR Attendance Scanner, My Organization*, dan dashboard menyesuaikan tanpa logout.
   - Kembalikan peran ke **Student**.
9. **Demonstrasi Peminjaman Alat Lab (`/facilities`):**
   - Cari alat (contoh: *Sony Alpha 7 IV Camera*).
   - Klik **Borrow Item**, masukkan tanggal dan keperluan riset, lalu klik Submit.
   - Tunjukkan permohonan berstatus **Pending** di menu `/borrowings`.

### Babak 5: Persetujuan Peminjaman & Pemulihan Stok (Menit 13:00 – 16:00)
10. **Login:** Masuk sebagai Admin Jurusan (`dept.ti@uir.ac.id`).
11. **Poin Penjelasan:**
    - Buka menu **Borrowing Approvals** (`/borrowings`).
    - Setujui permohonan Alex (*Approve*), lalu catat pengambilan (*Record Pickup*).
    - Lakukan pengembalian (*Record Return*), pilih kondisi **Good Condition**.
    - Buka menu `/facilities`, tunjukkan bahwa stok alat otomatis pulih dan bertambah 1 unit secara aman (*transaction-safe*).

### Babak 6: Tiket Event Digital & Scanner Presensi QR (Menit 16:00 – 19:00)
12. **Login:** Masuk kembali sebagai **Alex Chandra** (`student.alex@uir.ac.id`).
    - Buka menu **Events & Tickets** (`/events`).
    - Daftar pada event *National AI & Robotics Hackathon 2026*.
    - Buka tab **My Digital Tickets**: Tunjukkan tiket ber-QR code dan salin kode tiket (`TCK-XXXXXXXX`).
13. **Login:** Masuk sebagai **UKM Admin** (`ukm.robotics@uir.ac.id`).
    - Buka menu **QR Ticket Scanner** (`/scanner`).
    - Tempelkan kode tiket di kolom manual barcode, klik **Verify & Check-In**.
    - Tunjukkan kartu hijau konfirmasi kehadiran.
    - **Demonstrasikan Anti-Duplikasi:** Klik tombol check-in sekali lagi, tunjukkan alert merah: `DUPLICATE CHECK-IN PREVENTED`.

### Babak 7: Verifikasi Sertifikat Publik & Ekspor Portofolio PDF (Menit 19:00 – 22:00)
14. **Verifikasi Publik Tanpa Login:**
    - Buka tab baru di browser: `http://127.0.0.1:5173/verify`.
    - Masukkan kode demo: `CERT-UIR-2025-0892`.
    - Klik **Verify Credential**: Tunjukkan hasil verifikasi resmi yang menampilkan nama penerima (*Alex Chandra*), predikat, dan hash SHA-256 tanpa perlu login.
15. **Ekspor Portofolio PDF:**
    - Pada sesi Alex, buka menu **Activity Portfolio** (`/portfolio`).
    - Klik tombol **Export Official PDF**.
    - Tunjukkan bahwa berkas PDF resume SKPI berhasil di-download dan dibuka langsung.

### Babak 8: Penutup & Tanya Jawab (Menit 22:00 – 25:00)
16. **Kesimpulan:**
    - CampusConnect telah memenuhi standar Rekayasa Perangkat Lunak: arsitektur bersih, database relasional kuat, keamanan multi-tenant, dan antarmuka responsif siap pakai.
    - Buka sesi tanya jawab dengan penguji.

---

## 4. Cara Cepat Reset Data Demo Setelah Sesi Pengujian

Jika sesi pengujian mengubah data atau kuota tiket dan Anda ingin mengembalikan kondisi data awal seperti semula:

Buka terminal di folder backend dan jalankan perintah:
```powershell
cd c:\xampp\htdocs\CampusConnect\backend
php artisan app:reset-demo
```
Perintah ini akan secara otomatis menyegarkan migrasi dan menginisialisasi ulang seluruh data demo realistis.
