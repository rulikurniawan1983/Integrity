import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { kecamatanList, desaByKecamatan } from '../../lib/bogor-regions';

interface Clinic {
  id: string;
  name: string;
  type: string;
  address: string | null;
  phone: string | null;
}

interface Staff {
  id: string;
  full_name: string;
  role: string;
  specialization: string | null;
  clinic_id: string;
  clinic_name?: string;
}

const serviceTypes = [
  { value: 'pemeriksaan', label: 'Pemeriksaan', icon: '🔍', description: 'Pemeriksaan kesehatan hewan' },
  { value: 'vaksinasi', label: 'Vaksinasi', icon: '💉', description: 'Vaksinasi hewan' },
  { value: 'pengobatan', label: 'Pengobatan', icon: '💊', description: 'Pengobatan hewan sakit' },
];

const animalComplaints: Record<string, string[]> = {
  kucing: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan',
    'Muntah-muntah',
    'Diare',
    'Bersin-bersin',
    'Batuk',
    'Mata berair',
    'Kulit gatal/berluka',
    'Tidak aktif',
    'Kesulitan buang air kecil',
    'Luka atau trauma',
    'Lainnya'
  ],
  anjing: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan',
    'Muntah-muntah',
    'Diare',
    'Bersin-bersin',
    'Batuk',
    'Mata berair',
    'Kulit gatal/berluka',
    'Tidak aktif',
    'Kesulitan buang air kecil',
    'Luka atau trauma',
    'Lainnya'
  ],
  sapi: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Kembung',
    'Diare',
    'Batuk/sesak napas',
    'Demam',
    'Kulit gatal/berluka',
    'Kesulitan berdiri/berjalan',
    'Produksi susu menurun',
    'Luka atau trauma',
    'Lainnya'
  ],
  kambing: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Kembung',
    'Diare',
    'Batuk/sesak napas',
    'Demam',
    'Kulit gatal/berluka',
    'Kesulitan berdiri/berjalan',
    'Luka atau trauma',
    'Lainnya'
  ],
  domba: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Kembung',
    'Diare',
    'Batuk/sesak napas',
    'Demam',
    'Kulit gatal/berluka',
    'Kesulitan berdiri/berjalan',
    'Luka atau trauma',
    'Lainnya'
  ],
  ayam: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Tidak aktif',
    'Bulu rontok',
    'Bersin-bersin',
    'Batuk',
    'Mata berair',
    'Diare',
    'Produksi telur menurun',
    'Luka atau trauma',
    'Lainnya'
  ],
  bebek: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Tidak aktif',
    'Bulu rontok',
    'Bersin-bersin',
    'Batuk',
    'Mata berair',
    'Diare',
    'Produksi telur menurun',
    'Luka atau trauma',
    'Lainnya'
  ],
  ternak_lain: [
    'Pemeriksaan rutin',
    'Vaksinasi',
    'Tidak mau makan/minum',
    'Kembung',
    'Diare',
    'Batuk/sesak napas',
    'Demam',
    'Kulit gatal/berluka',
    'Kesulitan berdiri/berjalan',
    'Luka atau trauma',
    'Lainnya'
  ]
};

