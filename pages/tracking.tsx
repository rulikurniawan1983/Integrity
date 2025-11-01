import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ServiceRequest {
  id: string;
  tracking_code: string;
  service_type: string;
  description: string;
  status: string;
  created_at: string;
  notes?: string;
  appointment_date?: string;
  appointment_time?: string;
  clinic_id?: string;
  staff_id?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: '⏳'
  },
  processing: {
    label: 'Sedang Diproses',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: '🔄'
  },
  approved: {
    label: 'Disetujui',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: '✅'
  },
  rejected: {
    label: 'Ditolak',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: '❌'
  },
  completed: {
    label: 'Selesai',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: '✔️'
  }
};

const serviceTypeLabels: Record<string, string> = {
  'praktek_dokter_hewan': 'Rekomendasi Praktek Dokter Hewan',
  'nomor_kontrol_veteriner': 'Rekomendasi Nomor Kontrol Veteriner',
  'pemeriksaan': 'Pemeriksaan',
  'vaksinasi': 'Vaksinasi',
  'pengobatan': 'Pengobatan',
  'konsultasi': 'Konsultasi',
};

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [staffInfo, setStaffInfo] = useState<any>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!trackingCode.trim()) {
      toast.error('Harap masukkan kode tracking');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServiceRequest(null);
    setClinicInfo(null);
    setStaffInfo(null);

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('tracking_code', trackingCode.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
          toast.error('Kode tracking tidak ditemukan');
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        setServiceRequest(data);
        setNotFound(false);
        
        // Load clinic info if clinic_id exists
        if (data.clinic_id) {
          const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .select('id, name, type, address, phone')
            .eq('id', data.clinic_id)
            .single();
          
          if (!clinicError && clinic) {
            setClinicInfo(clinic);
          }
        }
        
        // Load staff info if staff_id exists
        if (data.staff_id) {
          const { data: staff, error: staffError } = await supabase
            .from('staff_users')
            .select('id, full_name, role, specialization, phone')
            .eq('id', data.staff_id)
            .single();
          
          if (!staffError && staff) {
            setStaffInfo(staff);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching tracking:', error);
      toast.error('Gagal mencari kode tracking');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const status = serviceRequest ? statusConfig[serviceRequest.status] || statusConfig.pending : null;
  const serviceLabel = serviceRequest ? serviceTypeLabels[serviceRequest.service_type] || serviceRequest.service_type : '';
  
  let notesData: any = {};
  if (serviceRequest?.notes) {
    try {
      notesData = JSON.parse(serviceRequest.notes);
    } catch (e) {
      console.error('Error parsing notes:', e);
    }
  }

  return (
    <>
      <Head>
        <title>Tracking Permohonan - SLIDER</title>
        <meta name="description" content="Lacak status permohonan layanan" />
      </Head>

      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-bold">SLIDER</div>
              <span className="text-sm text-gray-300">Sistem Layanan Integrasi Data Edukasi Realtime</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="hover:text-orange-400 transition">Beranda</Link>
              <Link href="/konsultasi" className="hover:text-orange-400 transition">Konsultasi</Link>
              <Link href="/edukasi" className="hover:text-orange-400 transition">Edukasi</Link>
              <Link href="/layanan" className="hover:text-orange-400 transition">Layanan</Link>
              <Link href="/layanan-rekomendasi" className="hover:text-orange-400 transition">Rekomendasi</Link>
              <Link href="/tracking" className="text-orange-400 font-semibold">Tracking</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔍 Tracking Permohonan
            </h1>
            <p className="text-gray-600 text-lg">
              Masukkan kode tracking untuk melihat status dan keterangan permohonan Anda
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Tracking
                </label>
                <div className="flex gap-3">
                  <input
                    id="trackingCode"
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode tracking (contoh: REK12345678 atau SRV12345678)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-lg font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading || !trackingCode.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mencari...
                      </span>
                    ) : (
                      'Cari'
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Kode tracking biasanya diberikan setelah Anda mengirim permohonan
                </p>
              </div>
            </form>
          </div>

          {/* Not Found Message */}
          {notFound && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Kode Tracking Tidak Ditemukan</h3>
              <p className="text-gray-600 mb-6">
                Pastikan kode tracking yang Anda masukkan sudah benar. Kode tracking biasanya berupa:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">REK</code> diikuti 8 digit angka (untuk Rekomendasi)</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">SRV</code> diikuti 8 digit angka (untuk Layanan Klinik)</li>
              </ul>
            </div>
          )}

          {/* Service Request Details */}
          {serviceRequest && status && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${status.bgColor} ${status.color}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Status Permohonan</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{status.icon}</span>
                      <span className="text-xl font-semibold">{status.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Kode Tracking</p>
                    <code className="text-xl font-bold font-mono">{serviceRequest.tracking_code}</code>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Permohonan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jenis Layanan</p>
                    <p className="text-lg font-semibold text-gray-900">{serviceLabel || serviceRequest.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tanggal Pengajuan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(serviceRequest.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {serviceRequest.appointment_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tanggal Janji Temu</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(serviceRequest.appointment_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {serviceRequest.appointment_time && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waktu Janji Temu</p>
                      <p className="text-lg font-semibold text-gray-900">{serviceRequest.appointment_time}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
                    <p className="text-lg text-gray-900">{serviceRequest.description || '-'}</p>
                  </div>
                  {clinicInfo && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Klinik</p>
                      <p className="text-lg font-semibold text-gray-900">{clinicInfo.name || '-'}</p>
                      {clinicInfo.address && (
                        <p className="text-sm text-gray-600 mt-1">{clinicInfo.address}</p>
                      )}
                      {clinicInfo.phone && (
                        <p className="text-sm text-gray-600">{clinicInfo.phone}</p>
                      )}
                    </div>
                  )}
                  {staffInfo && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Dokter/Petugas</p>
                      <p className="text-lg font-semibold text-gray-900">{staffInfo.full_name || '-'}</p>
                      {staffInfo.role && (
                        <p className="text-sm text-gray-600 mt-1">{staffInfo.role}</p>
                      )}
                      {staffInfo.specialization && (
                        <p className="text-sm text-gray-600">{staffInfo.specialization}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Information */}
              {notesData && Object.keys(notesData).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Detail Informasi</h3>
                  
                  {/* Informasi Pribadi (untuk Praktek Dokter Hewan) */}
                  {notesData.informasi_pribadi && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Informasi Pribadi</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><span className="font-medium">Nama:</span> {notesData.informasi_pribadi.nama || '-'}</p>
                        <p><span className="font-medium">NIK:</span> {notesData.informasi_pribadi.nik || '-'}</p>
                        <p><span className="font-medium">Alamat:</span> {notesData.informasi_pribadi.alamat || '-'}</p>
                        <p><span className="font-medium">Kecamatan:</span> {notesData.informasi_pribadi.kecamatan || '-'}</p>
                        <p><span className="font-medium">Desa/Kelurahan:</span> {notesData.informasi_pribadi.desa || '-'}</p>
                        <p><span className="font-medium">No. Telepon:</span> {notesData.informasi_pribadi.telepon || '-'}</p>
                      </div>
                    </div>
                  )}

                  {/* Data Pelaku Usaha (untuk NKV) */}
                  {notesData.data_pelaku_usaha && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Data Pelaku Usaha</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><span className="font-medium">Nama Perusahaan:</span> {notesData.data_pelaku_usaha.nama_perusahaan || '-'}</p>
                        <p><span className="font-medium">NIB:</span> {notesData.data_pelaku_usaha.nib || '-'}</p>
                        <p><span className="font-medium">Alamat:</span> {notesData.data_pelaku_usaha.alamat_usaha || '-'}</p>
                        <p><span className="font-medium">Kecamatan:</span> {notesData.data_pelaku_usaha.kecamatan_usaha || '-'}</p>
                        <p><span className="font-medium">Desa/Kelurahan:</span> {notesData.data_pelaku_usaha.desa_usaha || '-'}</p>
                      </div>
                    </div>
                  )}

                  {/* Data Penanggung Jawab (untuk NKV) */}
                  {notesData.data_penanggung_jawab && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Data Penanggung Jawab</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><span className="font-medium">Nama:</span> {notesData.data_penanggung_jawab.nama || '-'}</p>
                        <p><span className="font-medium">Jabatan:</span> {notesData.data_penanggung_jawab.jabatan || '-'}</p>
                        <p><span className="font-medium">NIK:</span> {notesData.data_penanggung_jawab.nik || '-'}</p>
                        <p><span className="font-medium">No. Telepon:</span> {notesData.data_penanggung_jawab.telepon || '-'}</p>
                        <p><span className="font-medium">Email:</span> {notesData.data_penanggung_jawab.email || '-'}</p>
                      </div>
                    </div>
                  )}

                  {/* Informasi Kegiatan Usaha */}
                  {notesData.informasi_kegiatan_usaha && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Informasi Kegiatan Usaha</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {notesData.informasi_kegiatan_usaha.kbli && (
                          <p><span className="font-medium">KBLI:</span> {notesData.informasi_kegiatan_usaha.kbli}</p>
                        )}
                        {notesData.informasi_kegiatan_usaha.pbumku && (
                          <p><span className="font-medium">PBUMKU:</span> {notesData.informasi_kegiatan_usaha.pbumku}</p>
                        )}
                        {notesData.informasi_kegiatan_usaha.deskripsi && (
                          <p><span className="font-medium">Deskripsi:</span> {notesData.informasi_kegiatan_usaha.deskripsi}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2">Keterangan Status</h4>
                <div className="text-blue-800 space-y-2">
                  {serviceRequest.status === 'pending' && (
                    <p>Permohonan Anda sedang menunggu verifikasi oleh tim. Mohon tunggu konfirmasi selanjutnya.</p>
                  )}
                  {serviceRequest.status === 'processing' && (
                    <p>Permohonan Anda sedang diproses. Tim akan menghubungi Anda jika diperlukan informasi tambahan.</p>
                  )}
                  {serviceRequest.status === 'approved' && (
                    <p>Selamat! Permohonan Anda telah disetujui. Tim akan menghubungi Anda untuk proses selanjutnya.</p>
                  )}
                  {serviceRequest.status === 'rejected' && (
                    <p>Maaf, permohonan Anda ditolak. Silakan hubungi layanan pelanggan untuk informasi lebih lanjut.</p>
                  )}
                  {serviceRequest.status === 'completed' && (
                    <p>Permohonan Anda telah selesai diproses. Terima kasih telah menggunakan layanan kami.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 mb-2">© 2024 SLIDER - Sistem Layanan Integrasi Data Edukasi Realtime</p>
            <p className="text-gray-500 text-sm">Dinas Perikanan dan Peternakan Kabupaten Bogor</p>
            <p className="text-gray-500 text-sm mt-2">
              📞 (021) 8765311 | ✉️ diskanak@bogorkab.go.id
            </p>
            <p className="text-gray-500 text-sm">
              📍 Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat
            </p>
            <p className="text-gray-600 text-xs mt-4">Copyright Ruli Kurniawan, S.Pt.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

