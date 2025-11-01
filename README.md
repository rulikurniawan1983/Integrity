# SLIDER
## Sistem Layanan Integrasi Data Edukasi Realtime
### Dinas Perikanan dan Peternakan Kabupaten Bogor

Platform layanan terintegrasi dengan desain modern (referensi Halodoc) untuk memberikan akses konsultasi, edukasi, dan rekomendasi praktek dokter hewan serta nomor kontrol veteriner terkait perikanan dan peternakan di Kabupaten Bogor.

**Copyright © Ruli Kurniawan, S.Pt**

## 🚀 Features

### Untuk Masyarakat
- **Konsultasi Online** - Chat realtime dengan dokter hewan dan paramedik veteriner yang tersedia online
- **Edukasi & Artikel Kesehatan Hewan** - Artikel edukatif tentang kesehatan hewan, penyakit, pencegahan, dan penanganan
- **Layanan Klinik** - Booking pemeriksaan, vaksinasi, dan pengobatan hewan di Klinik Dinas dan 6 UPT Puskeswan
- **Layanan Rekomendasi** - Rekomendasi Praktek Dokter Hewan (sesuai Permentan 3/2019) dan Rekomendasi Nomor Kontrol Veteriner (sesuai OSS)
- **Tracking Layanan** - Lacak status permohonan layanan dengan kode tracking
- **Map & Navigasi** - Peta lokasi klinik dan puskeswan dengan fitur navigasi Google Maps
- **Review & Rating** - Ulasan dan rating layanan (dengan sistem approval admin)

### Untuk Admin & Staff
- **Dashboard** - Statistik permohonan, ulasan pending, dan quick actions
- **Login System** - Autentikasi dengan bcrypt password hashing
- **Review Approval** - Sistem persetujuan ulasan sebelum ditampilkan
- **Online Status** - Status online/offline untuk staff konsultasi

## 🛠 Tech Stack

- **Frontend**: Next.js 15.5.6, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (untuk chat dan status online)
- **Authentication**: bcryptjs untuk password hashing
- **PDF Generation**: jsPDF untuk template dokumen
- **Maps**: Google Maps API untuk navigasi
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 22+
- npm atau yarn
- Akun Supabase dengan project setup
- Google Maps API key (opsional, untuk navigasi)

## 🔧 Setup Development

### 1. Clone Repository

