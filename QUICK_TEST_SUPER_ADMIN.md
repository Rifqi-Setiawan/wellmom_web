# ⚡ Quick Test Guide - Super Admin Login

## 🚀 Cara Cepat Test Login Super Admin

### 1. Start Development Server
```bash
npm run dev
```

### 2. Buka Browser
```
http://localhost:3000/login
```

### 3. Login sebagai Super Admin

1. **Klik tab "Super Admin"** (🛡️ Shield icon)
2. **Masukkan credentials:**
   - Email: `superadmin@gmail.com`
   - Password: `@Pamelo04`
3. **Klik "Login as Super Admin"**

### 4. Verify Success ✅

Jika berhasil, Anda akan:
- ✅ Di-redirect ke: `http://localhost:3000/super-admin/dashboard`
- ✅ Melihat halaman dengan:
  - Header "Super Admin Dashboard"
  - Success message: "Login Berhasil! 🎉"
  - User info card dengan:
    - Nama lengkap
    - Email
    - Role badge: "Super Admin"
    - User ID
  - Logout button di kanan atas

---

## 📊 What to Check

### Network Tab (DevTools)
```
✅ Request URL: http://103.191.92.29:8000/api/v1/auth/login/super-admin
✅ Method: POST
✅ Status: 200 OK
✅ Response contains: access_token, user, role
```

### Console Tab
```
✅ No errors
✅ Clean console
```

### Application → Local Storage
```
✅ Key: wellmom-auth
✅ Contains: user data, token, isAuthenticated: true
```

---

## 🎯 Success Indicators

### On Login Page:
1. ✅ Tab "Super Admin" active (white background)
2. ✅ Email placeholder shows government-style email
3. ✅ Button text: "Login as Super Admin"
4. ✅ Loading spinner appears when submitting
5. ✅ No errors shown

### On Dashboard:
1. ✅ URL changed to `/super-admin/dashboard`
2. ✅ Header shows "Super Admin Dashboard"
3. ✅ Green checkmark icon visible
4. ✅ User full name displayed
5. ✅ Email matches what you entered
6. ✅ Role badge shows "Super Admin"
7. ✅ Logout button present

### State Persistence:
1. ✅ Refresh page (F5) → still logged in
2. ✅ Close tab, reopen → still logged in
3. ✅ Click logout → returned to login page

---

## ❌ Common Errors & Quick Fixes

### Error: "Network Error"
**Fix:** Check if backend API is running on `http://103.191.92.29:8000`

### Error: "401 Unauthorized"
**Fix:** Verify credentials:
- Email: `superadmin@gmail.com`
- Password: `@Pamelo04`

### Error: Dashboard not showing
**Fix:** Check console for errors, verify redirect logic

### Error: CORS issue
**Fix:** Backend needs to allow `http://localhost:3000` origin

---

## 🔄 Quick Re-test

To test again:
1. Click "Logout" button
2. You'll be at `/login` again
3. Repeat steps 3-4 above

---

## 📸 Expected Screenshots

### Login Page - Super Admin Tab Selected
```
┌─────────────────────────────────────────┐
│  Welcome to WellMom                     │
│                                         │
│  [🛡️ Super Admin] [Puskesmas] [Perawat]│
│   ← Active (white)                      │
│                                         │
│  📧 Email: superadmin@gmail.com         │
│  🔒 Password: ••••••••••  👁️            │
│                                         │
│  [    Login as Super Admin    ]        │
└─────────────────────────────────────────┘
```

### Dashboard - After Successful Login
```
┌─────────────────────────────────────────┐
│  WellMom | Super Admin Dashboard        │
│                               [Logout]   │
├─────────────────────────────────────────┤
│                                         │
│         ✅ Login Berhasil! 🎉          │
│                                         │
│     Selamat datang di Dashboard         │
│          Super Admin WellMom            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Informasi Akun                  │ │
│  │   Nama: Super Admin WellMom       │ │
│  │   Email: superadmin@gmail.com     │ │
│  │   Role: [Super Admin]             │ │
│  │   User ID: 1                      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ⏱️ Expected Timing

- Login request: **< 2 seconds**
- Redirect: **< 0.5 seconds**
- Dashboard load: **< 1 second**
- **Total: < 3 seconds**

---

## ✅ Test Passed If:

- [x] Login successful dengan credentials yang diberikan
- [x] Redirect ke `/super-admin/dashboard` otomatis
- [x] Dashboard menampilkan user info dengan benar
- [x] No console errors
- [x] State persist after refresh
- [x] Logout works

---

**Status:** ✅ Ready to Test!

**Next:** Setelah test berhasil, lanjut ke dashboard Puskesmas & Perawat
