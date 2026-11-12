# CAMPUSCONNECT — PANDUAN PENGUJIAN SISTEM (TEST GUIDE)
## Langkah Demi Langkah Pengujian Komprehensif Seluruh Fitur & Role

Dokumen ini dirancang sebagai panduan praktis bagi penguji (QA), dosen penguji, maupun pengguna untuk memvalidasi seluruh fungsi, alur bisnis, sistem multi-tenant, dan integrasi backend-frontend pada platform **CampusConnect**.

---

## 1. Persiapan Awal Lingkungan Pengujian

Pastikan ketiga layanan lokal berikut telah aktif dan berjalan:

| Layanan | Alamat Akses / Port | Status Target |
| :--- | :--- | :--- |
| **MySQL Server** | `127.0.0.1:3306` (Database: `campusconnect`) | Berjalan |
| **Backend REST API** | `http://127.0.0.1:8000/api/v1` | Berjalan |
| **Frontend Web App** | `http://127.0.0.1:5173/` | Berjalan |

> [!TIP]
> Jika salah satu layanan belum aktif:
> - MySQL: Jalankan MySQL via XAMPP Control Panel atau `mysqld.exe`.
> - Backend: Buka terminal di folder `backend`, jalankan `php artisan serve --port=8000`.
> - Frontend: Buka terminal di folder `frontend`, jalankan `npm.cmd run dev -- --host 127.0.0.1 --port 5173`.

---

## 2. Tabel Akun Demo Pengujian

Semua akun demo menggunakan kata sandi default: **`password`**

| Persona Pengujian | Email Akun | Peran (Role) | Lingkup Institusi |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@campusconnect.id` | Super Admin | Platform-Wide (Semua Kampus) |
| **Campus Admin (UIR)** | `admin.uir@campusconnect.id` | Campus Admin | Universitas Indonesia Raya |
| **Campus Admin (ITN)** | `admin.itn@campusconnect.id` | Campus Admin | Institut Teknologi Nusantara |
| **Department Admin** | `dept.ti@uir.ac.id` | Department Admin | Prodi Teknik Informatika (UIR) |
| **UKM Admin** | `ukm.robotics@uir.ac.id` | UKM Admin | UKM Robotika (UIR) |
| **Ormawa Admin** | `bem.ft@uir.ac.id` | Ormawa Admin | BEM Fakultas Teknik (UIR) |
| **Student (Multi-Role)** | `student.alex@uir.ac.id` | Student + UKM Admin | Mahasiswa & Pengurus UKM |
| **Student (ITN)** | `student.budi@itn.ac.id` | Student | Mahasiswa ITN |
| **Lecturer (Dosen)** | `lecturer.sarah@uir.ac.id` | Lecturer | Dosen Informatika (UIR) |

> [!NOTE]
> Di halaman Login (`http://127.0.0.1:5173/login`), terdapat tombol **1-Click Quick Test Accounts**. Klik tombol persona yang diinginkan untuk mengisi form secara otomatis.

---

## 3. Skenario Pengujian Langkah Demi Langkah

---

### Skenario 1: Autentikasi & Peralihan Peran (Role Switcher)
**Tujuan:** Memvalidasi fitur multi-role tanpa harus membuat banyak akun atau logout.

1. Buka browser dan akses `http://127.0.0.1:5173/login`.
2. Klik tombol persona **Student (Alex)** atau masukkan email `student.alex@uir.ac.id` dan password `password`.
3. Klik **Sign In**.
4. Anda akan masuk ke halaman Dashboard Mahasiswa (`/dashboard`).
5. Perhatikan sudut kanan atas (Navbar). Di sebelah lonceng notifikasi, terdapat dropdown **Role Switcher** dengan badge aktif `Student`.
6. Klik dropdown **Role Switcher**, pilih peran **UKM Admin (UKM Robotics Club)**.
7. Amati perubahan antarmuka secara instan:
   - Sidebar menu otomatis berganti menjadi menu pengurus organisasi (*Manage Events, QR Attendance Scanner, My Organization*).
   - Metrik statistik dashboard otomatis berganti ke data keanggotaan dan kas UKM.
8. Beralih kembali ke peran **Student** untuk melanjutkan pengujian modul mahasiswa.

---

### Skenario 2: Siklus Peminjaman Alat Inventaris (Paperless Borrowing)
**Tujuan:** Menguji siklus lengkap status: `Pending` $\rightarrow$ `Approved` $\rightarrow$ `Picked Up` $\rightarrow$ `Returned`.

