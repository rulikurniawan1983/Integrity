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

interface RecommendationRequest {
  id: string;
  tracking_code: string;
  request_type: string;
  status: string;
  name: string | null;
  nik: string | null;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  company_nib: string | null;
  created_at: string;
  documents?: any;
  notes?: string | null;
}

export default function KelolaRekomendasiPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RecommendationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RecommendationRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [selectedStatus, selectedType, requests]);

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

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Gagal memuat permohonan rekomendasi');
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.request_type === selectedType);
    }

    setFilteredRequests(filtered);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('recommendation_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Status berhasil diperbarui');
      loadRequests();
      setShowDetailModal(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'in_progress':
        return 'Sedang Diproses';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'praktek_dokter_hewan':
        return 'Rekomendasi Praktek Dokter Hewan';
      case 'nomor_kontrol_veteriner':
        return 'Rekomendasi Nomor Kontrol Veteriner';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <title>Kelola Rekomendasi - SLIDER Dashboard</title>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Kelola Rekomendasi</h1>
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
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter Jenis:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua Jenis</option>
                <option value="praktek_dokter_hewan">Praktek Dokter Hewan</option>
                <option value="nomor_kontrol_veteriner">Nomor Kontrol Veteriner</option>
              </select>
              <label className="text-sm font-medium text-gray-700">Filter Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="in_progress">Sedang Diproses</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="completed">Selesai</option>
              </select>
              <div className="ml-auto text-sm text-gray-600">
                Total: <span className="font-bold">{filteredRequests.length}</span> permohonan
              </div>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Permohonan</h3>
              <p className="text-gray-600">Tidak ada permohonan rekomendasi dengan filter ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                        <span className="text-sm text-gray-500">#{request.tracking_code}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {getRequestTypeLabel(request.request_type)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {request.request_type === 'praktek_dokter_hewan' 
                          ? (request.name || 'N/A') 
                          : (request.company_name || 'N/A')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {request.nik && (
                          <p><span className="font-semibold">NIK:</span> {request.nik}</p>
                        )}
                        {request.phone && (
                          <p><span className="font-semibold">Telepon:</span> {request.phone}</p>
                        )}
                        {request.email && (
                          <p><span className="font-semibold">Email:</span> {request.email}</p>
                        )}
                        {request.company_nib && (
                          <p><span className="font-semibold">NIB:</span> {request.company_nib}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <p>{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Detail Permohonan</h2>
                  <p className="text-sm text-gray-600">#{selectedRequest.tracking_code}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                    disabled={updating}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:opacity-50"
                  >
                    <option value="pending">Menunggu Verifikasi</option>
                    <option value="in_progress">Sedang Diproses</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>

                {/* Informasi Dasar */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Informasi Dasar</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p><span className="font-medium">Jenis:</span> {getRequestTypeLabel(selectedRequest.request_type)}</p>
                    {selectedRequest.name && (
                      <p><span className="font-medium">Nama:</span> {selectedRequest.name}</p>
                    )}
                    {selectedRequest.nik && (
                      <p><span className="font-medium">NIK:</span> {selectedRequest.nik}</p>
                    )}
                    {selectedRequest.phone && (
                      <p><span className="font-medium">Telepon:</span> {selectedRequest.phone}</p>
                    )}
                    {selectedRequest.email && (
                      <p className="md:col-span-2"><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                    )}
                    {selectedRequest.company_name && (
                      <p className="md:col-span-2"><span className="font-medium">Nama Perusahaan:</span> {selectedRequest.company_name}</p>
                    )}
                    {selectedRequest.company_nib && (
                      <p><span className="font-medium">NIB:</span> {selectedRequest.company_nib}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedRequest.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedRequest.notes}</p>
                  </div>
                )}

                {/* Tanggal */}
                <div className="text-xs text-gray-500">
                  <p>Dibuat: {new Date(selectedRequest.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

