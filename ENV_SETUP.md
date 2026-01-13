# Environment Setup

Buat file `.env.local` di root project dengan isi:

```env
# WellMom Environment Variables

# API Base URL
# Ganti dengan URL backend Anda
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Langkah-langkah:

1. Buat file baru dengan nama `.env.local` di root folder project
2. Copy dan paste isi di atas
3. Sesuaikan `NEXT_PUBLIC_API_URL` dengan URL backend Anda
4. Restart development server jika sedang running

```bash
npm run dev
```