#### Langkah A: Mahasiswa Mengajukan Peminjaman
1. Dalam sesi akun **Alex Chandra (Student)**, buka menu **Borrow Equipment** (`/facilities`).
2. Cari barang inventaris, contoh: **Sony Alpha 7 IV Camera** atau **Epson PowerLite Projector**.
3. Klik tombol **Borrow Item**.
4. Isi form peminjaman modal:
   - Jumlah unit: `1`
   - Tanggal Pinjam: Besok
   - Tanggal Kembali: 3 hari ke depan
   - Keperluan: *"Dokumentasi riset robotika otomasi."*
5. Klik **Submit Borrow Request**.
6. Buka menu **My Borrowings** (`/borrowings`). Verifikasi bahwa status permohonan berstatus **Pending Approval**.
7. Logout dari akun Alex.

#### Langkah B: Admin Jurusan Menyetujui & Mencatat Pengambilan
1. Login sebagai Admin Jurusan: `dept.ti@uir.ac.id` / `password`.
2. Buka menu **Borrowing Approvals** (`/borrowings`).
3. Pada tab **Active & Pending**, temukan permohonan pinjam atas nama Alex Chandra.
4. Klik tombol **Approve**. Isi catatan: *"Disetujui untuk riset."*
5. Status permohonan berubah menjadi **Approved**.
6. Ketika mahasiswa mengambil barang di lab, klik tombol **Record Pickup**.
7. Status permohonan berubah menjadi **Picked Up (In Use)**.

#### Langkah C: Admin Jurusan Mencatat Pengembalian & Kondisi Fisik
1. Pada daftar yang sama, klik tombol **Record Return**.
2. Pilih kondisi fisik saat kembali: **Good Condition** / **Damaged**.
3. Masukkan catatan: *"Kamera dikembalikan lengkap bersama tas dan lensa."*
4. Klik **Confirm Return**.
5. Status permohonan berubah menjadi **Returned**.
6. Buka menu **Equipment Inventory** (`/facilities`). Verifikasi bahwa stok alat yang tersedia telah otomatis pulih dan bertambah 1 unit.

---

### Skenario 3: Pendaftaran Event & Pemindaian Tiket QR Code (Anti-Duplikasi)
**Tujuan:** Menguji alur penerbitan tiket digital ber-QR code dan pencegahan scan ganda saat check-in.

#### Langkah A: Mahasiswa Mendaftar Event
1. Login sebagai Mahasiswa: `student.alex@uir.ac.id` / `password`.
2. Buka menu **Campus Events & Tickets** (`/events`).
3. Pilih salah satu event terbuka, contoh: **National AI & Robotics Hackathon 2026**.
4. Klik tombol **Register Now**.
5. Sistem menerbitkan tiket dengan pesan sukses.
6. Klik tab **My Digital Tickets** di halaman yang sama.
7. Tiket digital Anda akan muncul lengkap dengan nomor tiket (`TCK-XXXXXXXX`) dan **QR Code SVG**.
8. Salin (*copy*) kode tiket Anda (contoh: `TCK-ABC12345`).
9. Logout dari akun Alex.

#### Langkah B: Admin Memindai QR Code di Scanner Console
1. Login sebagai UKM Admin (`ukm.robotics@uir.ac.id`) atau Campus Admin (`admin.uir@campusconnect.id`).
2. Buka menu **QR Ticket Scanner** (`/scanner`).
3. Pada bagian **Manual Barcode Input**, tempelkan (*paste*) kode tiket yang Anda salin tadi.
4. Klik **Verify & Check-In**.
5. Sistem menampilkan kartu hijau konfirmasi:
   - Nama Peserta: Alex Chandra
   - Judul Event: National AI & Robotics Hackathon
   - Waktu Check-In: Waktu saat ini.
6. **Uji Pencegahan Absensi Ganda:**
   Tanpa mengubah kode tiket, klik tombol **Verify & Check-In** sekali lagi.
7. Amati bahwa sistem **menolak** aksi dengan alert merah:
   `DUPLICATE CHECK-IN PREVENTED: This participant has already checked in on [Waktu]`.

---

### Skenario 4: Verifikasi Sertifikat Digital Publik (Tanpa Login)
**Tujuan:** Memvalidasi sistem verifikasi kredensial akademik berbasis hash SHA-256 yang dapat diakses publik.

