import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Clinic {
  id: string;
  name: string;
  type: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  code: string;
}

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewer_name: '',
    reviewer_email: '',
    reviewer_phone: '',
    rating: 0,
    review_text: '',
    service_type: 'klinik' as 'klinik' | 'konsultasi' | 'rekomendasi',
    clinic_id: ''
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const services = [
    {
      id: 'konsultasi',
      title: 'Konsultasi Online',
      description: 'Konsultasi dengan ahli perikanan dan peternakan secara online',
      icon: '💬',
      color: 'from-blue-500 to-cyan-500',
      link: '/konsultasi'
    },
    {
      id: 'edukasi',
      title: 'Edukasi & Artikel',
      description: 'Akses artikel, video, dan konten edukatif',
      icon: '📚',
      color: 'from-green-500 to-emerald-500',
      link: '/edukasi'
    },
    {
      id: 'layanan',
      title: 'Layanan Klinik',
      description: 'Pemeriksaan, vaksinasi, dan pengobatan hewan di Klinik Dinas dan Puskeswan',
      icon: '🏥',
      color: 'from-purple-500 to-pink-500',
      link: '/layanan'
    },
    {
      id: 'rekomendasi',
      title: 'Layanan Rekomendasi',
      description: 'Rekomendasi Praktek Dokter Hewan dan Rekomendasi Nomor Kontrol Veteriner',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      link: '/layanan-rekomendasi'
    },
    {
      id: 'tracking',
      title: 'Tracking Layanan',
      description: 'Lacak status permohonan layanan Anda',
      icon: '🔍',
      color: 'from-indigo-500 to-blue-500',
      link: '/tracking'
    }
  ];

  const clinicAddresses: { [key: string]: { address: string; lat?: number; lng?: number } } = {
    'KLDPK': { 
      address: 'Jl. Bersih, Kel Tengah, Kec Cibinong, Kabupaten Bogor, Jawa Barat',
      lat: -6.4825,
      lng: 106.8282
    },
    'PSC': { 
      address: 'UPT Puskeswan Cibinong, Kecamatan Cibinong, Kabupaten Bogor, Jawa Barat',
      lat: -6.4831,
      lng: 106.8295
    },
    'PSB': { 
      address: 'UPT Puskeswan Babakanmadang, Kecamatan Babakanmadang, Kabupaten Bogor, Jawa Barat',
      lat: -6.5200,
      lng: 106.7500
    },
    'PSJ': { 
      address: 'UPT Puskeswan Jonggol, Kecamatan Jonggol, Kabupaten Bogor, Jawa Barat',
      lat: -6.4569,
      lng: 107.0056
    },
    'PSL': { 
      address: 'UPT Puskeswan Laladon, Kecamatan Laladon, Kabupaten Bogor, Jawa Barat',
      lat: -6.5000,
      lng: 106.8500
    },
    'PSP': { 
      address: 'UPT Puskeswan Pamijahan, Kecamatan Pamijahan, Kabupaten Bogor, Jawa Barat',
      lat: -6.6800,
      lng: 106.6500
    },
    'PSG': { 
      address: 'UPT Puskeswan Cigudeg, Kecamatan Cigudeg, Kabupaten Bogor, Jawa Barat',
      lat: -6.5500,
      lng: 106.7000
    },
  };

  const loginClinics = [
    { name: 'Admin Sistem', code: 'ADMIN', value: 'admin' },
    { name: 'Klinik Dinas Perikanan dan Peternakan', code: 'KLDPK', value: 'kldpk' },
    { name: 'UPT Puskeswan Cibinong', code: 'PSC', value: 'psc' },
    { name: 'UPT Puskeswan Babakanmadang', code: 'PSB', value: 'psb' },
    { name: 'UPT Puskeswan Jonggol', code: 'PSJ', value: 'psj' },
    { name: 'UPT Puskeswan Laladon', code: 'PSL', value: 'psl' },
    { name: 'UPT Puskeswan Pamijahan', code: 'PSP', value: 'psp' },
    { name: 'UPT Puskeswan Cigudeg', code: 'PSG', value: 'psg' },
  ];

  useEffect(() => {
    loadClinics();
    getCurrentLocation();
    loadReviews();
  }, []);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Cibinong center if geolocation fails
          setUserLocation({ lat: -6.4825, lng: 106.8282 });
        }
      );
    } else {
      setUserLocation({ lat: -6.4825, lng: 106.8282 });
    }
  };

  const getDirectionsUrl = (clinicCode: string, userLocation?: { lat: number; lng: number } | null) => {
    const clinic = clinicAddresses[clinicCode];
    if (!clinic) return '#';
    
    const destination = encodeURIComponent(clinic.address);
    
    if (userLocation) {
      // Use Google Maps Directions with origin (user location)
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination}&travelmode=driving`;
    } else {
      // Use Google Maps with destination only
      return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }
  };

  const openGoogleMaps = (clinicCode: string) => {
    const clinic = clinicAddresses[clinicCode];
    if (!clinic) return;
    
    const url = getDirectionsUrl(clinicCode, userLocation);
    window.open(url, '_blank');
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          clinics(name),
          staff_users!service_reviews_approved_by_fkey(full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleStarClick = (rating: number) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name || reviewForm.rating === 0) {
      toast.error('Mohon isi nama dan berikan rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('service_reviews')
        .insert([{
          ...reviewForm,
          clinic_id: reviewForm.clinic_id || null
        }]);

      if (error) throw error;

      toast.success('Review berhasil dikirim! Review akan ditampilkan setelah disetujui oleh admin.');
      setReviewForm({
        reviewer_name: '',
        reviewer_email: '',
        reviewer_phone: '',
        rating: 0,
        review_text: '',
        service_type: 'klinik',
        clinic_id: ''
      });
      setShowReviewForm(false);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Gagal mengirim review. Silakan coba lagi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick && onStarClick(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}
          >
            <svg
              className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Username atau password salah');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.full_name,
        role: data.user.role,
        clinic_id: data.user.clinic_id
      }));

      toast.success('Login berhasil');
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SLIDER - Sistem Layanan Integrasi Data Edukasi Realtime | Dinas Perikanan dan Peternakan Kabupaten Bogor</title>
        <meta name="description" content="Platform layanan terintegrasi untuk perikanan dan peternakan di Kabupaten Bogor" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SLIDER</h1>
                </div>
              </div>
              <nav className="hidden md:flex gap-6">
                <Link href="/edukasi" className="text-gray-300 hover:text-white font-medium transition">Edukasi</Link>
                <Link href="/konsultasi" className="text-gray-300 hover:text-white font-medium transition">Konsultasi</Link>
                <Link href="/layanan" className="text-gray-300 hover:text-white font-medium transition">Layanan</Link>
                <Link href="/layanan-rekomendasi" className="text-gray-300 hover:text-white font-medium transition">Layanan Rekomendasi</Link>
              </nav>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Services Grid */}
        <section className="container mx-auto px-4 py-12">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">Layanan Kami</h3>
          <p className="text-center text-gray-600 mb-12">Pilih layanan yang Anda butuhkan</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.link}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition`}>
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h4>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="text-blue-600 font-semibold flex items-center gap-2">
                  Mulai <span className="group-hover:translate-x-1 transition">→</span>
                </div>
              </Link>
            ))}
            
            {/* Map Lokasi Klinik */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-3xl mb-4">
                📍
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Lokasi Klinik</h4>
              <p className="text-gray-600 mb-4">Peta lokasi Klinik Dinas dan 6 UPT Puskeswan di Kabupaten Bogor</p>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-2xl font-bold text-gray-800">📍 Peta Lokasi Klinik & Puskeswan</h4>
              {userLocation && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lokasi terdeteksi
                </div>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ height: '500px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.968045520833!2d106.82818391477317!3d-6.482550795329788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c0f5e8b5c3b3%3A0x5e8b5c3b3e69c0f5!2sJl.%20Bersih%2C%20Kel.%20Tengah%2C%20Kec.%20Cibinong%2C%20Kabupaten%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Peta Lokasi Klinik Dinas dan 6 UPT Puskeswan Kabupaten Bogor"
              ></iframe>
            </div>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {clinics.map((clinic) => {
                const clinicInfo = clinicAddresses[clinic.code];
                const isDinas = clinic.type === 'dinas';
                
  return (
                  <div
                    key={clinic.id}
                    className={`rounded-lg p-4 border transition hover:shadow-lg ${
                      isDinas 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <h5 className={`font-semibold mb-2 text-sm ${
                      isDinas ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      {clinic.name}
                    </h5>
                    {isDinas ? (
                      <>
                        <p className="text-xs text-blue-700 mb-1">Klinik Dinas Perikanan dan Peternakan</p>
                        <p className="text-xs text-gray-600 mb-3">Jl. Bersih, Kel Tengah, Kec Cibinong</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-600 mb-3">{clinicInfo?.address || 'Kabupaten Bogor'}</p>
                    )}
                    <button
                      onClick={() => openGoogleMaps(clinic.code)}
                      className={`w-full mt-2 px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
                        isDinas
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 18.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V5.618a1 1 0 00-.553-.894L15 2m0 13V2m0 0L9 5" />
                      </svg>
                      Buka Navigasi
                    </button>
          </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Ulasan Pengguna</h3>
                <p className="text-gray-600">Bagikan pengalaman Anda menggunakan layanan kami</p>
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Tulis Ulasan
              </button>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Ulasan</h4>
                <p className="text-gray-600">Jadilah yang pertama memberikan ulasan!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-1">{review.reviewer_name}</h5>
                        {review.clinics && (
                          <p className="text-xs text-gray-600 mb-2">
                            {typeof review.clinics === 'object' ? review.clinics.name : 'Layanan Umum'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tulis Ulasan</h2>
                  <p className="text-sm text-gray-600">Bagikan pengalaman Anda menggunakan layanan kami</p>
                </div>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewForm({
                      reviewer_name: '',
                      reviewer_email: '',
                      reviewer_phone: '',
                      rating: 0,
                      review_text: '',
                      service_type: 'klinik',
                      clinic_id: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {renderStars(reviewForm.rating, true, handleStarClick)}
                    {reviewForm.rating > 0 && (
                      <span className="text-sm text-gray-600">
                        {reviewForm.rating === 1 && 'Sangat Buruk'}
                        {reviewForm.rating === 2 && 'Buruk'}
                        {reviewForm.rating === 3 && 'Cukup'}
                        {reviewForm.rating === 4 && 'Baik'}
                        {reviewForm.rating === 5 && 'Sangat Baik'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="reviewer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reviewer_name"
                    value={reviewForm.reviewer_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Masukkan nama Anda"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reviewer_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    id="reviewer_email"
                    value={reviewForm.reviewer_email}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewer_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="reviewer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon (Opsional)
                  </label>
                  <input
                    type="tel"
                    id="reviewer_phone"
                    value={reviewForm.reviewer_phone}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewer_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="081234567890"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Layanan
                  </label>
                  <select
                    id="service_type"
                    value={reviewForm.service_type}
                    onChange={(e) => setReviewForm({ ...reviewForm, service_type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="klinik">Layanan Klinik</option>
                    <option value="konsultasi">Konsultasi Online</option>
                    <option value="rekomendasi">Layanan Rekomendasi</option>
                  </select>
                </div>

                {/* Clinic Selection (if service type is klinik) */}
                {reviewForm.service_type === 'klinik' && (
                  <div>
                    <label htmlFor="clinic_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Klinik (Opsional)
                    </label>
                    <select
                      id="clinic_id"
                      value={reviewForm.clinic_id}
                      onChange={(e) => setReviewForm({ ...reviewForm, clinic_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">Semua Klinik</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Review Text */}
                <div>
                  <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Ulasan (Opsional)
                  </label>
                  <textarea
                    id="review_text"
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Ceritakan pengalaman Anda menggunakan layanan kami..."
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Catatan:</strong> Ulasan Anda akan ditinjau oleh admin terlebih dahulu sebelum ditampilkan di halaman ini.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({
                        reviewer_name: '',
                        reviewer_email: '',
                        reviewer_phone: '',
                        rating: 0,
                        review_text: '',
                        service_type: 'klinik',
                        clinic_id: ''
                      });
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || reviewForm.rating === 0 || !reviewForm.reviewer_name}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Login</h2>
                    <p className="text-sm text-gray-600">Masuk untuk Admin dan Puskeswan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setUsername('');
                    setPassword('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="modal-username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="modal-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Masukkan username"
                  />
                </div>

                <div>
                  <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="modal-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Masukkan password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              {/* Clinic Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">Login untuk:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {loginClinics.map((clinic) => (
                    <div key={clinic.value} className="text-gray-600">
                      • {clinic.name}
                    </div>
                  ))}
                </div>
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