export default function LayananPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const [formData, setFormData] = useState({
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
    ownerName: '',
    kecamatan: '',
    desa: '',
  });

  const [animals, setAnimals] = useState<Array<{ name: string; type: string; gender: string; age: string; complaint: string }>>([
    { name: '', type: '', gender: '', age: '', complaint: '' }
  ]);

  useEffect(() => {
    loadClinics();
    loadStaffList();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      const filtered = staffList.filter(staff => staff.clinic_id === selectedClinic);
      setFilteredStaff(filtered);
      setSelectedStaff('');
    } else {
      setFilteredStaff([]);
      setSelectedStaff('');
    }
  }, [selectedClinic, staffList]);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, type, address, phone')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error: any) {
      console.error('Error loading clinics:', error);
      toast.error('Gagal memuat daftar klinik');
    }
  };

  const loadStaffList = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select(`
          id,
          full_name,
          role,
          specialization,
          clinic_id,
          clinics:clinic_id (
            name
          )
        `)
        .eq('is_active', true)
        .in('role', ['Dokter Hewan', 'Ahli Perikanan', 'Ahli Peternakan']);

      if (error) throw error;

      const formatted = (data || []).map((staff: any) => ({
        id: staff.id,
        full_name: staff.full_name,
        role: staff.role,
        specialization: staff.specialization,
        clinic_id: staff.clinic_id,
        clinic_name: staff.clinics?.name || 'Tidak ditentukan'
      }));

      setStaffList(formatted);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      toast.error('Gagal memuat daftar staff');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClinic) {
      toast.error('Harap pilih klinik');
      return;
    }

    if (!selectedStaff) {
      toast.error('Harap pilih staff');
      return;
    }

    if (!formData.serviceType) {
      toast.error('Harap pilih jenis layanan');
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Harap isi tanggal dan waktu janji temu');
      return;
    }

    if (!formData.ownerName || !formData.kecamatan || !formData.desa) {
      toast.error('Harap isi informasi pemilik hewan/ternak');
      return;
    }

    // Validate animals
    const validAnimals = animals.filter(a => a.name.trim() && a.type && a.gender && a.age && a.complaint);
    if (validAnimals.length === 0) {
      toast.error('Harap isi minimal satu hewan lengkap (nama, jenis, kelamin, umur, dan keluhan)');
      return;
    }

    setSubmitting(true);
    try {
      const trackingCode = 'SRV' + Date.now().toString().slice(-8);
      
      // Format animals info for description
      const validAnimals = animals.filter(a => a.name.trim() && a.type && a.gender && a.age && a.complaint);
      const animalsInfo = validAnimals.map(a => `${a.name} (${a.type}, ${a.gender}, ${a.age}) - ${a.complaint}`).join('; ');
      const serviceLabel = serviceTypes.find(s => s.value === formData.serviceType)?.label || 'Layanan';
      const descriptionText = `${serviceLabel} - Hewan: ${animalsInfo}`;

      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          tracking_code: trackingCode,
          clinic_id: selectedClinic,
          staff_id: selectedStaff,
          service_type: formData.serviceType,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          description: descriptionText,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Permohonan layanan berhasil dibuat!');
      
      // Set tracking code and show modal
      setTrackingCode(trackingCode);
      setShowTrackingModal(true);
      
      // Reset form
      setSelectedClinic('');
      setSelectedStaff('');
      setFormData({
        serviceType: '',
        appointmentDate: '',
        appointmentTime: '',
        ownerName: '',
        kecamatan: '',
        desa: '',
      });
      setAnimals([{ name: '', type: '', gender: '', age: '', complaint: '' }]);

    } catch (error: any) {
      console.error('Error creating service request:', error);
      toast.error('Gagal membuat permohonan layanan');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClinicData = clinics.find(c => c.id === selectedClinic);
  const selectedStaffData = filteredStaff.find(s => s.id === selectedStaff);

  return (
    <>
      <Head>
        <title>Layanan Klinik - SLIDER | Dinas Perikanan dan Peternakan Kabupaten Bogor</title>
        <meta name="description" content="Pemeriksaan, vaksinasi, dan pengobatan hewan di Klinik Dinas dan Puskeswan" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SLIDER</h1>
                </div>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link href="/edukasi" className="text-gray-300 hover:text-white font-medium transition">Edukasi</Link>
                <Link href="/konsultasi" className="text-gray-300 hover:text-white font-medium transition">Konsultasi</Link>
                <Link href="/layanan" className="text-white font-medium transition border-b-2 border-white">Layanan</Link>
                <Link href="/layanan-rekomendasi" className="text-gray-300 hover:text-white font-medium transition">Layanan Rekomendasi</Link>
              </nav>
              <div className="flex gap-3">
                <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg transition">Login</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-4">Layanan Klinik</h2>
            <p className="text-white/90 text-center text-lg max-w-2xl mx-auto">
              Pemeriksaan, vaksinasi, dan pengobatan hewan di Klinik Dinas dan Puskeswan
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Buat Permohonan Layanan</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clinic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Klinik <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  <option value="">-- Pilih Klinik --</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.type})
                    </option>
                  ))}
                </select>
                {selectedClinicData && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                    <p className="font-semibold">{selectedClinicData.name}</p>
                    {selectedClinicData.address && <p className="text-gray-600">📍 {selectedClinicData.address}</p>}
                    {selectedClinicData.phone && <p className="text-gray-600">📞 {selectedClinicData.phone}</p>}
                  </div>
                )}
              </div>

              {/* Staff Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Staff <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  required
                  disabled={!selectedClinic}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedClinic ? '-- Pilih Staff --' : 'Pilih klinik terlebih dahulu'}
                  </option>
                  {filteredStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.full_name} - {staff.role} {staff.specialization ? `(${staff.specialization})` : ''}
                    </option>
                  ))}
                </select>
                {!selectedClinic && (
                  <p className="mt-2 text-sm text-gray-500">Harap pilih klinik terlebih dahulu</p>
                )}
                {selectedClinic && filteredStaff.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">Tidak ada staff tersedia di klinik ini</p>
                )}
                {selectedStaffData && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                    <p className="font-semibold">{selectedStaffData.full_name}</p>
                    <p className="text-gray-600">{selectedStaffData.role}</p>
                    {selectedStaffData.specialization && (
                      <p className="text-gray-600">Spesialisasi: {selectedStaffData.specialization}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  <option value="">-- Pilih Jenis Layanan --</option>
                  {serviceTypes.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.icon} {service.label} - {service.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Information */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Informasi Pemilik Hewan/Ternak</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pemilik <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                      placeholder="Nama lengkap pemilik"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecamatan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.kecamatan}
                        onChange={(e) => {
                          setFormData({ ...formData, kecamatan: e.target.value, desa: '' });
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      >
                        <option value="">-- Pilih Kecamatan --</option>
                        {kecamatanList.map((kec) => (
                          <option key={kec} value={kec}>
                            {kec}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desa/Kelurahan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.desa}
                        onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                        required
                        disabled={!formData.kecamatan}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.kecamatan ? '-- Pilih Desa/Kelurahan --' : 'Pilih kecamatan terlebih dahulu'}
                        </option>
                        {formData.kecamatan && desaByKecamatan[formData.kecamatan]?.map((desa) => (
                          <option key={desa} value={desa}>
                            {desa}
                          </option>
                        ))}
                      </select>
                      {formData.kecamatan && !desaByKecamatan[formData.kecamatan] && (
                        <p className="mt-2 text-sm text-yellow-600">Desa/Kelurahan untuk kecamatan ini belum tersedia</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Janji Temu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Janji Temu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">-- Pilih Waktu --</option>
                    {Array.from({ length: 8 }, (_, i) => {
                      const hour = 8 + i; // 08:00 to 15:00
                      const timeValue = `${hour.toString().padStart(2, '0')}:00`;
                      const timeDisplay = `${timeValue} WIB`;
                      return (
                        <option key={timeValue} value={timeValue}>
                          {timeDisplay}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Animal Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-800">Data Hewan/Ternak</h4>
                  <button
                    type="button"
                    onClick={() => setAnimals([...animals, { name: '', type: '', gender: '', age: '', complaint: '' }])}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Hewan
                  </button>
                </div>
                <div className="space-y-4">
                  {animals.map((animal, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="font-semibold text-gray-700">
                          Hewan #{index + 1}
                        </div>
                        {animals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = animals.filter((_, i) => i !== index);
                              setAnimals(updated);
                            }}
                            className="ml-auto px-3 py-1 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-1 text-sm"
                            title="Hapus hewan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Hewan
                            </label>
                            <input
                              type="text"
                              value={animal.name}
                              onChange={(e) => {
                                const updated = [...animals];
                                updated[index].name = e.target.value;
                                setAnimals(updated);
                              }}
                              placeholder="Contoh: Si Meong"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jenis Hewan
                            </label>
                            <select
                              value={animal.type}
                              onChange={(e) => {
                                const updated = [...animals];
                                updated[index].type = e.target.value;
                                updated[index].complaint = ''; // Reset complaint when type changes
                                setAnimals(updated);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih Jenis --</option>
                              <option value="kucing">Kucing</option>
                              <option value="anjing">Anjing</option>
                              <option value="sapi">Sapi</option>
                              <option value="kambing">Kambing</option>
                              <option value="domba">Domba</option>
                              <option value="ayam">Ayam</option>
                              <option value="bebek">Bebek</option>
                              <option value="ternak_lain">Ternak Lainnya</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jenis Kelamin
                            </label>
                            <select
                              value={animal.gender}
                              onChange={(e) => {
                                const updated = [...animals];
                                updated[index].gender = e.target.value;
                                setAnimals(updated);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            >
                              <option value="">-- Pilih --</option>
                              <option value="jantan">Jantan</option>
                              <option value="betina">Betina</option>
                            </select>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Umur
                              </label>
                              <select
                                value={animal.age}
                                onChange={(e) => {
                                  const updated = [...animals];
                                  updated[index].age = e.target.value;
                                  setAnimals(updated);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                              >
                                <option value="">-- Pilih Umur --</option>
                                <option value="kurang dari 4 bulan">Kurang dari 4 bulan</option>
                                <option value="diatas 4 bulan">Diatas 4 bulan</option>
                                <option value="1 tahun">1 tahun</option>
                                <option value="diatas 1 tahun">Diatas 1 tahun</option>
                                <option value="diatas 2 tahun">Diatas 2 tahun</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keluhan
                              </label>
                              {animal.type ? (
                                <select
                                  value={animal.complaint}
                                  onChange={(e) => {
                                    const updated = [...animals];
                                    updated[index].complaint = e.target.value;
                                    setAnimals(updated);
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                >
                                  <option value="">-- Pilih Keluhan --</option>
                                  {animalComplaints[animal.type]?.map((complaint) => (
                                    <option key={complaint} value={complaint}>
                                      {complaint}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <select
                                  value={animal.complaint}
                                  onChange={(e) => {
                                    const updated = [...animals];
                                    updated[index].complaint = e.target.value;
                                    setAnimals(updated);
                                  }}
                                  disabled
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                                >
                                  <option value="">Pilih jenis hewan terlebih dahulu</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {animals.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Tambahkan minimal satu hewan</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {submitting ? 'Mengirim Permohonan...' : 'Kirim Permohonan Layanan'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Tracking Code Modal */}
        {showTrackingModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTrackingModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Permohonan Berhasil Dikirim!
                </h3>
                <p className="text-gray-600 mb-6">
                  Simpan kode tracking ini untuk melacak status permohonan Anda
                </p>
                
                {/* Tracking Code Display */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 mb-6">
                  <p className="text-sm text-white/80 mb-2 font-medium">Kode Tracking</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold text-white tracking-wider">
                      {trackingCode}
                    </code>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(trackingCode);
                          toast.success('Kode tracking berhasil disalin!');
                        } catch (err) {
                          toast.error('Gagal menyalin kode');
                        }
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      title="Salin kode"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Cara Melacak Permohonan:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Gunakan kode tracking di atas</li>
                        <li>Cek status permohonan di halaman "Lacak Permohonan"</li>
                        <li>Anda akan mendapat notifikasi saat status berubah</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">SLIDER</h4>
                <p className="text-gray-400 text-sm">
                  Sistem Layanan Integrasi Data Edukasi Realtime
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Layanan</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/konsultasi" className="hover:text-white transition">Konsultasi Online</Link></li>
                  <li><Link href="/layanan" className="hover:text-white transition">Layanan Klinik</Link></li>
                  <li><Link href="/edukasi" className="hover:text-white transition">Edukasi</Link></li>
                  <li><Link href="/layanan-rekomendasi" className="hover:text-white transition">Layanan Rekomendasi</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Informasi</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/tentang" className="hover:text-white transition">Tentang Kami</Link></li>
                  <li><Link href="/kontak" className="hover:text-white transition">Kontak</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                  <li><Link href="/bantuan" className="hover:text-white transition">Bantuan</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Kontak</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📞 (021) 8765311</li>
                  <li>✉️ diskanak@bogorkab.go.id</li>
                  <li>📍 Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              © 2024 SLIDER. All rights reserved.<br />
              <span className="mt-2 block">Copyright © Ruli Kurniawan, S.Pt</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

