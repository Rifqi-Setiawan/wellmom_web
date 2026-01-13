# 🚀 WellMom Quick Start Guide

Panduan cepat untuk menjalankan WellMom Admin Dashboard.

## ⚡ Quick Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Buat file `.env.local` di root folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Tambahkan Logo
Simpan logo WellMom sebagai `logo-wellmom.png` di:
```
public/assets/images/logo-wellmom.png
```

> **Note**: Jika belum ada logo, aplikasi tetap jalan tapi akan muncul broken image icon.

### 4. Run Dev Server
```bash
npm run dev
```

### 5. Buka Browser
```
http://localhost:3000
```

Akan otomatis redirect ke halaman login! 🎉

## 📍 Available Routes

- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register

## 🎯 What's Working

✅ Login page dengan form validation
✅ Register page untuk Puskesmas
✅ Password toggle visibility
✅ Remember me checkbox
✅ Form error handling
✅ Loading states
✅ Responsive design (mobile & desktop)
✅ WellMom branding & colors

## 🔧 What You Need to Build Next

### Backend Integration
Pastikan backend API Anda memiliki endpoints:

1. **POST /api/auth/login**
```json
Request:
{
  "email": "admin@puskesmas.go.id",
  "password": "password123",
  "remember": true
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@puskesmas.go.id",
      "name": "Admin Name",
      "role": "puskesmas"
    },
    "token": "jwt_token_here"
  }
}
```

2. **POST /api/auth/register/puskesmas**
```json
Request:
{
  "nama_puskesmas": "Puskesmas Cilandak",
  "email": "puskesmas@example.go.id",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "alamat": "Jl. Example No. 123",
  "no_telepon": "08123456789",
  "nama_kepala_puskesmas": "dr. John Doe"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "puskesmas@example.go.id",
    "nama_puskesmas": "Puskesmas Cilandak",
    "status": "pending"
  },
  "message": "Registrasi berhasil"
}
```

### Dashboard Pages (Next Step)
Buat halaman dashboard untuk masing-masing role:

1. `app/(dashboard)/super-admin/dashboard/page.tsx`
2. `app/(dashboard)/puskesmas/dashboard/page.tsx`
3. `app/(dashboard)/perawat/dashboard/page.tsx`

### Protected Routes
Buat middleware untuk protect routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  // Redirect to login if not authenticated
}

export const config = {
  matcher: ['/super-admin/:path*', '/puskesmas/:path*', '/perawat/:path*'],
};
```

## 📚 Documentation

- **Full Authentication Docs**: [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Project README**: [README.md](./README.md)
- **Environment Setup**: [ENV_SETUP.md](./ENV_SETUP.md)

## 🆘 Common Issues

### ❌ Module not found
```bash
npm install
```

### ❌ Port 3000 already in use
```bash
# Change port
npm run dev -- -p 3001
```

### ❌ API Error / Network Error
- Check backend is running
- Check `.env.local` file exists
- Check `NEXT_PUBLIC_API_URL` is correct

### ❌ Logo not showing
- Add `logo-wellmom.png` to `public/assets/images/`
- Restart dev server
- Clear browser cache

## ✅ Testing the Pages

### Test Login Page
1. Go to http://localhost:3000/login
2. Try submit without filling form → Should show errors
3. Enter invalid email → Should show "Format email tidak valid"
4. Enter password < 8 chars → Should show "Password minimal 8 karakter"
5. Click eye icon → Password should toggle visibility
6. Check "Remember me" → Should check the checkbox
7. Click "Daftar sebagai Puskesmas" → Should go to register page

### Test Register Page
1. Go to http://localhost:3000/register
2. Try submit empty form → Should show all required errors
3. Enter mismatched passwords → Should show "Password tidak cocok"
4. Enter weak password → Should show password requirements
5. Enter invalid phone → Should show "Format nomor telepon tidak valid"
6. Fill all fields correctly → Should show success screen
7. Click "Kembali ke Login" → Should go to login page

## 🎨 Customization

### Change Primary Color
Edit `app/globals.css`:
```css
/* Line 57: Change WellMom primary color */
--primary: oklch(0.63 0.095 231.5); /* Current: #3B9ECF */
```

### Change Logo
Replace `public/assets/images/logo-wellmom.png` with your logo.

### Change Branding Text
Edit login/register pages:
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

Look for the branding section (left side on desktop).

## 📦 Build for Production

```bash
# Build
npm run build

# Run production build locally
npm start
```

## 🚀 Deploy

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Go to https://vercel.com
3. Import repository
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

### Deploy to Other Platforms
- Netlify: Use Next.js plugin
- Railway: Auto-detect Next.js
- AWS/GCP: Use Docker or platform-specific guides

---

## 🎉 You're All Set!

Aplikasi login dan register sudah siap digunakan. Selanjutnya tinggal:
1. Integrasikan dengan backend API
2. Buat dashboard pages
3. Tambahkan fitur management

Happy coding! 💙

**Need help?** Check [AUTHENTICATION.md](./AUTHENTICATION.md) untuk detail lengkap.
