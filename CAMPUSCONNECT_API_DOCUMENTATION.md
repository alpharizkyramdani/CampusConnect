# CAMPUSCONNECT — REST API ENDPOINT SPECIFICATION

**Base URL**: `http://127.0.0.1:8000/api/v1`  
**Authentication**: Laravel Sanctum (`Authorization: Bearer <token>`)  
**Format**: `application/json`

Dokumen ini mendokumentasikan spesifikasi teknis endpoint baru yang dibangun untuk mendukung 10 modul ekspansi platform CampusConnect.

---

## 1. Community Safety & Moderasi Konten

### `POST /reports`
Melaporkan konten (postingan, komentar, atau akun pengguna).
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "reportable_type": "post",
    "reportable_id": 45,
    "category": "harassment",
    "reason": "Postingan mengandung ujaran kebencian terhadap kelompok tertentu."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Laporan Anda telah diterima tim pengawas kampus dan akan ditinjau.",
    "data": { "id": 1, "status": "pending" }
  }
  ```

### `GET /moderation/reports`
Mendapatkan antrean laporan masuk (Hanya Super Admin & Campus Admin).
- **Query Params**: `status=pending|under_review|resolved`, `category=...`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "reportable_type": "post",
        "category": "harassment",
        "status": "pending",
        "reporter": { "id": 2, "name": "Budi Santoso" }
      }
    ]
  }
  ```

### `POST /moderation/reports/{id}/resolve`
Menyelesaikan laporan pelanggaran dengan tindakan administratif.
- **Request Body**:
  ```json
  {
    "action": "content_hidden",
    "notes": "Pelanggaran pedoman etika kampus terbukti. Postingan disembunyikan."
  }
  ```

---

## 2. Academic Progress

### `GET /academic-progress`
Mengambil rekap perkembangan akademik mahasiswa (IPK, SKS lulus, riwayat semester, matakuliah aktif).
- **Query Params**: `student_id` (opsional untuk dosen wali/admin)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "student": { "id": 5, "name": "Ahmad Dani", "nim": "2201082001" },
      "cgpa": 3.84,
      "total_credits_taken": 108,
      "total_credits_passed": 108,
      "degree_total_credits": 144,
      "progress_percentage": 75.0,
      "attendance_average": 94.2,
      "remaining_semesters_estimate": 2,
      "is_simulation": true,
      "disclaimer": "Data ini disajikan sebagai simulasi akademik internal CampusConnect.",
      "semesters": [
        {
          "semester_number": 5,
          "gpa": 3.85,
          "courses": [
            { "course_code": "TI301", "course_name": "Rekayasa Perangkat Lunak", "credits": 3, "grade": "A" }
          ]
        }
      ]
    }
  }
  ```

---

## 3. Smart Campus Map

### `GET /campus-map/locations`
Mengambil daftar titik koordinat gedung universitas.
- **Query Params**: `university_id=1`, `category=faculty|library|laboratory`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Gedung Utama Rektorat",
        "category": "general",
        "latitude": 5.118671,
        "longitude": 97.158334,
        "operating_hours": "07:30 - 17:00 WIB",
        "photo_url": "https://..."
      }
    ]
  }
  ```

### `POST /campus-map/locations`
Menambahkan titik koordinat fasilitas kampus baru (Admin only).
- **Request Body**:
  ```json
  {
    "university_id": 1,
    "name": "Gedung Jurusan Teknologi Informasi",
    "category": "department",
    "latitude": 5.119200,
    "longitude": 97.159100,
    "operating_hours": "08:00 - 16:30 WIB",
    "description": "Pusat laboratorium komputer dan perkuliahan TI."
  }
  ```

---

## 4. Career & Internship Center

### `GET /career/opportunities`
Mendapatkan daftar lowongan magang, kerja, dan beasiswa.
- **Query Params**: `type=internship`, `workplace_type=remote`, `search=...`

### `POST /career/opportunities/{id}/apply`
Mengirimkan lamaran magang / pekerjaan.
- **Request Body**:
  ```json
  {
    "cv_url": "http://127.0.0.1:8000/storage/cv_alices.pdf",
    "portfolio_url": "https://github.com/alice",
    "cover_letter": "Saya sangat tertarik untuk berkontribusi sebagai Software Intern..."
  }
  ```

### `POST /career/opportunities/{id}/bookmark`
Menyimpan lowongan ke daftar bookmark pengguna (`is_bookmarked`).

---

## 5. Digital Library

### `GET /library/items`
Mengambil katalog buku dan karya ilmiah.
- **Query Params**: `category=academic_book`, `search=...`

### `POST /library/items/{id}/borrow`
Meminjam buku dengan durasi 14 hari kalender.
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Peminjaman buku berhasil dicatat. Batas pengembalian 14 hari ke depan.",
    "data": {
      "borrowed_at": "2026-11-13T09:00:00Z",
      "due_at": "2026-11-27T09:00:00Z",
      "status": "borrowed"
    }
  }
  ```

### `POST /library/loans/{id}/return`
Mengembalikan buku pinjaman dengan perhitungan denda otomatis jika melewati batas `due_at`.

---

## 6. Global Search

### `GET /search/global`
Melakukan pencarian menyeluruh pada 9 domain data CampusConnect.
- **Query Params**: `q=informatika`, `category=all|users|posts|events|organizations|documents|facilities|careers|library`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "query": "informatika",
    "counts": {
      "users": 3,
      "posts": 1,
      "events": 1,
      "organizations": 1,
      "documents": 1,
      "facilities": 2,
      "careers": 1,
      "library": 2
    },
    "data": {
      "users": [...],
      "events": [...],
      "organizations": [...]
    }
  }
  ```

---

## 7. Campus Social Hub Enhancements

- `POST /feed/{id}/bookmark`: Menandai postingan sebagai tersimpan.
- `GET /feed/saved-posts`: Mengambil daftar postingan yang telah disimpan oleh akun pengguna.
- `PUT /feed/{id}`: Mengubah isi konten status milik sendiri (mencatat `edited_at`).
- `GET /feed-trending`: Mengambil daftar tagar kampus paling populer secara dinamis.

---

## 8. Event, Organisasi & Dokumen Enhancements

- `POST /events/{id}/cancel`: Membatalkan pendaftaran tiket acara.
- `POST /events/{id}/waitlist`: Masuk antrean tunggu saat kuota pendaftaran tiket penuh.
- `GET /organizations/{id}/work-programs`: Mengambil daftar program kerja organisasi.
- `POST /organizations/{id}/work-programs`: Menambahkan program kerja baru.
- `GET /organizations/{id}/finances`: Mengambil laporan rekapitulasi kas (Pemasukan, Pengeluaran, Saldo).
- `POST /organizations/{id}/finances`: Mencatat transaksi kas masuk/keluar.
- `GET /documents/{id}/versions`: Mengambil riwayat rilis revisi dokumen.
- `POST /documents/{id}/versions`: Mengunggah berkas revisi baru (Multipart Form).

---

## 9. Pengaturan Privasi & Keamanan Akun

- `GET /privacy/settings`: Mengambil preferensi privasi akun.
- `PUT /privacy/settings`: Memperbarui hak visibilitas profil, perizinan DM, dan preferensi notifikasi.
- `POST /users/{id}/block`: Memblokir pengguna target.
- `POST /users/{id}/unblock`: Membuka blokir pengguna target.
- `POST /users/{id}/mute`: Membisukan notifikasi dari pengguna target.