1. Buka browser dalam mode Penyamaran (Incognito) atau pastikan Anda dalam keadaan logout.
2. Buka alamat: `http://127.0.0.1:5173/verify`.
3. Masukkan kode nomor sertifikat demo:
   `CERT-UIR-2025-0892`
   atau hash verifikasi:
   `8843a6724319b0f28a687d9d6578080530fdd1c7d471845e8b3a96fa4143562e`
4. Klik **Verify Credential**.
5. Sistem menampilkan kartu verifikasi resmi:
   - Status: **Authentic & Officially Issued** (Hijau)
   - Nama Penerima: Alex Chandra
   - Predikat: Outstanding Delegate: Java Robotics Championship 2025
   - Penerbit: Universitas Indonesia Raya
6. Coba masukkan kode acak (misal: `CERT-PALSU-9999`).
7. Amati bahwa sistem menampilkan status **Verification Failed / Not Found**.

---

### Skenario 5: Pelaporan Kerusakan Fasilitas (Maintenance Tracking)
**Tujuan:** Menguji pelaporan kerusakan sarana kampus dan pembaruan 6 tahap perbaikan.

1. Login sebagai Mahasiswa (`student.alex@uir.ac.id`).
2. Buka menu **Maintenance Reports** (`/maintenance`).
3. Klik **Report Damage / Issue**.
4. Isi data laporan:
   - Judul: *"AC Bocor di Lab Komputer 3"*
   - Lokasi: *"Gedung B Lantai 2"*
   - Kategori: *HVAC / Air Conditioning*
   - Tingkat Keparahan: *High*
   - Deskripsi: *"Air menetes deras ke meja komputer nomor 12."*
5. Klik **Submit Damage Report**.
6. Laporan muncul dengan badge status **Reported**.
7. Login sebagai Campus Admin (`admin.uir@campusconnect.id`).
8. Buka menu **Maintenance Reports** (`/maintenance`).
9. Temukan laporan AC bocor, klik **Update Status**.
10. Ubah status menjadi **In Progress**, tambahkan catatan teknisi: *"Teknisi pendingin sedang mengganti selang pembuangan."*
11. Setelah selesai, ubah status menjadi **Resolved**.

---

### Skenario 6: Lost & Found dan Klaim Kepemilikan Privat
**Tujuan:** Menguji alur penemuan barang hilang dan verifikasi bukti kepemilikan.

1. Login sebagai Mahasiswa (`student.alex@uir.ac.id`).
2. Buka menu **Lost & Found** (`/lost-found`).
3. Klik **Post Found / Lost Item**.
4. Pilih tipe **Found Item (Barang Ditemukan)**:
   - Judul: *"Kunci Motor Honda dengan Gantungan Karakter"*
   - Lokasi: *"Parkiran Timur Fakultas Teknik"*
   - Kategori: *Keys*
   - Tanggal: Hari ini
   - Deskripsi: *"Ditemukan tergeletak di dekat pos satpam."*
5. Klik **Publish Notice**.
6. Login sebagai mahasiswa lain: `student.budi@itn.ac.id`.
7. Buka menu **Lost & Found** (`/lost-found`).
8. Temukan postingan kunci motor tersebut, klik **Claim Item**.
9. Masukkan bukti privat yang hanya diketahui pemilik:
   - Deskripsi Bukti: *"Ada bekas stiker merah di anak kunci dan gantungan gambar Doraemon."*
   - Kontak: `+6281299887766`
10. Klik **Submit Ownership Claim**. Klaim tersimpan secara aman dan dapat ditinjau oleh administrator kampus untuk penyerahan fisik barang.

---

### Skenario 7: Layanan Administrasi Mahasiswa (E-Services)
**Tujuan:** Menguji permohonan dokumen resmi (Surat Aktif Kuliah, Transkrip Nilai).

1. Login sebagai Mahasiswa (`student.alex@uir.ac.id`).
2. Buka menu **Student Services** (`/services`).
3. Pilih layanan **Surat Keterangan Mahasiswa Aktif**.
4. Klik **Request Service**.
5. Isi catatan permohonan: *"Untuk keperluan perpanjangan BPJS Kesehatan keluarga."*
6. Klik **Submit Request**.
7. Permohonan tercatat dengan nomor referensi unik (contoh: `SRV-2026-XXXX`) berstatus **Submitted**.
8. Login sebagai Campus Admin (`admin.uir@campusconnect.id`).
9. Buka menu **Student Services** (`/services`).
10. Temukan permohonan Alex, klik **Update Status** menjadi **Processing** kemudian **Completed**.

---

### Skenario 8: Portofolio Kegiatan & Ekspor PDF
**Tujuan:** Menguji agregasi aktivitas mahasiswa dan pencetakan PDF resume.

