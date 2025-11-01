# Login Credentials

## Informasi Login untuk Admin & Staff

### Default Username & Password

**PASSWORD UNTUK SEMUA AKUN: `admin123`**

⚠️ **Catatan Penting**: Semua akun staff menggunakan password default yang sama. Disarankan untuk mengubah password setelah login pertama kali (fitur dalam pengembangan).

### Daftar Akun Staff

| Username | Nama Lengkap | Role | Klinik | Status |
|----------|--------------|------|--------|--------|
| `dr.ahmad` | Dr. Ahmad Fauzi, S.Pt | Dokter Hewan | Klinik Dinas Perikanan dan Peternakan | Aktif |
| `dr.dedi.psc` | Dr. Dedi Kurniawan, S.Pt | Dokter Hewan | UPT Puskeswan Cibinong | Aktif |
| `dr.gita.psl` | Dr. Gita Maharani, S.Pt | Dokter Hewan | UPT Puskeswan Laladon | Aktif |
| `eko.prasetyo.psb` | Eko Prasetyo, S.Pt | Paramedik Veteriner | UPT Puskeswan Babakanmadang | Aktif |

### Cara Login

1. Buka aplikasi di browser: `http://localhost:3000` (development) atau URL production
2. Klik tombol **"Login"** di header (pojok kanan atas)
3. Masukkan **username** dan **password** (`admin123`)
4. Setelah login berhasil, akan diarahkan ke halaman **Dashboard**

### Fitur Dashboard

Setelah login, admin/staff dapat mengakses:
- Statistik permohonan layanan
- Statistik ulasan pending (untuk approval)
- Quick actions ke halaman layanan
- Logout untuk keluar dari sistem

### Keamanan

⚠️ **PENTING**: 
- Password default `admin123` harus diubah setelah login pertama kali (dalam pengembangan)
- Semua password di-hash menggunakan bcrypt dengan salt rounds 10
- Pastikan menggunakan HTTPS di production

### Reset Password

Jika lupa password, hubungi administrator untuk reset password di database.

---

**Note**: File ini hanya untuk dokumentasi development. Jangan commit file ini jika berisi informasi sensitif production.

