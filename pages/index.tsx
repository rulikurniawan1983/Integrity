import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      description: 'Informasi harga pasar, produksi, dan data realtime',
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

  const clinics = [
    { name: 'Admin Sistem', code: 'ADMIN', value: 'admin' },
    { name: 'Klinik Dinas Perikanan dan Peternakan', code: 'KLDPK', value: 'kldpk' },
    { name: 'UPT Puskeswan Cibinong', code: 'PSC', value: 'psc' },
    { name: 'UPT Puskeswan Babakanmadang', code: 'PSB', value: 'psb' },
    { name: 'UPT Puskeswan Jonggol', code: 'PSJ', value: 'psj' },
    { name: 'UPT Puskeswan Laladon', code: 'PSL', value: 'psl' },
    { name: 'UPT Puskeswan Pamijahan', code: 'PSP', value: 'psp' },
    { name: 'UPT Puskeswan Cigudeg', code: 'PSG', value: 'psg' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Username atau password salah');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        role: data.role,
        clinic_id: data.clinic_id
      }));

      toast.success('Login berhasil');
      setShowLoginModal(false);
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </section>

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
                  {clinics.map((clinic) => (
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

