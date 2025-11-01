import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      // Redirect to dashboard
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
        <title>Login - SLIDER | Dinas Perikanan dan Peternakan Kabupaten Bogor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800">SLIDER</h1>
                <p className="text-xs text-gray-500">Dinas Perikanan & Peternakan Kab. Bogor</p>
              </div>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Login</h2>
            <p className="text-gray-600 text-center mb-6">Masuk untuk Admin dan Puskeswan</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
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

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
                ← Kembali ke beranda
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 Dinas Perikanan dan Peternakan Kabupaten Bogor</p>
            <p className="mt-1">Copyright © Ruli Kurniawan, S.Pt</p>
          </div>
        </div>
      </div>
    </>
  );
}

