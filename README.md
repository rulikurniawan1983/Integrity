# SLIDER
## Sistem Layanan Integrasi Data Edukasi Realtime
### Dinas Perikanan dan Peternakan Kabupaten Bogor

Platform layanan terintegrasi dengan desain modern (referensi Halodoc) untuk memberikan akses konsultasi, edukasi, dan data realtime terkait perikanan dan peternakan di Kabupaten Bogor.

**Copyright © Ruli Kurniawan, S.Pt**

## 🚀 Features

### Untuk Masyarakat
- **Konsultasi Online** - Chat dengan ahli perikanan dan peternakan secara realtime
- **Edukasi Gratis** - Artikel, video, infografik, dan konten edukatif
- **Layanan Klinik** - Booking pemeriksaan, vaksinasi, dan pengobatan hewan
- **Layanan Rekomendasi** - Informasi harga pasar, produksi, dan data realtime
- **Tracking Layanan** - Lacak status permohonan layanan Anda

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 22+
- npm atau yarn
- Akun Supabase

## 🔧 Setup Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Schema

Database schema sudah dibuat melalui migration. Untuk melihat struktur:
- Gunakan MCP Supabase tools
- Atau buka Supabase Dashboard > Database

### 4. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📊 Database Schema

Database memiliki tabel-tabel berikut:
- `clinics` - Data klinik dan UPT
- `staff_users` - Data staff/admin
- `public_users` - Data pengguna masyarakat
- `consultations` - Konsultasi online
- `consultation_messages` - Chat konsultasi
- `educational_content` - Konten edukasi
- `realtime_data` - Data realtime
- `service_requests` - Permohonan layanan
- `animals` - Data hewan
- `notifications` - Notifikasi

## 🌐 Pages

- `/` - Homepage dengan desain Halodoc
- `/konsultasi` - Konsultasi online (TODO)
- `/edukasi` - Halaman edukasi (TODO)
- `/layanan` - Layanan klinik (TODO)
- `/layanan-rekomendasi` - Layanan rekomendasi (TODO)
- `/tracking` - Tracking layanan (TODO)
- `/login` - Login (TODO)
- `/daftar` - Registrasi (TODO)

## 📱 API Endpoints

- `GET /api/stats` - Statistik umum

## 🎨 Design

Aplikasi menggunakan desain modern dengan referensi Halodoc:
- Clean, modern UI
- Gradient colors (blue to green)
- Responsive design
- Service cards dengan hover effects
- Hero section dengan CTA

## 📄 License

Copyright © 2024 Dinas Perikanan dan Peternakan Kabupaten Bogor. All rights reserved.
Copyright © Ruli Kurniawan, S.Pt

---

**Version**: 1.0.0  
**Last Updated**: 2024

