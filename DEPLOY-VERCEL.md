# 🚀 Quick Guide: Deploy ke Vercel

## Langkah Cepat Deploy (5 Menit)

### Step 1: Login ke Vercel
1. Buka: **https://vercel.com/login**
2. Login dengan **GitHub** (paling mudah)

### Step 2: Import Project
1. Setelah login, klik **"Add New..."** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Cari atau paste: `rulikurniawan1983/Integrity`
4. Klik **"Import"**

### Step 3: Configure Project
**Framework Preset**: Next.js (auto-detected ✅)

**Root Directory**: `./` (default)

**Build & Output**: Leave default (Next.js handles this)

### Step 4: ⚠️ SET ENVIRONMENT VARIABLES (PENTING!)

**JANGAN langsung klik Deploy!** Set environment variables dulu:

1. Scroll ke bagian **"Environment Variables"**
2. Klik **"Add"** untuk setiap variable berikut:

#### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://veyrlykbamxveyjzogns.supabase.co` (atau URL Supabase project Anda)
- **Environments**: ✅ Production ✅ Preview ✅ Development

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `your_anon_key` (dari Supabase Dashboard → Settings → API)
- **Environments**: ✅ Production ✅ Preview ✅ Development

#### Variable 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `your_service_role_key` (dari Supabase Dashboard → Settings → API)
- **Environments**: ✅ Production ✅ Preview ✅ Development

**Cara mendapatkan keys:**
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → untuk `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Deploy
1. Setelah semua environment variables di-set, klik **"Deploy"**
2. Tunggu build process (2-5 menit)
3. ✅ Build akan berhasil karena sudah di-fix untuk handle missing env vars

### Step 6: Verify Deployment
Setelah deploy selesai, test:
1. ✅ Homepage loading
2. ✅ Login: `admin.dinas` / `admin123`
3. ✅ Dashboard accessible
4. ✅ Database connection working

## Troubleshooting

### Build Error: "Missing Supabase environment variables"
**Solusi**: Pastikan semua 3 environment variables sudah di-set di Vercel Dashboard

### Runtime Error: Database connection failed
**Solusi**: 
1. Check environment variables di Vercel Dashboard
2. Pastikan values benar (tanpa quotes, tanpa spasi)
3. Redeploy setelah update environment variables

### Page not found / 404
**Solusi**: 
- Next.js routing bekerja secara otomatis
- Pastikan URL benar: `https://your-project.vercel.app`

## Post-Deployment

### Custom Domain (Opsional)
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add custom domain (misal: `slider.diskanak-bogor.go.id`)
3. Follow DNS instructions dari Vercel

### Auto-Deploy
Setelah setup pertama:
- ✅ Setiap push ke `main` → Auto deploy Production
- ✅ Setiap push ke branch lain → Auto deploy Preview

## URLs

**Production**: `https://integrity-[username].vercel.app`  
**Preview**: Setiap branch memiliki URL sendiri

---

**Repository**: https://github.com/rulikurniawan1983/Integrity  
**Butuh bantuan?** Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk detail lengkap.

