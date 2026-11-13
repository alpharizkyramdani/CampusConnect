# CAMPUSCONNECT — ADVANCED FEATURE EXPANSION ARCHITECTURE

**CampusConnect — One Platform, Every Campus, Connected.**

Dokumen ini mendokumentasikan secara lengkap arsitektur dan kapabilitas 10 fitur ekspansi baru yang telah diintegrasikan secara penuh ke dalam ekosistem web CampusConnect (Laravel REST API + React TypeScript + Tailwind CSS + MySQL).

---

## 1. Modul Community Safety & Content Moderation

Pusat kendali keselamatan dan tata tertib sosial civitas akademika untuk mencegah pelecehan, ujaran kebencian, spam, dan pelanggaran etika kampus.

### Fitur Pengguna
- **Report Konten**: Civitas dapat melaporkan postingan, komentar, atau profil pengguna dengan kategori terstandarisasi (`inappropriate`, `harassment`, `hate_speech`, `spam`, `false_information`, `plagiarism`, `other`) disertai penjelasan rinci.
- **Block & Unblock Pengguna**: Memblokir interaksi dan DM dari pengguna yang tidak diinginkan secara langsung.
- **Mute & Unmute Pengguna**: Menonaktifkan notifikasi dan kebisingan obrolan tanpa memutus hubungan pertemanan.
- **Pengaturan Privasi Profil**: Mengontrol visibilitas profil (`public`, `campus_only`, `private`) dan izin penerimaan pesan privat (`everyone`, `campus_only`, `none`).

### Fitur Moderator & Admin Kampus (`/moderation`)
- **Dashboard Metrik Moderasi**: Menampilkan KPI laporan pending, under review, resolved, dan konten yang telah disembunyikan.
- **Filter Berdasarkan Kategori & Status**: Mempermudah pelacakan laporan berdasarkan tingkat kegentingan.
- **Audit & Penindakan**:
  - `hide_content`: Menyembunyikan postingan/komentar secara instan dari linimasa.
  - `warn_user`: Memberikan catatan peringatan resmi kepada terlapor.
  - `suspend_user`: Membekukan akun terlapor untuk jangka waktu tertentu.
  - `dismiss`: Menolak laporan yang tidak berdasar.
- **Pencatatan Audit Trail**: Setiap tindakan moderator tercatat dalam `audit_logs` universitas.

---

## 2. Modul Academic Progress Dashboard (`/academic-progress`)

Dashboard komprehensif bagi mahasiswa untuk memantau capaian studi, tren IPK, kelulusan SKS, dan riwayat nilai per semester.

### Fitur & Visualisasi
- **KPI Akademik Utama**:
  - IPK Kumulatif (e.g., 3.84)
  - SKS Lulus vs Beban SKS Total (e.g., 108 / 144 SKS, progress 75%)
  - Rata-rata Persentase Kehadiran Kuliah (94.2%)
  - Estimasi Sisa Semester menuju Kelulusan (2 Semester)
- **Grafik Tren IPS Per Semester**: Visualisasi performa akademik dari Semester 1 hingga berjalan.
- **Tabel Transkrip & Riwayat Nilai**: Menampilkan kode matakuliah, SKS, nilai huruf (A, A-, B+), dan status kelulusan.
- **Matakuliah Semester Aktif**: Roster jadwal, ruang kelas, dosen pengampu, dan persentase kehadiran per matakuliah.
- **Fitur Cetak KHS / Transkrip Digital**: Fitur print-ready untuk keperluan beasiswa dan magang.
- **Label Simulasi Akademik**: Transparansi disclaimer bahwa data merupakan simulasi internal kampus sebelum integrasi live API SIAKAD perguruan tinggi.

---

## 3. Modul Smart Campus Map (`/campus-map`)

Peta interaktif kampus berbasis Leaflet & OpenStreetMap untuk navigasi fasilitas, gedung fakultas, laboratorium, dan layanan universitas.

