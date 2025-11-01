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

interface Consultation {
  id: string;
  tracking_code: string;
  staff_id: string | null;
  service_type: string;
  status: string;
  consultation_date: string | null;
  consultation_method: string | null;
  problem_description: string | null;
  notes: string | null;
  created_at: string;
  staff_users?: { full_name: string; role: string };
}

interface ConsultationMessage {
  id: string;
  consultation_id: string;
  sender_type: string;
  message_text: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  consultation_id: string;
  appointment_date: string;
  appointment_time: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function KelolaKonsultasiPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'consultations' | 'messages' | 'appointments'>('consultations');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'consultations') {
        loadConsultations();
      } else if (activeTab === 'messages') {
        loadMessages();
      } else if (activeTab === 'appointments') {
        loadAppointments();
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    filterConsultations();
  }, [selectedStatus, consultations]);

  useEffect(() => {
    if (selectedConsultation && showDetailModal) {
      loadConsultationDetails();
    }
  }, [selectedConsultation, showDetailModal]);

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

  const loadConsultations = async () => {
    try {
      let query = supabase
        .from('consultations')
        .select(`
          *,
          staff_users(full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (user?.clinic_id) {
        // Filter by staff from same clinic
        const { data: clinicStaff } = await supabase
          .from('staff_users')
          .select('id')
          .eq('clinic_id', user.clinic_id);

        if (clinicStaff && clinicStaff.length > 0) {
          const staffIds = clinicStaff.map(s => s.id);
          query = query.in('staff_id', staffIds);
        } else {
          query = query.eq('staff_id', '00000000-0000-0000-0000-000000000000'); // Empty result
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setConsultations(data || []);
    } catch (error: any) {
      console.error('Error loading consultations:', error);
      toast.error('Gagal memuat konsultasi');
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Gagal memuat pesan');
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('telemedicine_appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast.error('Gagal memuat janji temu');
    }
  };

  const loadConsultationDetails = async () => {
    if (!selectedConsultation) return;

    try {
      // Load messages
      const { data: msgs } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', selectedConsultation.id)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);

      // Load appointments
      const { data: apps } = await supabase
        .from('telemedicine_appointments')
        .select('*')
        .eq('consultation_id', selectedConsultation.id);

      setAppointments(apps || []);
    } catch (error: any) {
      console.error('Error loading consultation details:', error);
    }
  };

  const filterConsultations = () => {
    if (selectedStatus === 'all') {
      setFilteredConsultations(consultations);
    } else {
      setFilteredConsultations(consultations.filter(c => c.status === selectedStatus));
    }
  };

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', consultationId);

      if (error) throw error;

      toast.success('Status berhasil diperbarui');
      loadConsultations();
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
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ongoing':
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
        return 'Menunggu';
      case 'scheduled':
        return 'Terjadwal';
      case 'ongoing':
        return 'Berlangsung';
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
        <title>Kelola Konsultasi - SLIDER Dashboard</title>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Kelola Konsultasi</h1>
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
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md p-2 mb-6 border border-gray-100 flex gap-2">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'consultations'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Konsultasi
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'messages'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pesan
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'appointments'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Janji Temu
            </button>
          </div>

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <>
              {/* Filter */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="scheduled">Terjadwal</option>
                    <option value="ongoing">Berlangsung</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                  <div className="ml-auto text-sm text-gray-600">
                    Total: <span className="font-bold">{filteredConsultations.length}</span> konsultasi
                  </div>
                </div>
              </div>

              {/* Consultations List */}
              {filteredConsultations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Konsultasi</h3>
                  <p className="text-gray-600">Tidak ada konsultasi dengan status ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConsultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition cursor-pointer"
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(consultation.status)}`}>
                              {getStatusLabel(consultation.status)}
                            </span>
                            <span className="text-sm text-gray-500">#{consultation.tracking_code}</span>
                          </div>
                          {consultation.staff_users && (
                            <p className="text-lg font-bold text-gray-800 mb-1">
                              {consultation.staff_users.full_name} ({consultation.staff_users.role})
                            </p>
                          )}
                          {consultation.problem_description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.problem_description}</p>
                          )}
                          {consultation.consultation_date && (
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(consultation.consultation_date)}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 text-right text-xs text-gray-500">
                          <p>{formatDate(consultation.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pesan Konsultasi</h2>
              {messages.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Belum ada pesan</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            msg.sender_type === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {msg.sender_type === 'staff' ? 'Staff' : 'Pengguna'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(msg.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        {msg.is_read && (
                          <span className="text-xs text-green-600">✓ Dibaca</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{msg.message_text}</p>
                      {msg.attachment_url && (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          📎 Lihat lampiran
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Janji Temu</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Belum ada janji temu</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800">
                            {formatDate(appointment.appointment_date)} {appointment.appointment_time}
                          </p>
                          {appointment.description && (
                            <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(appointment.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {showDetailModal && selectedConsultation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Detail Konsultasi</h2>
                  <p className="text-sm text-gray-600">#{selectedConsultation.tracking_code}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedConsultation(null);
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
                    value={selectedConsultation.status}
                    onChange={(e) => handleStatusChange(selectedConsultation.id, e.target.value)}
                    disabled={updating}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="scheduled">Terjadwal</option>
                    <option value="ongoing">Berlangsung</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Informasi */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Informasi Konsultasi</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {selectedConsultation.staff_users && (
                      <p><span className="font-medium">Staff:</span> {selectedConsultation.staff_users.full_name}</p>
                    )}
                    {selectedConsultation.consultation_method && (
                      <p><span className="font-medium">Metode:</span> {selectedConsultation.consultation_method}</p>
                    )}
                    {selectedConsultation.consultation_date && (
                      <p className="md:col-span-2">
                        <span className="font-medium">Tanggal:</span> {formatDate(selectedConsultation.consultation_date)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Problem Description */}
                {selectedConsultation.problem_description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Masalah</label>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedConsultation.problem_description}</p>
                  </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pesan ({messages.length})</label>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {msg.sender_type === 'staff' ? 'Staff' : 'Pengguna'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.message_text}</p>
                          {msg.attachment_url && (
                            <a
                              href={msg.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 block"
                            >
                              📎 Lampiran
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appointments */}
                {appointments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Janji Temu ({appointments.length})</label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {appointments.map((app) => (
                        <div key={app.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                {formatDate(app.appointment_date)} {app.appointment_time}
                              </p>
                              {app.description && (
                                <p className="text-xs text-gray-600 mt-1">{app.description}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedConsultation.notes}</p>
                  </div>
                )}

                {/* Tanggal */}
                <div className="text-xs text-gray-500">
                  <p>Dibuat: {new Date(selectedConsultation.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

