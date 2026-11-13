# PANDUAN PRESENTASI & DEMO TERPADU — CAMPUSCONNECT ADVANCED

**Tagline**: *One Platform, Every Campus, Connected.*  
**Target Audiens**: Pimpinan Perguruan Tinggi, Rektorat, Dekanat, BEM, Investor EdTech, dan Penguji Evaluasi Sistem.

Dokumen ini memandu Anda melakukan demonstrasi interaktif seluruh modul baru CampusConnect dari awal hingga akhir dengan narasi profesional dan alur operasional yang meyakinkan.

---

## 1. Akun Demonstrasi Siap Pakai

Gunakan kredensial berikut untuk menguji berbagai sudut pandang peran (*role*):

| Role | Email Login | Password | Fokus Demo |
|---|---|---|---|
| **Super Admin** | `superadmin@campusconnect.id` | `password` | Tata kelola lintas kampus, Pusat Moderasi Konten, Analitik Global, Audit Logs |
| **Campus Admin (PNL)** | `admin@pnl.ac.id` | `password` | Manajemen Peta Kampus, Manajemen Perpustakaan, Approval Event, Moderasi Kampus |
| **Dosen / Kaprodi** | `dosen@pnl.ac.id` | `password` | Bimbingan Akademik Mahasiswa, Upload Versi Dokumen, Diskusi |
| **Mahasiswa Aktif** | `mahasiswa@pnl.ac.id` | `password` | Progress Akademik (KHS), Karier & Lamaran Magang, Pinjam Buku, Social Feed |

*Catatan: Anda juga dapat menggunakan tombol cepat **Role Switcher** di bilah atas (Navbar) kapan saja tanpa perlu logout.*

---

## 2. Alur Golden Demo (Rekomendasi 10 Menit)

### Babak 1: Linimasa Sosial & Keamanan Civitas (Campus Social Hub & Moderation)
1. **Buka menu Campus Feed (`/feed`)**:
   - Tunjukkan linimasa kampus modern bergaya microblogging (For You, Following, Trending Kampus 🔥, Tersimpan).
   - Tunjukkan widget **Trending Topik Kampus** yang diperbarui secara dinamis dari tagar terpopuler.
   - Buat postingan baru dengan foto dari galeri HP/laptop via tombol unggah terpadu.
   - Klik ikon **Bookmark** untuk menyimpan postingan ke tab "Tersimpan".
   - Tunjukkan postingan yang diedit memiliki penanda waktu `(diedit)`.
2. **Uji Fitur Pelaporan Konten (Community Safety)**:
   - Pada postingan pengguna lain, klik ikon bendera (**Laporkan Konten**).
   - Pilih kategori (misal: *Harassment* atau *Spam*) dan tulis alasan laporan.
   - Ganti peran ke **Campus Admin** via Role Switcher, lalu buka menu **Pusat Moderasi Konten (`/moderation`)**.
   - Tunjukkan tiket laporan masuk secara real-time. Klik **Tindak Lanjuti** $\rightarrow$ pilih aksi *Sembunyikan Konten* $\rightarrow$ postingan seketika hilang dari linimasa publik.

---

### Babak 2: Akademik Pintar & Navigasi Kampus (Academic Progress & Smart Map)
3. **Buka menu Progress Akademik (`/academic-progress`)**:
   - Tunjukkan metrik IPK Kumulatif (3.84), total 108 / 144 SKS lulus (75%), dan persentase kehadiran (94.2%).
   - Tunjukkan grafik interaktif performa IPS semester demi semester.
   - Tinjau matakuliah semester aktif dan transkrip nilai KHS.
   - Sorot **Label Simulasi Akademik** sebagai wujud transparansi dan kepatuhan integritas data.
   - Klik tombol **Cetak Ringkasan KHS** untuk memperlihatkan lembar cetak siap pakai.
4. **Buka menu Smart Campus Map (`/campus-map`)**:
   - Tunjukkan peta interaktif kampus berbasis Leaflet OpenStreetMap dengan titik koordinat presisi.
   - Filter lokasi berdasarkan kategori: *Fakultas*, *Perpustakaan*, *Laboratorium*, *Kantin*, *Parkir*.
   - Klik salah satu pin gedung (misal: *Gedung Utama Rektorat* atau *Laboratorium Komputer*) untuk menampilkan foto gedung, deskripsi, dan jam buka.
   - (Sebagai Admin): Tunjukkan form tambah titik lokasi kampus baru dengan input koordinat dan foto fasilitas.

---

### Babak 3: Pusat Karier, Magang & Perpustakaan Digital
5. **Buka menu Pusat Karier & Magang (`/career-center`)**:
   - Eksplorasi katalog lowongan magang industri, lowongan fresh graduate, beasiswa, dan hackathon.
   - Filter lowongan berdasarkan jenis kerja (Remote / Onsite / Hybrid).
   - Klik salah satu lowongan $\rightarrow$ klik **Lamar Posisi Ini**.
   - Lampirkan berkas CV (PDF), tautan portofolio GitHub/LinkedIn, dan surat pengantar singkat.
   - Buka tab **Lamaran Saya** untuk menunjukkan pelacakan status lamaran (*Submitted* $\rightarrow$ *Under Review* $\rightarrow$ *Accepted*).
6. **Buka menu Perpustakaan Digital (`/digital-library`)**:
   - Tunjukkan katalog koleksi buku akademik, jurnal, dan skripsi beserta indikator stok fisik yang tersedia.
   - Klik tombol **Pinjam Buku** $\rightarrow$ sistem otomatis menerbitkan bukti peminjaman dengan jatuh tempo 14 hari ke depan.
   - Buka tab **Koleksi Saya (My Loans)** untuk melihat daftar buku pinjaman aktif dan tombol pengembalian buku (dilengkapi perhitungan denda keterlambatan otomatis Rp 1.000 / hari).

---

### Babak 4: Pencarian Global, Organisasi & Privasi
7. **Uji Mesin Pencarian Global (`/search`)**:
   - Ketik kata kunci (misal: `"informatika"`, `"robotik"`, atau nama mahasiswa) di search bar Navbar.
   - Tunjukkan pencarian komprehensif yang serentak memindai 9 kategori entitas (Pengguna, Postingan, Event, Organisasi, Dokumen, Fasilitas, Karier, Perpustakaan, Pengumuman).
8. **Buka menu Organisasi Mahasiswa (`/organizations`)**:
   - Buka detail salah satu UKM/HIMA.
   - Buka tab **Program Kerja (Proker)** untuk memantau status eksekusi kegiatan tahunan.
   - Buka tab **Laporan Keuangan & Kas** untuk melihat transparansi pembukuan kas masuk, keluar, dan saldo akhir.
9. **Buka menu Pengaturan Privasi & Keamanan (`/settings/privacy`)**:
   - Tunjukkan kontrol fleksibel visibilitas profil dan izin pengiriman pesan privat (DM).
   - Atur preferensi notifikasi per kategori aktivitas.
   - Kelola daftar pengguna yang diblokir (*Unblock* instan).

---

## 3. Pesan Penutup Demonstrasi

> *"Dengan penambahan 10 pilar fitur ini, CampusConnect bukan lagi sekadar sistem portal informasi statis, melainkan sebuah super-app ekosistem perguruan tinggi modern yang terintegrasi secara holistik — menghubungkan kehidupan akademik, riset, pengembangan karier, aktivitas kemahasiswaan, dan keselamatan komunitas digital dalam satu genggaman."*

