import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: string;
  clinic_id: string | null;
}

interface Review {
  id: string;
  service_type: string;
  reviewer_name: string;
  reviewer_email: string | null;
  reviewer_phone: string | null;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  clinic_id: string | null;
  clinics?: { name: string };
}

export default function KelolaReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  useEffect(() => {
    filterReviews();
  }, [selectedStatus, reviews]);

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

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('service_reviews')
        .select(`
          *,
          clinics(name)
        `)
        .order('created_at', { ascending: false });

      if (user?.clinic_id && user.role !== 'Admin') {
        query = query.eq('clinic_id', user.clinic_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      toast.error('Gagal memuat ulasan');
    }
  };

  const filterReviews = () => {
    if (selectedStatus === 'all') {
      setFilteredReviews(reviews);
    } else if (selectedStatus === 'pending') {
      setFilteredReviews(reviews.filter(r => !r.is_approved));
    } else {
      setFilteredReviews(reviews.filter(r => r.is_approved));
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('service_reviews')
        .update({
          is_approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Ulasan disetujui');
      loadReviews();
    } catch (error: any) {
      console.error('Error approving review:', error);
      toast.error('Gagal menyetujui ulasan');
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;

    try {
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Ulasan dihapus');
      loadReviews();
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      toast.error('Gagal menghapus ulasan');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <title>Kelola Ulasan - SLIDER Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Kelola Ulasan</h1>
                    <p className="text-xs text-gray-300">{user.full_name}</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-300 hover:text-white font-medium transition">
                  Dashboard
                </Link>
                <Link href="/" className="text-gray-300 hover:text-white font-medium transition">
                  Beranda
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    toast.success('Logout berhasil');
                    router.push('/');
                  }}
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
          {/* Filter */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
              </select>
              <div className="ml-auto text-sm text-gray-600">
                Total: <span className="font-bold">{filteredReviews.length}</span> ulasan
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Ulasan</h3>
              <p className="text-gray-600">Tidak ada ulasan dengan filter ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={`bg-white rounded-xl shadow-md p-6 border ${
                    review.is_approved ? 'border-green-200' : 'border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{review.reviewer_name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.is_approved ? 'Disetujui' : 'Pending'}
                        </span>
                        {review.clinics && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            {review.clinics.name}
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-gray-700 mb-2">{review.review_text}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Layanan: {review.service_type}</span>
                        {review.reviewer_email && <span>Email: {review.reviewer_email}</span>}
                        {review.reviewer_phone && <span>Telp: {review.reviewer_phone}</span>}
                        <span>Dibuat: {formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    {!review.is_approved && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

