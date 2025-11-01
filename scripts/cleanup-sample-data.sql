-- Script untuk menghapus data sampel di database
-- Jalankan script ini di Supabase SQL Editor atau via MCP

-- Hapus data dari tabel yang memiliki foreign key terlebih dahulu
-- Urutan penting untuk menghindari constraint violation

-- 1. Hapus service_animals (terkait dengan service_requests)
DELETE FROM public.service_animals;

-- 2. Hapus service_reviews
DELETE FROM public.service_reviews;

-- 3. Hapus consultation_messages (terkait dengan consultations)
DELETE FROM public.consultation_messages;

-- 4. Hapus telemedicine_appointments (terkait dengan consultations)
DELETE FROM public.telemedicine_appointments;

-- 5. Hapus consultations
DELETE FROM public.consultations;

-- 6. Hapus recommendation_requests
DELETE FROM public.recommendation_requests;

-- 7. Hapus service_requests
DELETE FROM public.service_requests;

-- 8. Hapus educational_content (artikel sampel)
DELETE FROM public.educational_content;

-- 9. Hapus notifications (jika ada)
DELETE FROM public.notifications;

-- Reset sequences jika diperlukan
-- (Tidak perlu karena menggunakan UUID)

-- Verifikasi: Cek jumlah data setelah cleanup
SELECT 
    'service_animals' as table_name, COUNT(*) as count FROM public.service_animals
UNION ALL
SELECT 
    'service_reviews', COUNT(*) FROM public.service_reviews
UNION ALL
SELECT 
    'consultation_messages', COUNT(*) FROM public.consultation_messages
UNION ALL
SELECT 
    'telemedicine_appointments', COUNT(*) FROM public.telemedicine_appointments
UNION ALL
SELECT 
    'consultations', COUNT(*) FROM public.consultations
UNION ALL
SELECT 
    'recommendation_requests', COUNT(*) FROM public.recommendation_requests
UNION ALL
SELECT 
    'service_requests', COUNT(*) FROM public.service_requests
UNION ALL
SELECT 
    'educational_content', COUNT(*) FROM public.educational_content
UNION ALL
SELECT 
    'notifications', COUNT(*) FROM public.notifications;

-- Catatan:
-- Data yang TIDAK dihapus (penting untuk aplikasi):
-- - clinics (klinik dan puskeswan)
-- - staff_users (admin dan staff)
-- - Semua struktur tabel dan constraints

