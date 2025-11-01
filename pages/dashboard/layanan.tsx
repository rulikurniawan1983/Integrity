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

interface ServiceRequest {
  id: string;
  tracking_code: string;
  service_type: string;
  status: string;
  appointment_date: string | null;
  appointment_time: string | null;
  owner_name: string;
  owner_kecamatan: string;
  owner_desa: string;
  description: string | null;
  created_at: string;
  clinic_id: string | null;
  staff_id: string | null;
  clinics?: { name: string };
  staff_users?: { full_name: string; role: string };
  service_animals?: Array<{
    name: string;
    type: string;
    gender: string;
    age: string;
    complaint: string;
  }>;
}

export default function KelolaLayananPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
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
  }, [selectedStatus, requests]);

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
    if (!user) return;

    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          clinics(name),
          staff_users(full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (user.clinic_id) {
        query = query.eq('clinic_id', user.clinic_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Load animals for each request
      const requestsWithAnimals = await Promise.all(
        (data || []).map(async (request: any) => {
          const { data: animals } = await supabase
            .from('service_animals')
            .select('name, type, gender, age, complaint')
            .eq('service_request_id', request.id);

          return {
            ...request,
            service_animals: animals || []
          };
        })
      );

      setRequests(requestsWithAnimals);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Gagal memuat permohonan');
    }
  };

  const filterRequests = () => {
    if (selectedStatus === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === selectedStatus));
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('service_requests')
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
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'in_progress':
        return 'Sedang Diproses';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
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
        <title>Kelola Permohonan Layanan - SLIDER Dashboard</title>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Kelola Layanan Klinik</h1>
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
              <label className="text-sm font-medium text-gray-700">Filter Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="in_progress">Sedang Diproses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <div className="ml-auto text-sm text-gray-600">
                Total: <span className="font-bold">{filteredRequests.length}</span> permohonan
              </div>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Permohonan</h3>
              <p className="text-gray-600">Tidak ada permohonan layanan dengan status ini.</p>
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
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {request.service_type.charAt(0).toUpperCase() + request.service_type.slice(1)}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><span className="font-semibold">Pemilik:</span> {request.owner_name}</p>
                        <p><span className="font-semibold">Lokasi:</span> {request.owner_kecamatan}, {request.owner_desa}</p>
                        {request.appointment_date && (
                          <p>
                            <span className="font-semibold">Janji Temu:</span> {formatDate(request.appointment_date)}
                            {request.appointment_time && ` ${request.appointment_time}`}
                          </p>
                        )}
                        {request.clinics && (
                          <p><span className="font-semibold">Klinik:</span> {request.clinics.name}</p>
                        )}
                      </div>
                      {request.service_animals && request.service_animals.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Hewan ({request.service_animals.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {request.service_animals.map((animal, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                {animal.name} ({animal.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                  >
                    <option value="pending">Menunggu Verifikasi</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="in_progress">Sedang Diproses</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Informasi Pemohon */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Informasi Pemilik</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <p><span className="font-medium">Nama:</span> {selectedRequest.owner_name}</p>
                    <p><span className="font-medium">Kecamatan:</span> {selectedRequest.owner_kecamatan}</p>
                    <p className="md:col-span-2"><span className="font-medium">Desa/Kelurahan:</span> {selectedRequest.owner_desa}</p>
                  </div>
                </div>

                {/* Informasi Klinik & Staff */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Informasi Klinik & Staff</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {selectedRequest.clinics && (
                      <p><span className="font-medium">Klinik:</span> {selectedRequest.clinics.name}</p>
                    )}
                    {selectedRequest.staff_users && (
                      <p>
                        <span className="font-medium">Staff:</span> {selectedRequest.staff_users.full_name} ({selectedRequest.staff_users.role})
                      </p>
                    )}
                    {selectedRequest.appointment_date && (
                      <p>
                        <span className="font-medium">Tanggal:</span> {formatDate(selectedRequest.appointment_date)}
                      </p>
                    )}
                    {selectedRequest.appointment_time && (
                      <p><span className="font-medium">Waktu:</span> {selectedRequest.appointment_time}</p>
                    )}
                  </div>
                </div>

                {/* Daftar Hewan */}
                {selectedRequest.service_animals && selectedRequest.service_animals.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Daftar Hewan ({selectedRequest.service_animals.length})</h3>
                    <div className="space-y-3">
                      {selectedRequest.service_animals.map((animal, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Nama:</span> {animal.name}</p>
                            <p><span className="font-medium">Jenis:</span> {animal.type}</p>
                            <p><span className="font-medium">Kelamin:</span> {animal.gender}</p>
                            <p><span className="font-medium">Umur:</span> {animal.age}</p>
                            <p className="md:col-span-2">
                              <span className="font-medium">Keluhan:</span> {animal.complaint}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                {selectedRequest.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedRequest.description}</p>
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

