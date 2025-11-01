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

interface Stats {
  totalServiceRequests: number;
  pendingServiceRequests: number;
  totalRecommendations: number;
  pendingRecommendations: number;
  totalConsultations: number;
  activeConsultations: number;
  pendingReviews: number;
  totalStaff: number;
  onlineStaff: number;
  totalArticles: number;
  publishedArticles: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalServiceRequests: 0,
    pendingServiceRequests: 0,
    totalRecommendations: 0,
    pendingRecommendations: 0,
    totalConsultations: 0,
    activeConsultations: 0,
    pendingReviews: 0,
    totalStaff: 0,
    onlineStaff: 0,
    totalArticles: 0,
    publishedArticles: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
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
      // Service Requests Stats
      let serviceQuery = supabase
        .from('service_requests')
        .select('id, status', { count: 'exact' });

      if (user.clinic_id && user.role !== 'Admin') {
        serviceQuery = serviceQuery.eq('clinic_id', user.clinic_id);
      }

      const { data: serviceData, count: totalServiceRequests } = await serviceQuery;
      const pendingServiceRequests = serviceData?.filter(r => r.status === 'pending').length || 0;

      // Recommendation Requests Stats
      const { data: recData, count: totalRecommendations } = await supabase
        .from('recommendation_requests')
        .select('id, status', { count: 'exact' });

      const pendingRecommendations = recData?.filter(r => r.status === 'pending').length || 0;

      // Consultations Stats
      let consultationQuery = supabase
        .from('consultations')
        .select('id, status', { count: 'exact' });

      if (user.clinic_id && user.role !== 'Admin') {
        const { data: clinicStaff } = await supabase
          .from('staff_users')
          .select('id')
          .eq('clinic_id', user.clinic_id);

        if (clinicStaff && clinicStaff.length > 0) {
          const staffIds = clinicStaff.map(s => s.id);
          consultationQuery = consultationQuery.in('staff_id', staffIds);
        }
      }

      const { data: consultationData, count: totalConsultations } = await consultationQuery;
      const activeConsultations = consultationData?.filter(c => c.status === 'ongoing' || c.status === 'scheduled').length || 0;

      // Reviews Stats
      const { count: pendingReviews } = await supabase
        .from('service_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Staff Stats (Admin only)
      let staffStats = { total: 0, online: 0 };
      if (user.role === 'Admin') {
        const { data: allStaff, count: totalStaff } = await supabase
          .from('staff_users')
          .select('id, is_online', { count: 'exact' })
          .eq('is_active', true);

        staffStats = {
          total: totalStaff || 0,
          online: allStaff?.filter(s => s.is_online).length || 0,
        };
      }

      // Articles Stats
      const { data: articlesData, count: totalArticles } = await supabase
        .from('educational_content')
        .select('id, is_published', { count: 'exact' });

      const publishedArticles = articlesData?.filter(a => a.is_published).length || 0;

      setStats({
        totalServiceRequests: totalServiceRequests || 0,
        pendingServiceRequests,
        totalRecommendations: totalRecommendations || 0,
        pendingRecommendations,
        totalConsultations: totalConsultations || 0,
        activeConsultations,
        pendingReviews: pendingReviews || 0,
        totalStaff: staffStats.total,
        onlineStaff: staffStats.online,
        totalArticles: totalArticles || 0,
        publishedArticles,
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

  const isAdmin = user?.role === 'Admin';

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
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.full_name}!</h2>
            <p className="text-blue-100">Kelola semua aktivitas dan data sistem SLIDER dari dashboard ini.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Service Requests */}
            <Link href="/dashboard/layanan" className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Layanan Klinik</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalServiceRequests}</p>
                  <p className="text-xs text-yellow-600 mt-1">{stats.pendingServiceRequests} pending</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Recommendations */}
            <Link href="/dashboard/rekomendasi" className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Rekomendasi</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalRecommendations}</p>
                  <p className="text-xs text-yellow-600 mt-1">{stats.pendingRecommendations} pending</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Consultations */}
            <Link href="/dashboard/konsultasi" className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Konsultasi</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalConsultations}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.activeConsultations} aktif</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Reviews */}
            <Link href="/dashboard/reviews" className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Ulasan</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendingReviews}</p>
                  <p className="text-xs text-purple-600 mt-1">menunggu approval</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Management Section - Admin Only */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Pengelolaan Sistem</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/pengelolaan/staff"
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500 text-white rounded-lg p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Kelola Staff</h3>
                      <p className="text-xs text-blue-700">{stats.totalStaff} staff ({stats.onlineStaff} online)</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/pengelolaan/klinik"
                  className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 text-white rounded-lg p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Kelola Klinik</h3>
                      <p className="text-xs text-green-700">7 klinik & puskeswan</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/pengelolaan/konten"
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-500 text-white rounded-lg p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Kelola Konten</h3>
                      <p className="text-xs text-purple-700">{stats.totalArticles} artikel ({stats.publishedArticles} published)</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
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

// Force server-side rendering to avoid build-time errors
export async function getServerSideProps() {
  return {
    props: {},
  };
}
