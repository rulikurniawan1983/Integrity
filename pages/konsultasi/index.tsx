import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Staff {
  id: string;
  full_name: string;
  role: string;
  specialization: string | null;
  photo_url: string | null;
  clinic_id: string | null;
  clinic_name?: string;
}

interface Consultation {
  id: string;
  tracking_code: string;
  staff_id: string | null;
  service_type: string;
  status: string;
  problem_description: string | null;
  created_at: string;
}

export default function KonsultasiPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    description: ''
  });
  const [chatData, setChatData] = useState({
    description: '',
    image: null as File | null,
    imagePreview: '' as string
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  useEffect(() => {
    if (consultation?.id) {
      loadMessages();
      // Subscribe to new messages
      const channel = supabase
        .channel(`consultation:${consultation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultation_messages',
            filter: `consultation_id=eq.${consultation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as any]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [consultation?.id]);

  const loadStaffList = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select(`
          id,
          full_name,
          role,
          specialization,
          photo_url,
          clinic_id,
          clinics:clinic_id (
            name
          )
        `)
        .eq('is_active', true)
        .in('role', ['Dokter Hewan', 'Ahli Perikanan', 'Ahli Peternakan']);

      if (error) throw error;

      const formatted = data.map((staff: any) => ({
        id: staff.id,
        full_name: staff.full_name,
        role: staff.role,
        specialization: staff.specialization,
        photo_url: staff.photo_url,
        clinic_id: staff.clinic_id,
        clinic_name: staff.clinics?.name || 'Tidak ditentukan'
      }));

      setStaffList(formatted);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      toast.error('Gagal memuat daftar staff');
    }
  };

  const startConsultation = async (staff: Staff) => {
    if (!chatData.description.trim()) {
      toast.error('Harap isi deskripsi masalah');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload gambar jika ada
      if (chatData.image) {
        const fileExt = chatData.image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `consultations/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('consultation-attachments')
          .upload(filePath, chatData.image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('consultation-attachments')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const trackingCode = 'CONS' + Date.now().toString().slice(-8);

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          tracking_code: trackingCode,
          staff_id: staff.id,
          service_type: 'umum',
          problem_description: chatData.description,
          consultation_method: 'chat',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Kirim gambar sebagai pesan pertama jika ada
      if (imageUrl) {
        await supabase
          .from('consultation_messages')
          .insert({
            consultation_id: data.id,
            sender_type: 'user',
            message_text: chatData.description,
            message_type: 'image',
            attachment_url: imageUrl,
            is_read: false
          });
      } else {
        // Kirim deskripsi sebagai pesan pertama
        await supabase
          .from('consultation_messages')
          .insert({
            consultation_id: data.id,
            sender_type: 'user',
            message_text: chatData.description,
            message_type: 'text',
            is_read: false
          });
      }

      setConsultation(data);
      setSelectedStaff(staff);
      setShowChatModal(false);
      setChatData({ description: '', image: null, imagePreview: '' });
      toast.success('Konsultasi dimulai');
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      toast.error('Gagal memulai konsultasi');
    } finally {
      setLoading(false);
    }
  };

  const openChatModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowChatModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }
      setChatData({
        ...chatData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const loadMessages = async () => {
    if (!consultation?.id) return;

    try {
      const { data, error } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', consultation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !consultation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('consultation_messages')
        .insert({
          consultation_id: consultation.id,
          sender_type: 'user',
          message_text: messageText,
          message_type: 'text',
          is_read: false
        });

      if (error) throw error;

      // Update consultation status to ongoing
      if (consultation.status === 'pending') {
        await supabase
          .from('consultations')
          .update({ status: 'ongoing' })
          .eq('id', consultation.id);
      }

      setMessageText('');
      toast.success('Pesan terkirim');
      
      // Reload messages to show new message
      loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const createAppointment = async (staff: Staff) => {
    if (!appointmentData.date || !appointmentData.time) {
      toast.error('Harap isi tanggal dan waktu');
      return;
    }

    setLoading(true);
    try {
      const consultationDate = new Date(`${appointmentData.date}T${appointmentData.time}`);
      const trackingCode = 'CONS' + Date.now().toString().slice(-8);

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          tracking_code: trackingCode,
          staff_id: staff.id,
          service_type: 'umum',
          problem_description: appointmentData.description || 'Janji temu konsultasi',
          consultation_method: 'in_person',
          consultation_date: consultationDate.toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Janji temu berhasil dibuat');
      setShowAppointmentModal(false);
      setAppointmentData({ date: '', time: '', description: '' });
      
      // Optionally auto-start consultation
      setConsultation(data);
      setSelectedStaff(staff);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Gagal membuat janji temu');
    } finally {
      setLoading(false);
    }
  };

  const openAppointmentModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowAppointmentModal(true);
  };

  return (
    <>
      <Head>
        <title>Konsultasi Online - SLIDER</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">SLIDER</h1>
                </div>
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition">
                Beranda
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {!consultation ? (
            /* Staff List View */
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Konsultasi Online</h2>
                <p className="text-gray-600">Pilih ahli yang ingin Anda konsultasikan</p>
              </div>

              {staffList.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-600">Belum ada staff yang tersedia</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffList.map((staff) => (
                    <div
                      key={staff.id}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition border border-gray-100"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {staff.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{staff.full_name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{staff.role}</p>
                          {staff.specialization && (
                            <p className="text-sm text-gray-600 mt-1">{staff.specialization}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{staff.clinic_name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChatModal(staff);
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition"
                          disabled={loading}
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAppointmentModal(staff);
                          }}
                          className="px-3 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
                          disabled={loading}
                        >
                          📅 Janji Temu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat View */
            <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Staff Info Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-md h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedStaff?.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{selectedStaff?.full_name}</h3>
                      <p className="text-sm text-blue-600">{selectedStaff?.role}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tracking Code</p>
                      <p className="font-mono font-semibold text-gray-800">{consultation.tracking_code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        consultation.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {consultation.status === 'ongoing' ? 'Sedang Berlangsung' :
                         consultation.status === 'completed' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setConsultation(null);
                      setSelectedStaff(null);
                      setMessages([]);
                    }}
                    className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Kembali ke Daftar
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2 flex flex-col bg-white rounded-xl shadow-md h-full">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">Chat Konsultasi</h3>
                  <p className="text-sm text-gray-600">Dengan {selectedStaff?.full_name}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Belum ada pesan. Mulai percakapan!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.message_type === 'image' && message.attachment_url ? (
                            <div>
                              <img
                                src={message.attachment_url}
                                alt={message.message_text}
                                className="max-w-full rounded-lg mb-2"
                                style={{ maxHeight: '300px' }}
                              />
                              <p className="text-sm">{message.message_text}</p>
                            </div>
                          ) : (
                            <p className="text-sm">{message.message_text}</p>
                          )}
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={sending}
                      />
                      <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && consultation) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('Ukuran gambar maksimal 5MB');
                                return;
                              }
                              
                              setSending(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                                const filePath = `consultations/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('consultation-attachments')
                                  .upload(filePath, file);

                                if (uploadError) throw uploadError;

                                const { data: urlData } = supabase.storage
                                  .from('consultation-attachments')
                                  .getPublicUrl(filePath);

                                await supabase
                                  .from('consultation_messages')
                                  .insert({
                                    consultation_id: consultation.id,
                                    sender_type: 'user',
                                    message_text: file.name,
                                    message_type: 'image',
                                    attachment_url: urlData.publicUrl,
                                    is_read: false
                                  });

                                loadMessages();
                                toast.success('Gambar terkirim');
                              } catch (error: any) {
                                console.error('Error uploading image:', error);
                                toast.error('Gagal mengirim gambar');
                              } finally {
                                setSending(false);
                                e.target.value = '';
                              }
                            }
                          }}
                          className="hidden"
                          disabled={sending}
                        />
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          {showChatModal && selectedStaff && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Mulai Chat Konsultasi</h3>
                  <button
                    onClick={() => {
                      setShowChatModal(false);
                      setSelectedStaff(null);
                      setChatData({ description: '', image: null, imagePreview: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-gray-800">{selectedStaff.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedStaff.role}</p>
                  {selectedStaff.specialization && (
                    <p className="text-xs text-gray-500 mt-1">{selectedStaff.specialization}</p>
                  )}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  startConsultation(selectedStaff);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Masalah <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={chatData.description}
                      onChange={(e) => setChatData({ ...chatData, description: e.target.value })}
                      rows={4}
                      placeholder="Jelaskan masalah atau pertanyaan Anda..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Gambar (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    {chatData.imagePreview && (
                      <div className="mt-3">
                        <img
                          src={chatData.imagePreview}
                          alt="Preview"
                          className="max-w-full h-40 object-contain rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setChatData({ ...chatData, image: null, imagePreview: '' });
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Hapus gambar
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Maksimal 5MB. Format: JPG, PNG, GIF</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChatModal(false);
                        setSelectedStaff(null);
                        setChatData({ description: '', image: null, imagePreview: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Memproses...' : 'Mulai Chat'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Appointment Modal */}
          {showAppointmentModal && selectedStaff && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Buat Janji Temu</h3>
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setSelectedStaff(null);
                      setAppointmentData({ date: '', time: '', description: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-gray-800">{selectedStaff.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedStaff.role}</p>
                  {selectedStaff.specialization && (
                    <p className="text-xs text-gray-500 mt-1">{selectedStaff.specialization}</p>
                  )}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  createAppointment(selectedStaff);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Pilih Waktu</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      value={appointmentData.description}
                      onChange={(e) => setAppointmentData({ ...appointmentData, description: e.target.value })}
                      rows={3}
                      placeholder="Jelaskan keperluan konsultasi..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAppointmentModal(false);
                        setSelectedStaff(null);
                        setAppointmentData({ date: '', time: '', description: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Membuat...' : 'Buat Janji Temu'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

