# WellMom - Admin Dashboard

> Sistem monitoring kesehatan ibu hamil terintegrasi untuk Puskesmas, Perawat, dan Super Admin Kementerian Kesehatan.

![WellMom](https://img.shields.io/badge/Version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## 📋 Daftar Isi

- [Tentang WellMom](#tentang-wellmom)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Struktur Project](#struktur-project)
- [Autentikasi](#autentikasi)
- [Deployment](#deployment)

## 🌟 Tentang WellMom

WellMom adalah platform digital untuk monitoring kesehatan ibu hamil yang menghubungkan:
- **Super Admin (Kemenkes)**: Mengelola dan approve registrasi puskesmas
- **Admin Puskesmas**: Mengelola perawat dan data ibu hamil
- **Perawat**: Monitoring dan input data pasien ibu hamil

## ✨ Fitur Utama

### Halaman Autentikasi (✅ Selesai)
- ✅ **Login Page**: Login untuk semua role (Super Admin, Puskesmas, Perawat)
- ✅ **Register Page**: Registrasi khusus untuk Puskesmas (status pending, menunggu approval)
- ✅ Form validation dengan Zod
- ✅ Password visibility toggle
- ✅ Remember me functionality
- ✅ Loading states & error handling
- ✅ Responsive design (mobile & desktop)

### Coming Soon
- 🔜 Dashboard Super Admin
- 🔜 Dashboard Puskesmas
- 🔜 Dashboard Perawat
- 🔜 Management Perawat
- 🔜 Data Ibu Hamil
- 🔜 Laporan & Statistik

## 🛠 Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x atau lebih tinggi
- npm, yarn, pnpm, atau bun

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd wellmom_web
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. **Tambahkan logo WellMom**

Simpan file logo dengan nama `logo-wellmom.png` di folder:
```
public/assets/images/logo-wellmom.png
```

Spesifikasi logo:
- Format: PNG dengan background transparan
- Ukuran minimum: 200x200 px
- Ukuran recommended: 512x512 px

5. **Run development server**
```bash
npm run dev
```

6. **Buka browser**
```
http://localhost:3000
```
Akan otomatis redirect ke `/login`

## 📁 Struktur Project

```
wellmom_web/
├── app/
│   ├── (auth)/              # Auth pages group
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── register/
│   │   │   └── page.tsx     # Register page
│   │   └── layout.tsx       # Auth layout
│   ├── globals.css          # Global styles (WellMom colors)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirect to login)
│
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── checkbox.tsx
│
├── lib/
│   ├── api/
│   │   └── auth.ts          # API client untuk auth
│   ├── stores/
│   │   └── auth-store.ts    # Zustand auth store
│   ├── types/
│   │   └── auth.ts          # TypeScript types
│   ├── validations/
│   │   └── auth.ts          # Zod validation schemas
│   └── utils.ts             # Utility functions
│
├── public/
│   └── assets/
│       └── images/
│           └── logo-wellmom.png  # Logo WellMom
│
├── AUTHENTICATION.md        # Dokumentasi lengkap autentikasi
├── ENV_SETUP.md            # Setup environment variables
└── README.md               # This file
```

## 🔐 Autentikasi

Lihat dokumentasi lengkap di [AUTHENTICATION.md](./AUTHENTICATION.md)

### Quick Overview

**Login Flow:**
1. User login di `/login` dengan email + password
2. Backend return role: `super_admin`, `puskesmas`, atau `perawat`
3. Frontend redirect ke dashboard sesuai role

**Register Flow:**
1. Puskesmas register di `/register`
2. Status awal: `pending`
3. Menunggu approval dari Super Admin
4. Tidak bisa login sampai status = `approved`

### User Roles & Routes

| Role | Dashboard Route |
|------|----------------|
| Super Admin | `/super-admin/dashboard` |
| Admin Puskesmas | `/puskesmas/dashboard` |
| Perawat | `/perawat/dashboard` |

## 🎨 Design System

### Colors
- **Primary**: `#3B9ECF` (WellMom Blue)
- **Background**: White `#FFFFFF`
- **Text Primary**: Gray-900
- **Text Secondary**: Gray-600

### Layout
- **Desktop**: Split screen (50% branding, 50% form)
- **Mobile**: Full width form, logo di atas
- **Breakpoint**: 1024px (Tailwind `lg`)

### Typography
- **Heading**: Font Geist Sans, bold
- **Body**: Font Geist Sans, regular
- **Size**: Base 16px, responsive

## 📱 Screenshots

### Login Page
- Split layout dengan branding kiri, form kanan
- Email & password dengan validation
- Remember me & forgot password
- Link ke register page

### Register Page
- Form lengkap untuk registrasi Puskesmas
- 7 fields dengan validation
- Success screen setelah registrasi
- Info tentang approval process

## 🧪 Testing

### Manual Testing Checklist

**Login Page:**
- [ ] Form validation bekerja
- [ ] Toggle password visibility
- [ ] Remember me checkbox
- [ ] Error message saat login gagal
- [ ] Loading state saat submit
- [ ] Redirect berdasarkan role
- [ ] Responsive di mobile & desktop

**Register Page:**
- [ ] Semua field validation
- [ ] Password strength validation
- [ ] Password confirmation match
- [ ] Toggle password visibility
- [ ] Error handling
- [ ] Success screen
- [ ] Responsive di mobile & desktop

## 🐛 Troubleshooting

### Logo tidak muncul
- Pastikan file `logo-wellmom.png` ada di `public/assets/images/`
- Restart dev server
- Clear browser cache

### API Error
- Check `.env.local` sudah dibuat
- Pastikan `NEXT_PUBLIC_API_URL` benar
- Pastikan backend server running

### Build Error
- Run `npm install` ulang
- Check Node.js version (min 20.x)
- Clear `.next` folder: `rm -rf .next`

## 📦 Build & Deploy

### Build Production

```bash
npm run build
```

### Run Production

```bash
npm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code ke GitHub
2. Import project ke Vercel
3. Set environment variables
4. Deploy

### Environment Variables (Production)

Jangan lupa set di Vercel/hosting:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

## 📝 Development Roadmap

### Phase 1: Authentication (✅ Done)
- [x] Login page
- [x] Register page
- [x] Form validation
- [x] API integration structure
- [x] State management

### Phase 2: Dashboards (🔜 Next)
- [ ] Super Admin Dashboard
- [ ] Puskesmas Dashboard
- [ ] Perawat Dashboard
- [ ] Protected routes middleware

### Phase 3: Management Features
- [ ] User management
- [ ] Puskesmas approval system
- [ ] Perawat management
- [ ] Data ibu hamil CRUD

### Phase 4: Monitoring & Reports
- [ ] Real-time monitoring
- [ ] Statistics & charts
- [ ] Export reports
- [ ] Notifications

## 👥 Contributing

Untuk berkontribusi:
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

© 2024 Ministry of Health Republic of Indonesia. All rights reserved.

## 📞 Support

Untuk pertanyaan atau bantuan:
- Email: support@wellmom.go.id
- Documentation: [AUTHENTICATION.md](./AUTHENTICATION.md)
- Issue Tracker: GitHub Issues

---

**Built with ❤️ for Indonesian Healthcare System**
