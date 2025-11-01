# Database Setup & Storage Configuration

## Status Database

✅ **Database telah dibersihkan dan disesuaikan dengan aplikasi**

### Tabel yang Dibersihkan (Data dihapus):
- `consultation_messages` - Pesan chat konsultasi
- `consultations` - Data konsultasi online
- `educational_content` - Konten edukasi
- `service_requests` - Permohonan layanan klinik
- `animals` - Data hewan peliharaan
- `webinars` - Data webinar
- `webinar_registrations` - Registrasi webinar
- `notifications` - Notifikasi
- `realtime_data` - Data realtime
- `public_users` - Pengguna masyarakat

### Tabel yang Dipertahankan:
- `clinics` - Data klinik dan puskeswan (7 klinik)
- `staff_users` - Data staff/admin (9 staff)

## Struktur Tabel Penting

### `service_requests`
Tabel untuk permohonan layanan kesehatan hewan di klinik, memiliki kolom:
- `id` - UUID primary key
- `tracking_code` - Kode tracking unik
- `user_id` - ID pengguna (nullable)
- `staff_id` - ID staff yang dipilih (nullable, ditambahkan)
- `clinic_id` - ID klinik yang dipilih (nullable)
- `service_type` - Jenis layanan (pemeriksaan, vaksinasi, pengobatan, konsultasi_lapangan, pelatihan, sertifikasi)
- `status` - Status (pending, confirmed, in_progress, completed, cancelled)
- `appointment_date` - Tanggal janji temu
- `appointment_time` - Waktu janji temu
- `description` - Deskripsi permohonan
- `created_at`, `updated_at` - Timestamps

## Storage Buckets yang Diperlukan

### 1. `consultation-attachments`
**Untuk**: Upload gambar di chat konsultasi

**Setup di Supabase Dashboard**:
1. Buka Storage → New bucket
2. Name: `consultation-attachments`
3. Public bucket: ✅ (Centang)
4. File size limit: 5 MB
5. Allowed MIME types: `image/*`

**Policies**:
```sql
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'consultation-attachments');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'consultation-attachments' 
  AND auth.role() = 'authenticated'
);
```

### 2. `educational-content`
**Untuk**: Thumbnail dan file edukasi (opsional)

**Setup di Supabase Dashboard**:
1. Buka Storage → New bucket
2. Name: `educational-content`
3. Public bucket: ✅ (Centang)
4. File size limit: 10 MB
5. Allowed MIME types: `image/*, video/*`

**Policies**: Sama seperti consultation-attachments

### 3. `service-documents`
**Untuk**: Dokumen dan file permohonan layanan (opsional)

**Setup di Supabase Dashboard**:
1. Buka Storage → New bucket
2. Name: `service-documents`
3. Public bucket: ❌ (Tidak centang, private)
4. File size limit: 10 MB
5. Allowed MIME types: `application/pdf, image/*`

**Policies**: Hanya authenticated users yang dapat upload dan read

## Verifikasi Setup

### Cek Data Klinik dan Staff
```sql
SELECT c.name, c.type, COUNT(s.id) as staff_count
FROM clinics c
LEFT JOIN staff_users s ON s.clinic_id = c.id
GROUP BY c.id, c.name, c.type
ORDER BY c.name;
```

### Cek Kolom staff_id di service_requests
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_requests'
AND column_name = 'staff_id';
```

## Catatan Penting

1. **Kolom `staff_id` sudah ditambahkan** ke tabel `service_requests` untuk memilih staff saat membuat permohonan layanan
2. **Data transaksi sudah dibersihkan** - siap untuk penggunaan baru
3. **Data master (clinics, staff_users) dipertahankan** untuk referensi
4. **Storage buckets perlu dibuat manual** di Supabase Dashboard sesuai kebutuhan aplikasi

## Next Steps

1. ✅ Database sudah dibersihkan
2. ⏳ Setup storage buckets di Supabase Dashboard (jika diperlukan)
3. ⏳ Buat sample data untuk testing (jika diperlukan)

