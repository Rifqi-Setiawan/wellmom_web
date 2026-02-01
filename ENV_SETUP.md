# Environment Setup

Buat file `.env.local` di root project. Anda bisa copy dari `.env.example`:

```bash
cp .env.example .env.local
```

Contoh isi `.env.local`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket (opsional, untuk Chat feature)
# Jika tidak diset, akan otomatis dari NEXT_PUBLIC_API_URL (http -> ws, https -> wss)
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
```

## Variabel

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | Ya | Base URL backend REST API (auth, chat, nurse, puskesmas, dll.) |
| `NEXT_PUBLIC_WS_BASE_URL` | Tidak | Base URL WebSocket untuk Chat. Kosong = derive dari `NEXT_PUBLIC_API_URL` |

**Catatan:** Prefix `NEXT_PUBLIC_` diperlukan agar variabel bisa diakses di client (browser). Jangan commit `.env.local` ke git (sudah di `.gitignore`).

## Langkah-langkah

1. Copy `.env.example` ke `.env.local` di root project
2. Isi nilai sesuai environment (dev/production)
3. Restart development server jika sedang running

```bash
npm run dev
```
