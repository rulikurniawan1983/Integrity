import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: string;
  clinic_id: string | null;
}

interface Staff {
  id: string;
  username: string;
  full_name: string;
  role: string;
  clinic_id: string | null;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  clinics?: { name: string };
}

export default function KelolaStaffPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        loadStaffs();
      } else {
        router.push('/dashboard');
      }
    }
  }, [user]);

  useEffect(() => {
    filterStaffs();
  }, [selectedRole, selectedStatus, staffs]);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffs = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select(`
          *,
          clinics(name)
        `)
        .order('full_name', { ascending: true });

      if (error) throw error;

      setStaffs(data || []);
    } catch (error: any) {
      console.error('Error loading staffs:', error);
      toast.error('Gagal memuat data staff');
    }
  };

  const filterStaffs = () => {
    let filtered = staffs;

    if (selectedRole !== 'all') {
      filtered = filtered.filter(s => s.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(s => s.is_active);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(s => !s.is_active);
      } else if (selectedStatus === 'online') {
        filtered = filtered.filter(s => s.is_online);
      }
    }

    setFilteredStaffs(filtered);
  };

  const handleToggleActive = async (staffId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_users')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', staffId);

      if (error) throw error;

      toast.success(`Staff ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadStaffs();
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast.error('Gagal memperbarui status staff');
    }
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

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Kelola Staff - SLIDER Dashboard</title>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Kelola Staff</h1>
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
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua Role</option>
                <option value="Admin">Admin</option>
                <option value="Dokter Hewan">Dokter Hewan</option>
                <option value="Paramedik Veteriner">Paramedik Veteriner</option>
              </select>
              <label className="text-sm font-medium text-gray-700">Filter Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="online">Online</option>
              </select>
              <div className="ml-auto text-sm text-gray-600">
                Total: <span className="font-bold">{filteredStaffs.length}</span> staff
              </div>
            </div>
          </div>

          {/* Staff List */}
          {filteredStaffs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Staff</h3>
              <p className="text-gray-600">Tidak ada staff dengan filter ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klinik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaffs.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{staff.full_name}</div>
                            <div className="text-sm text-gray-500">@{staff.username}</div>
                            {staff.phone && <div className="text-xs text-gray-400">{staff.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            staff.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                            staff.role === 'Dokter Hewan' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {staff.clinics?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {staff.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {staff.is_online ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Offline
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleActive(staff.id, staff.is_active)}
                            className={`px-3 py-1 rounded-lg font-medium transition ${
                              staff.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {staff.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

