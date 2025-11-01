import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: string;
  clinic_id: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalRequests: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    checkAuth();
    if (user) {
      loadStats();
    }
  }, [user]);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Load service requests stats
      let query = supabase
        .from('service_requests')
        .select('id, status', { count: 'exact' });

      if (user.clinic_id) {
        query = query.eq('clinic_id', user.clinic_id);
      }

      const { data: requests, count: totalRequests } = await query;
      
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;

      // Load pending reviews
      const { count: pendingReviews } = await supabase
        .from('service_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', false);

      setStats({
        pendingRequests,
        approvedRequests,
        totalRequests: totalRequests || 0,
        pendingReviews: pendingReviews || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logout berhasil');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - SLIDER | Dinas Perikanan dan Peternakan Kabupaten Bogor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                  <h1 className="text-xl font-bold text-white">SLIDER Dashboard</h1>
                  <p className="text-xs text-gray-300">{user.full_name} - {user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/" className="text-gray-300 hover:text-white font-medium transition">
                  Beranda
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Permohonan</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalRequests}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Menunggu Verifikasi</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Disetujui</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedRequests}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Ulasan Pending</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.pendingReviews}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/layanan"
                className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-blue-900 mb-1">Kelola Layanan Klinik</h3>
                <p className="text-sm text-blue-700">Lihat dan kelola permohonan layanan klinik</p>
              </Link>
              <Link
                href="/dashboard/rekomendasi"
                className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition"
              >
                <h3 className="font-semibold text-green-900 mb-1">Layanan Rekomendasi</h3>
                <p className="text-sm text-green-700">Kelola rekomendasi praktek & NKV</p>
              </Link>
              <Link
                href="/dashboard/konsultasi"
                className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
              >
                <h3 className="font-semibold text-purple-900 mb-1">Konsultasi Online</h3>
                <p className="text-sm text-purple-700">Kelola konsultasi online</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