### Fitur Pengguna
- **Peta Multi-Kampus**: Navigasi koordinat presisi tinggi per universitas (koordinat akurat Politeknik Negeri Lhokseumawe, UGM, ITB, UI, dll).
- **Kategorisasi Fasilitas Kampus**:
  - Fakultas & Jurusan (`faculty`)
  - Perpustakaan (`library`)
  - Laboratorium & Riset (`laboratory`)
  - Auditorium & Hall (`auditorium`)
  - Ruang Kuliah (`classroom`)
  - Kantin & Pujasera (`canteen`)
  - Area Parkir (`parking`)
  - Fasilitas Umum & Lapangan Olahraga (`general`)
- **Pencarian Gedung & Fasilitas**: Pencarian instan berdasarkan nama atau lokasi ruangan.
- **Modal Detail Gedung**: Menampilkan foto gedung, jam operasional, kontak informasi, dan tautan petunjuk arah Google Maps.

### Fitur Admin Kampus
- **Form Tambah & Edit Lokasi**: Penambahan titik koordinat Latitude/Longitude, nama gedung, deskripsi, jam buka/tutup, dan foto gedung.
- **Upload Foto Gedung**: Terintegrasi dengan Image Upload Field dari galeri perangkat.

---

## 4. Modul Career & Internship Center (`/career-center`)

Pusat peluang karier dan program magang bersertifikat untuk mahasiswa dan alumni.

### Kategori Peluang
- **Internship (Magang Industri & BUMN)**
- **Full-Time Job (Fresh Graduate)**
- **Part-Time / Student Assistant**
- **Beasiswa Prestasi & Pendidikan**
- **Kompetisi Ilmiah & Hackathon**