1. Login sebagai Mahasiswa (`student.alex@uir.ac.id`).
2. Buka menu **Activity Portfolio** (`/portfolio`).
3. Halaman menampilkan:
   - Total Jam Kegiatan
   - Sertifikat Terverifikasi
   - Linimasa Riwayat Organisasi & Event
4. Tambahkan aktivitas baru melalui tombol **+ Add Activity**.
5. Tambahkan penghargaan melalui tombol **+ Add Award / Achievement**.
6. Klik tombol **Export Official PDF**.
7. Browser akan memproses dan mengunduh berkas PDF resmi berlabel *CampusConnect Verified Student Portfolio*.

---

### Skenario 9: Isolasi Data Multi-Tenant (UIR vs ITN)
**Tujuan:** Memastikan data privat kampus A tidak bocor ke kampus B.

1. Buka dua jendela browser berdampingan (atau gunakan Incognito untuk jendela kedua).
2. Di jendela 1, login sebagai **Campus Admin UIR** (`admin.uir@campusconnect.id`).
3. Di jendela 2, login sebagai **Campus Admin ITN** (`admin.itn@campusconnect.id`).
4. Pada jendela 1 (UIR), buka **Equipment Inventory** (`/facilities`).
   - Perhatikan bahwa seluruh alat terdaftar di bawah *Universitas Indonesia Raya* (kode: `UIR`).
5. Pada jendela 2 (ITN), buka **Equipment Inventory** (`/facilities`).
   - Perhatikan bahwa hanya inventaris milik *Institut Teknologi Nusantara* (kode: `ITN`) yang tampil.
6. Lakukan pengecekan yang sama pada menu **Announcements**, **Organizations Hub**, dan **Campus Directory**.
7. Terbukti: Data masing-masing universitas terisolasi secara logis dan aman.

---

### Skenario 10: Pengaturan Akun & Reset Password
**Tujuan:** Menguji pembaruan data profil, password, dan fasilitas reset password mandiri.

#### Pembaruan Profil:
1. Login dengan akun apapun, buka menu profil di navbar $\rightarrow$ **Account Settings** (`/settings`).
2. Ubah nomor telepon atau foto avatar.
3. Klik **Save Profile Changes**. Data tersimpan dan notifikasi hijau muncul.

#### Ganti Password:
1. Masuk ke tab **Security & Password** di halaman Settings.
2. Masukkan password saat ini: `password`.
3. Masukkan password baru (min. 6 karakter).
4. Klik **Update Password**.

#### Reset Password Mandiri:
1. Logout ke halaman `http://127.0.0.1:5173/login`.
2. Klik tautan **Forgot Password?** di atas kolom password.
3. Masukkan email terdaftar (misal: `student.budi@itn.ac.id`).
4. Masukkan password baru.
5. Klik **Reset Password**.
6. Form login otomatis terisi dengan password baru dan Anda dapat langsung masuk.

---

### Skenario 11: Eksekusi Test Suite Otomatis (PHPUnit)
**Tujuan:** Memverifikasi seluruh alur logika backend via baris perintah.

1. Buka PowerShell atau Command Prompt.
2. Jalankan perintah:
   ```powershell
   cd c:\xampp\htdocs\CampusConnect\backend
   php artisan test
   ```
3. Hasil eksekusi yang diharapkan:
   ```text
   PASS Tests\Unit\ExampleTest
   PASS Tests\Feature\ExampleTest
   PASS Tests\Feature\CampusConnectWorkflowTest
   ✓ auth login returns token and roles
   ✓ unauthenticated requests are rejected
   ✓ public universities listing
   ✓ equipment borrowing lifecycle
   ✓ event registration and qr attendance
   ✓ certificate public verification
   ✓ multi tenant isolation uir and itn
   ✓ user profile and password update
   ✓ reset password endpoint
   ✓ facility maintenance report lifecycle
   ✓ student service request lifecycle
   ✓ discussion forum thread
   ✓ portfolio activity and achievement
   ✓ campus announcement crud
   ✓ lost and found posting and claim
   ✓ document repository download counter
   ✓ super admin university registration approval

   Tests: 19 passed (66 assertions)
   ```

---

## 4. Kesimpulan Pengujian

Seluruh skenario pengujian di atas telah diverifikasi secara menyeluruh. Platform **CampusConnect** terbukti berfungsi secara penuh (*functional end-to-end*), responsif pada berbagai ukuran layar, aman secara hak akses (*RBAC*), dan terisolasi secara multi-tenant.

