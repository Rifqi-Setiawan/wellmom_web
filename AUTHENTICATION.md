# WellMom Authentication System

Dokumentasi lengkap untuk sistem autentikasi WellMom Admin Dashboard.

## 📁 Struktur File

```
wellmom_web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Halaman Login
│   │   ├── register/
│   │   │   └── page.tsx          # Halaman Register (Puskesmas)
│   │   └── layout.tsx            # Layout untuk auth pages
│   └── globals.css               # Updated dengan warna WellMom
├── lib/
│   ├── api/
│   │   └── auth.ts               # API client untuk autentikasi
│   ├── stores/
│   │   └── auth-store.ts         # Zustand store untuk auth state
│   ├── types/
│   │   └── auth.ts               # TypeScript types & interfaces
│   └── validations/
│       └── auth.ts               # Zod schemas untuk validasi form
├── components/ui/                # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── checkbox.tsx
└── public/assets/images/
    └── logo-wellmom.png          # Logo WellMom (letakkan di sini)
```

## 🎨 Design System

### Warna
- **Primary**: `#3B9ECF` (Biru WellMom)
- **Background Branding**: `#3B9ECF`
- **Background Form**: White (`#FFFFFF`)
- **Text**: Gray-900 untuk heading, Gray-600 untuk body

### Komponen
- Button: shadcn/ui Button dengan custom warna WellMom
- Input: shadcn/ui Input dengan icon prefix
- Checkbox: shadcn/ui Checkbox
- Label: shadcn/ui Label

## 🔐 Flow Autentikasi

### Login Flow

1. **Semua role** (Super Admin, Admin Puskesmas, Perawat) login di `/login`
2. Input: Email + Password
3. Backend response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@puskesmas.go.id",
      "name": "Nama User",
      "role": "puskesmas" | "super_admin" | "perawat"
    },
    "token": "jwt_token"
  }
}
```
4. Frontend redirect berdasarkan role:
   - `super_admin` → `/super-admin/dashboard`
   - `puskesmas` → `/puskesmas/dashboard`
   - `perawat` → `/perawat/dashboard`

### Register Flow (Hanya Puskesmas)

1. User mengisi form di `/register`
2. Data yang dikirim:
```json
{
  "nama_puskesmas": "Puskesmas Kecamatan Cilandak",
  "email": "puskesmas@example.go.id",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "alamat": "Jl. Example No. 123, Jakarta Selatan",
  "no_telepon": "08123456789",
  "nama_kepala_puskesmas": "dr. John Doe"
}
```
3. Backend response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "puskesmas@example.go.id",
    "nama_puskesmas": "Puskesmas Kecamatan Cilandak",
    "status": "pending"
  },
  "message": "Registrasi berhasil. Menunggu approval dari Super Admin."
}
```
4. Tampilkan success screen dengan informasi bahwa akun pending approval
5. User **belum bisa login** sampai diapprove oleh Super Admin

## 📝 Validasi Form

### Login
- Email: Required, valid email format
- Password: Required, minimal 8 karakter

### Register
- Nama Puskesmas: Required, minimal 3 karakter
- Email: Required, valid email format
- Password: Required, minimal 8 karakter, harus mengandung:
  - Minimal 1 huruf besar
  - Minimal 1 huruf kecil
  - Minimal 1 angka
- Konfirmasi Password: Harus sama dengan password
- Alamat: Required, minimal 10 karakter
- No. Telepon: Required, format Indonesia (08xxx atau +62xxx)
- Nama Kepala Puskesmas: Required, minimal 3 karakter

## 🔧 API Endpoints

**Base URL**: Konfigurasi di `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Endpoints

#### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "admin@puskesmas.go.id",
  "password": "password123",
  "remember": true
}
```

#### Register Puskesmas
```
POST /auth/register/puskesmas
Content-Type: application/json

Body: (lihat RegisterRequest di lib/types/auth.ts)
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {token}
```

## 💾 State Management

Menggunakan **Zustand** dengan **persist middleware** untuk menyimpan auth state.

### Auth Store (`lib/stores/auth-store.ts`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}
```

### Cara Menggunakan

```typescript
import { useAuthStore } from '@/lib/stores/auth-store';

function MyComponent() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  // Access user data
  console.log(user.role); // 'super_admin' | 'puskesmas' | 'perawat'
}
```

## 🚀 Cara Menjalankan

1. **Install dependencies** (jika belum):
```bash
npm install
```

2. **Konfigurasi environment variables**:
Buat file `.env.local` di root project:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. **Tambahkan logo WellMom**:
Simpan file `logo-wellmom.png` di folder `public/assets/images/`

4. **Jalankan development server**:
```bash
npm run dev
```

5. **Akses halaman**:
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register

## 🧪 Testing Checklist

### Login Page
- [ ] Form validation bekerja dengan baik
- [ ] Toggle password visibility berfungsi
- [ ] Remember me checkbox berfungsi
- [ ] Error message muncul saat login gagal
- [ ] Loading state saat submit
- [ ] Redirect ke dashboard sesuai role setelah login berhasil
- [ ] Link ke register page berfungsi
- [ ] Responsive di mobile dan desktop

### Register Page
- [ ] Semua field validation bekerja
- [ ] Password strength validation
- [ ] Password confirmation match validation
- [ ] Toggle password visibility berfungsi
- [ ] Error message muncul saat register gagal
- [ ] Success screen muncul setelah register berhasil
- [ ] Link ke login page berfungsi
- [ ] Responsive di mobile dan desktop

## 📱 Responsive Design

- **Desktop (lg dan ke atas)**: Split screen 50:50 (branding kiri, form kanan)
- **Mobile (kurang dari lg)**: Full width form, logo di atas
- Breakpoint menggunakan Tailwind CSS default (lg = 1024px)

## 🎯 Next Steps

Setelah autentikasi selesai, Anda perlu membuat:

1. **Dashboard Pages**:
   - `/super-admin/dashboard`
   - `/puskesmas/dashboard`
   - `/perawat/dashboard`

2. **Protected Routes**:
   Buat middleware atau component untuk protect routes berdasarkan authentication dan role

3. **Forgot Password Flow**:
   Implementasi forgot password page (`/forgot-password`)

4. **Profile Management**:
   Halaman untuk user update profile mereka

## 🐛 Troubleshooting

### Logo tidak muncul
- Pastikan file `logo-wellmom.png` ada di `public/assets/images/`
- Clear cache browser dan reload

### API Error 404
- Pastikan `NEXT_PUBLIC_API_URL` di `.env.local` sudah benar
- Pastikan backend server sudah running

### Form tidak bisa submit
- Check browser console untuk error
- Pastikan semua field terisi dengan benar sesuai validasi

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim development WellMom.

---

**Last Updated**: January 2026
**Version**: 1.0.0
