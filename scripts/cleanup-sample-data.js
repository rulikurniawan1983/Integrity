/**
 * Script untuk menghapus data sampel di database Supabase
 * Jalankan: node scripts/cleanup-sample-data.js
 * 
 * Environment variables bisa dari:
 * - .env.local file (otomatis dibaca oleh Next.js)
 * - Atau set langsung: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup-sample-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Baca .env.local jika ada
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Environment variables tidak ditemukan!');
  console.error('Pastikan file .env.local berisi:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupSampleData() {
  console.log('🧹 Mulai menghapus data sampel...\n');

  try {
    // 1. Hapus service_animals
    console.log('1. Menghapus service_animals...');
    const { error: err1 } = await supabase.from('service_animals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.error('   ⚠️  Error:', err1.message);
    else console.log('   ✅ Berhasil');

    // 2. Hapus service_reviews
    console.log('2. Menghapus service_reviews...');
    const { error: err2 } = await supabase.from('service_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error('   ⚠️  Error:', err2.message);
    else console.log('   ✅ Berhasil');

    // 3. Hapus consultation_messages
    console.log('3. Menghapus consultation_messages...');
    const { error: err3 } = await supabase.from('consultation_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.error('   ⚠️  Error:', err3.message);
    else console.log('   ✅ Berhasil');

    // 4. Hapus telemedicine_appointments
    console.log('4. Menghapus telemedicine_appointments...');
    const { error: err4 } = await supabase.from('telemedicine_appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.error('   ⚠️  Error:', err4.message);
    else console.log('   ✅ Berhasil');

    // 5. Hapus consultations
    console.log('5. Menghapus consultations...');
    const { error: err5 } = await supabase.from('consultations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5) console.error('   ⚠️  Error:', err5.message);
    else console.log('   ✅ Berhasil');

    // 6. Hapus recommendation_requests
    console.log('6. Menghapus recommendation_requests...');
    const { error: err6 } = await supabase.from('recommendation_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err6) console.error('   ⚠️  Error:', err6.message);
    else console.log('   ✅ Berhasil');

    // 7. Hapus service_requests
    console.log('7. Menghapus service_requests...');
    const { error: err7 } = await supabase.from('service_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err7) console.error('   ⚠️  Error:', err7.message);
    else console.log('   ✅ Berhasil');

    // 8. Hapus educational_content
    console.log('8. Menghapus educational_content...');
    const { error: err8 } = await supabase.from('educational_content').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err8) console.error('   ⚠️  Error:', err8.message);
    else console.log('   ✅ Berhasil');

    // 9. Hapus notifications
    console.log('9. Menghapus notifications...');
    const { error: err9 } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err9) console.error('   ⚠️  Error:', err9.message);
    else console.log('   ✅ Berhasil');

    console.log('\n✅ Cleanup selesai!');
    console.log('\n📊 Verifikasi data:');

    // Verifikasi
    const tables = [
      'service_animals',
      'service_reviews',
      'consultation_messages',
      'telemedicine_appointments',
      'consultations',
      'recommendation_requests',
      'service_requests',
      'educational_content',
      'notifications'
    ];

    for (const table of tables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`   ${table}: ${count || 0} records`);
    }

    console.log('\n✅ Data sampel berhasil dihapus!');
    console.log('💾 Data yang TIDAK dihapus (penting):');
    console.log('   - clinics (klinik dan puskeswan)');
    console.log('   - staff_users (admin dan staff)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupSampleData();