```bash
git clone https://github.com/rulikurniawan1983/Integrity.git
cd Integrity
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

Database schema dibuat melalui Supabase MCP migrations. Tabel utama:

- `clinics` - Data klinik Dinas dan 6 UPT Puskeswan
- `staff_users` - Data dokter hewan dan paramedik veteriner (hanya 2 role ini)
- `service_requests` - Permohonan layanan klinik
- `recommendation_requests` - Permohonan rekomendasi (praktek & NKV)
- `consultations` - Konsultasi online
- `consultation_messages` - Chat konsultasi dengan upload gambar
- `telemedicine_appointments` - Appointment telemedicine
- `educational_content` - Artikel edukasi kesehatan hewan
- `service_reviews` - Ulasan pengguna (dengan approval)
- `tracking_codes` - Kode tracking untuk semua layanan

### 5. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 6. Build Production

```bash
npm run build
npm start
```

## 📊 Database Schema

### Core Tables
- `clinics` - Klinik Dinas + 6 UPT Puskeswan
- `staff_users` - Dokter Hewan dan Paramedik Veteriner (role terbatas)
- `service_requests` - Permohonan layanan klinik dengan multiple animals
- `recommendation_requests` - Rekomendasi praktek dokter hewan & NKV
- `service_animals` - Data hewan per permohonan (multiple)
- `service_reviews` - Ulasan dengan approval system

### Realtime Features
- `consultations` - Konsultasi online
- `consultation_messages` - Chat realtime dengan image upload
- `telemedicine_appointments` - Appointment system

### Content
- `educational_content` - Artikel kesehatan hewan (kategori: kesehatan_hewan)
- `service_reviews` - Review & rating (approved only)

### Tracking
- Tracking codes untuk semua layanan (format: SRV-xxxxx, REK-xxxxx)

## 🌐 Pages

### Public Pages
- `/` - Homepage dengan service cards, map lokasi, dan review section
- `/konsultasi` - Konsultasi online dengan daftar staff (list format), online status, chat & appointment
- `/edukasi` - Artikel kesehatan hewan (kategori: kesehatan_hewan)
- `/edukasi/[slug]` - Detail artikel
- `/layanan` - Form layanan klinik dengan multiple animals, owner info (kecamatan/desa Kab. Bogor)
- `/layanan-rekomendasi` - Form rekomendasi praktek dokter hewan & NKV dengan PDF templates
- `/tracking` - Tracking universal untuk semua jenis layanan
- `/login` - Halaman login admin & staff

### Admin/Staff Pages
- `/dashboard` - Dashboard dengan statistik dan quick actions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Login dengan verifikasi password bcrypt

### Applications
- `GET /api/applications/stats` - Statistik aplikasi
- `GET /api/applications/recent` - Aplikasi terbaru

### Telemedicine
- `POST /api/telemedicine/chat/send` - Kirim chat message
- `GET /api/telemedicine/chat/messages` - Ambil chat messages
- `POST /api/telemedicine/chat/read` - Tandai pesan sebagai dibaca
- `GET /api/telemedicine/chat/typing` - Status typing

### Pelayanan & Rekomendasi
- `GET /api/pelayanan-pending` - Permohonan pending
- `GET /api/pelayanan-tindaklanjut` - Tindak lanjut pelayanan
- `GET /api/rekomendasi-pending` - Rekomendasi pending
- `GET /api/rekomendasi-tindaklanjut` - Tindak lanjut rekomendasi

### Notifications
- `POST /api/notify` - Send email notifications

## 🔐 Authentication

### Login System
- **Method**: Username & Password dengan bcrypt hashing
- **Session**: localStorage (client-side)
- **API Route**: `/api/auth/login` (server-side verification)

### User Roles
- **Dokter Hewan** - Staff untuk konsultasi dan layanan
- **Paramedik Veteriner** - Staff untuk konsultasi dan layanan
- **Admin** - Admin klinik untuk dashboard dan approval

## 🗺️ Fitur Map & Navigasi

- Peta lokasi Klinik Dinas dan 6 UPT Puskeswan
- Geolocation untuk mendeteksi lokasi pengguna
- Tombol navigasi Google Maps untuk setiap klinik
- Integrasi dengan Google Maps Directions API

## ⭐ Fitur Review & Rating

- Form review dengan rating bintang (1-5)
- Sistem approval admin sebelum review ditampilkan
- Review ditampilkan di homepage dengan filter approved only
- Support multiple service types (klinik, konsultasi, rekomendasi)

## 💬 Konsultasi Online

- Daftar staff dalam format list dengan foto profil prominent
- Status online/offline realtime dengan Supabase Realtime
- Chat button hanya aktif saat staff online
- Chat dengan upload gambar
- Appointment booking
- Real-time message updates

## 📝 Form Layanan

### Layanan Klinik
- Multiple animals support
- Owner information (nama, kecamatan, desa)
- Dynamic dropdown kecamatan/desa Kabupaten Bogor (sesuai BPS)
- Animal details: jenis, kelamin, umur, keluhan
- Appointment time: 08:00-15:00
- Tracking code setelah submit

### Layanan Rekomendasi
- **Rekomendasi Praktek Dokter Hewan**: 
  - Sesuai Permentan 3/2019
  - Informasi pribadi, pendidikan, kegiatan usaha (PBUMKU)
  - Upload dokumen (surat permohonan, ijazah, STR, dll)
  - PDF template surat permohonan
  
- **Rekomendasi Nomor Kontrol Veteriner**:
  - Sesuai OSS
  - Data pelaku usaha, penanggung jawab
  - KBLI dropdown dengan auto-description
  - Upload dokumen lengkap
  - PDF templates (surat permohonan & dokumen teknis)

## 🎨 Design

Aplikasi menggunakan desain modern dengan referensi Halodoc:
- Clean, modern UI dengan gradient colors (blue to green)
- Responsive design untuk mobile dan desktop
- Service cards dengan hover effects
- Interactive maps dengan Google Maps
- Real-time status indicators
- Review cards dengan star ratings
- Modal forms untuk chat dan appointment

## 📦 Dependencies

### Core
- `next`: ^15.1.5
- `react`: ^18.3.1
- `typescript`: ^5.2.0

### UI & Styling
- `tailwindcss`: ^3.3.0
- `react-hot-toast`: ^2.4.1

### Database & Backend
- `@supabase/supabase-js`: ^2.38.0
- `bcryptjs`: Untuk password hashing

### PDF Generation
- `jspdf`: ^3.0.3
- `jspdf-autotable`: ^5.0.2

### Utilities
- `date-fns`: ^2.30.0
- `react-hook-form`: ^7.47.0

## 🚀 Deployment

### Quick Deploy ke Vercel

#### Cara 1: Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**: https://vercel.com/login
2. **Import Project**: 
   - Klik "Add New..." → "Project"
   - Import dari GitHub: `rulikurniawan1983/Integrity`
3. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. **Deploy**: Klik "Deploy" dan tunggu build selesai

#### Cara 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

**Catatan**: Environment variables harus di-set di Vercel Dashboard.

### Environment Variables (Production)

Tambahkan di Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Pilih**: Production, Preview, Development (untuk semua environment)

### Auto Deploy

Setelah setup pertama kali:
- ✅ Setiap push ke `main` → Auto deploy ke **Production**
- ✅ Setiap push ke branch lain → Auto deploy sebagai **Preview**

### Dokumentasi Lengkap

Lihat file **[DEPLOYMENT.md](./DEPLOYMENT.md)** untuk panduan lengkap deployment, troubleshooting, dan best practices.

## 📞 Kontak

- **Alamat**: Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat
- **Email**: diskanak@bogorkab.go.id
- **Telepon**: (021) 8765311
- **Developer**: Ruli Kurniawan, S.Pt

## 📄 License

Copyright © 2024 Dinas Perikanan dan Peternakan Kabupaten Bogor. All rights reserved.
Copyright © Ruli Kurniawan, S.Pt

---

**Version**: 1.0.0  
**Last Updated**: November 2024