### Fitur Mahasiswa
- **Pencarian & Multi-Filter**: Filter berdasarkan tipe peluang, metode kerja (Remote, On-site, Hybrid), dan bidang pekerjaan.
- **Bookmark Peluang**: Menyimpan lowongan favorit ke daftar pantauan.
- **Lamaran Online & Upload CV**: Mengirim berkas lamaran dengan melampirkan berkas CV, portofolio online, dan surat pengantar (cover letter).
- **Pelacakan Status Lamaran**: Pantauan status: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Accepted` / `Rejected` / `Withdrawn`.

### Fitur Admin & Reviewer Kampus
- **Posting Lowongan Baru**: Formulir lengkap dengan logo perusahaan, kualifikasi, rentang gaji, dan tenggat waktu pendaftaran.
- **Review Berkas Pelamar**: Meninjau dokumen CV pelamar secara aman tanpa kebocoran data publik.
- **Update Status Seleksi**: Memperbarui status pelamar dari Under Review menjadi Accepted atau Rejected.

---

## 5. Modul Digital Library (`/digital-library`)

Perpustakaan digital dan repository ilmiah kampus untuk peminjaman koleksi fisik dan akses publikasi digital.

### Fitur Katalog & Koleksi
- **Katalog Terpadu**: Buku Teks Akademik, Jurnal Ilmiah, Skripsi / Tugas Akhir, Modul Praktikum, dan Referensi Umum.
- **Informasi Stok Real-Time**: Status stok tersedia vs sedang dipinjam.
- **Peminjaman Otomatis (14 Hari)**: Tombol "Pinjam Buku" langsung menerbitkan catatan peminjaman dengan batas pengembalian 14 hari ke depan.
- **Pengembalian & Denda Keterlambatan**: Perhitungan denda otomatis Rp 1.000 / hari jika pengembalian melewati batas waktu jatuh tempo.
- **Tab Koleksi Saya (My Loans)**: Mahasiswa dapat memantau koleksi yang sedang dipinjam dan riwayat peminjaman terdahulu.

---

## 6. Modul Advanced Analytics & Reporting (`/analytics`)

Dashboard intelijen data dan performa akademik multi-level.

### Hak Akses & Cakupan
- **Super Admin**: Metrik platform-wide lintas seluruh universitas mitra, tren registrasi, dan distribusi pengguna per role.
- **Campus Admin**: Metrik universitas spesifik (total civitas, statistik peminjaman barang, keterisian acara, utilisasi perpustakaan, laporan pemeliharaan).
- **Department Admin**: Metrik jurusan/prodi spesifik.

### Visualisasi & Fitur Ekspor
- Visualisasi KPI cards, tren bar chart, dan diagram distribusi.
- Filter rentang waktu dan filter universitas tenant.
- Fitur ekspor laporan terpadu ke format CSV/Excel dan Print PDF.

---

## 7. Modul Global Search (`/search`)

Mesin pencari terintegrasi di seluruh entitas CampusConnect.

### Cakupan Pencarian (9 Kategori)
1. **Pengguna & Civitas** (Mahasiswa, Dosen, Admin)
2. **Postingan Timeline** (Status, opini, pengumuman civitas)
3. **Campus Events** (Hackathon, webinar, seminar, workshop)
4. **Organisasi Mahasiswa** (BEM, HIMA, UKM)
5. **Dokumen Akademik** (Pedoman, modul, template surat)
6. **Fasilitas & Inventaris** (Laboratorium, proyektor, kamera)
7. **Peluang Karier & Magang** (Lowongan kerja, beasiswa)
8. **Koleksi Perpustakaan** (Buku teks, karya ilmiah)
9. **Pengumuman Resmi Rektorat**

### Fitur UI/UX
- Shortcut keyboard `/search` dan tombol cepat pada Navbar.
- Tab filter kategori pencarian beserta counter hasil temuan.
- Riwayat pencarian terkini (*Recent Searches*) dan kata kunci rekomendasi (*Suggested Searches*).
- Menghormati isolasi tenant `university_id` dan kebijakan akun terblokir.

---

## 8. Pengembangan Campus Social Hub

Transformasi linimasa sosial menjadi platform komunikasi kampus modern:
- **Bookmark Postingan**: Menyimpan postingan edukatif atau pengumuman ke tab "Tersimpan".
- **Edit Postingan Sendiri**: Fitur ubah konten status dengan penanda riwayat `(diedit)`.
- **Laporkan Postingan**: Integrasi modal pelaporan pelanggaran ke Pusat Moderasi.
- **Trending Topik Kampus**: Menampilkan tagar (#tag) paling ramai dibicarakan secara dinamis dari API.
- **Dukungan Galeri & Foto**: Mengunggah foto dari galeri HP/laptop via ImageUploadField terpadu.

---

## 9. Pengembangan Modul Acara, Organisasi & Dokumen

Peningkatan kapabilitas operasional kampus:
- **Event Cancellation & Waitlist**: Pendaftar tiket acara dapat membatalkan tiket secara mandiri, dan pengguna lain dapat mendaftar ke antrean tunggu (*Waitlist*) ketika kuota penuh.
- **Organisasi Mahasiswa — Program Kerja (Proker)**: Manajemen proker HIMA/UKM lengkap dengan status pelaksanaan, periode, dan target capaian.
- **Organisasi Mahasiswa — Laporan Kas & Finansial**: Rekapitulasi transparansi kas organisasi (Pemasukan, Pengeluaran, Saldo) dan pencatatan buku kas.
- **Document Versioning**: Riwayat versi berkas (v1.0, v1.1, v2.0) dengan audit changelog, berkas terdahulu, dan unggah revisi baru bagi staf fakultas.

---

## 10. Pengaturan Akun & Privasi (`/settings/privacy`)

Pusat kontrol keamanan data pribadi setiap civitas:
- **Kontrol Visibilitas Profil**: Pilihan antara `public`, `campus_only`, dan `private`.
- **Izin Pesan Masuk (DM)**: Mengatur pihak yang dapat memulai percakapan chat.
- **Preferensi Notifikasi Berjenjang**: Pengaturan toggle notifikasi email dan in-app untuk interaksi sosial, pendaftaran acara, persetujuan peminjaman, dan pengumuman kampus.
- **Manajemen Akun Terblokir**: Daftar akun yang diblokir dengan opsi pembukaan blokir (*Unblock*) instan.

