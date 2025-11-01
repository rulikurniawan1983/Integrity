# Deployment Guide - Vercel

## 🚀 Deploy ke Production

### Prerequisites

1. Akun GitHub: https://github.com/rulikurniawan1983/Integrity
2. Akun Vercel: https://vercel.com
3. Environment Variables dari Supabase

### Langkah-langkah Deploy

#### 1. Connect Repository ke Vercel

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Import repository dari GitHub:
   - Pilih repository: `rulikurniawan1983/Integrity`
   - Atau paste URL: `https://github.com/rulikurniawan1983/Integrity.git`

#### 2. Configure Project Settings

**Framework Preset**: Next.js (detected automatically)

**Root Directory**: `./` (leave as default)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

#### 3. Set Environment Variables

Di halaman **"Environment Variables"**, tambahkan:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Catatan Penting**:
- Pilih **"Production"**, **"Preview"**, dan **"Development"** untuk semua environment variables
- Jangan hardcode secrets di kode
- Setelah deploy, pastikan environment variables sudah terset

#### 4. Deploy

1. Klik **"Deploy"**
2. Tunggu build process selesai (biasanya 2-5 menit)
3. Setelah selesai, Anda akan mendapat production URL seperti:
   - `https://integrity.vercel.app` atau
   - `https://integrity-[username].vercel.app`

### Automatic Deployments

Setelah pertama kali deploy, Vercel akan secara otomatis:
- ✅ Deploy setiap push ke branch `main` → **Production**
- ✅ Deploy setiap push ke branch lain → **Preview**

### Custom Domain (Opsional)

1. Di Vercel Dashboard, pilih project
2. Go to **Settings** → **Domains**
3. Add custom domain (misal: `slider.diskanak-bogor.go.id`)
4. Follow DNS instructions dari Vercel

### Verify Deployment

Setelah deploy berhasil, test:

1. ✅ Halaman homepage loading
2. ✅ Login dengan admin: `admin.dinas` / `admin123`
3. ✅ Dashboard accessible
4. ✅ Database connection working
5. ✅ API routes functioning

### Troubleshooting

#### Build Errors

**Error: Environment variables missing**
- ✅ Pastikan semua environment variables sudah di-set di Vercel
- ✅ Pastikan format benar (tanpa quotes)
- ✅ Redeploy setelah menambah environment variables

**Error: Module not found**
- ✅ Pastikan semua dependencies ada di `package.json`
- ✅ Pastikan `npm install` berjalan tanpa error

**Error: Database connection failed**
- ✅ Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan keys sudah benar
- ✅ Pastikan Supabase project tidak paused
- ✅ Check Supabase logs untuk error

#### Runtime Errors

**Error: API route not found**
- ✅ Pastikan file ada di `pages/api/`
- ✅ Pastikan route name sesuai

**Error: Authentication failed**
- ✅ Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah di-set untuk server-side
- ✅ Check Supabase RLS policies

### Post-Deployment Checklist

- [ ] Environment variables sudah di-set
- [ ] Build berhasil tanpa error
- [ ] Homepage accessible
- [ ] Login functionality working
- [ ] Dashboard accessible setelah login
- [ ] Database connection working
- [ ] File upload ke Supabase Storage working
- [ ] Real-time features (chat, online status) working

### Monitoring

- **Vercel Analytics**: Enable di project settings untuk monitor traffic
- **Supabase Dashboard**: Monitor database usage dan API calls
- **Error Tracking**: Check Vercel logs untuk error

### Rollback

Jika ada masalah setelah deploy:

1. Go to **Deployments** tab di Vercel Dashboard
2. Find previous working deployment
3. Klik **"..."** → **"Promote to Production"**

### Production URL

Setelah deploy berhasil, production URL akan terlihat di Vercel Dashboard.

---

**Repository**: https://github.com/rulikurniawan1983/Integrity  
**Last Updated**: November 2024

