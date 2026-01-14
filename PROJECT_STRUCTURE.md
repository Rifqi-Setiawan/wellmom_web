# 📁 WellMom Project Structure - Multi-Role Architecture

## 🎯 Overview

WellMom memiliki **3 role utama**:
1. **Super Admin** - Kementerian Kesehatan (mengelola puskesmas)
2. **Puskesmas** - Admin Puskesmas (mengelola perawat dan data)
3. **Perawat** - Perawat Puskesmas (monitoring ibu hamil)

---

## 📂 Recommended Folder Structure

```
wellmom_web/
├── app/
│   ├── (auth)/                           # 🔓 Public Routes (No Auth Required)
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page (all roles)
│   │   ├── register/
│   │   │   └── page.tsx                  # Register page (puskesmas only)
│   │   ├── forgot-password/
│   │   │   └── page.tsx                  # Forgot password
│   │   └── layout.tsx                    # Auth layout
│   │
│   ├── (dashboard)/                      # 🔒 Protected Routes (Auth Required)
│   │   ├── super-admin/                  # 👑 Super Admin Routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Super admin dashboard
│   │   │   ├── puskesmas/
│   │   │   │   ├── page.tsx              # Puskesmas list
│   │   │   │   ├── pending/
│   │   │   │   │   └── page.tsx          # Pending approvals
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Puskesmas detail
│   │   │   ├── perawat/
│   │   │   │   └── page.tsx              # All perawat list
│   │   │   ├── reports/
│   │   │   │   └── page.tsx              # Reports & analytics
│   │   │   ├── settings/
│   │   │   │   └── page.tsx              # System settings
│   │   │   └── layout.tsx                # Super admin layout
│   │   │
│   │   ├── puskesmas/                    # 🏥 Puskesmas Routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Puskesmas dashboard
│   │   │   ├── perawat/
│   │   │   │   ├── page.tsx              # Perawat management
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx          # Add perawat
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Perawat detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx      # Edit perawat
│   │   │   ├── ibu-hamil/
│   │   │   │   ├── page.tsx              # Ibu hamil list
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx          # Add ibu hamil
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Ibu hamil detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx      # Edit ibu hamil
│   │   │   ├── laporan/
│   │   │   │   └── page.tsx              # Reports
│   │   │   ├── profile/
│   │   │   │   └── page.tsx              # Puskesmas profile
│   │   │   └── layout.tsx                # Puskesmas layout
│   │   │
│   │   └── perawat/                      # 👩‍⚕️ Perawat Routes
│   │       ├── dashboard/
│   │       │   └── page.tsx              # Perawat dashboard
│   │       ├── pasien/
│   │       │   ├── page.tsx              # Pasien list
│   │       │   ├── tambah/
│   │       │   │   └── page.tsx          # Add pasien
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # Pasien detail
│   │       │       ├── checkup/
│   │       │       │   └── page.tsx      # Add checkup record
│   │       │       └── riwayat/
│   │       │           └── page.tsx      # Checkup history
│   │       ├── jadwal/
│   │       │   └── page.tsx              # Schedule
│   │       ├── profile/
│   │       │   └── page.tsx              # Perawat profile
│   │       └── layout.tsx                # Perawat layout
│   │
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Home (redirect to login)
│
├── components/
│   ├── ui/                               # 🎨 shadcn/ui Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── shared/                           # 🔄 Shared Components (All Roles)
│   │   ├── header/
│   │   │   └── dashboard-header.tsx      # Reusable header
│   │   ├── sidebar/
│   │   │   └── dashboard-sidebar.tsx     # Reusable sidebar
│   │   ├── cards/
│   │   │   ├── stat-card.tsx             # Metric card
│   │   │   └── info-card.tsx             # Info card
│   │   ├── tables/
│   │   │   ├── data-table.tsx            # Reusable table
│   │   │   └── pagination.tsx            # Pagination
│   │   ├── modals/
│   │   │   ├── confirm-modal.tsx         # Confirmation modal
│   │   │   └── form-modal.tsx            # Form modal
│   │   ├── forms/
│   │   │   └── form-fields.tsx           # Common form fields
│   │   └── loading/
│   │       ├── spinner.tsx               # Loading spinner
│   │       └── skeleton.tsx              # Skeleton loader
│   │
│   ├── super-admin/                      # 👑 Super Admin Specific
│   │   ├── puskesmas-approval-card.tsx
│   │   ├── platform-stats.tsx
│   │   └── activity-log.tsx
│   │
│   ├── puskesmas/                        # 🏥 Puskesmas Specific
│   │   ├── perawat-card.tsx
│   │   ├── patient-overview.tsx
│   │   └── monthly-report.tsx
│   │
│   └── perawat/                          # 👩‍⚕️ Perawat Specific
│       ├── checkup-form.tsx
│       ├── patient-card.tsx
│       └── risk-indicator.tsx
│
├── lib/
│   ├── api/                              # 🔌 API Clients
│   │   ├── auth.ts                       # Authentication API
│   │   ├── statistics.ts                 # Statistics API
│   │   ├── puskesmas.ts                  # Puskesmas API
│   │   ├── perawat.ts                    # Perawat API
│   │   ├── ibu-hamil.ts                  # Ibu hamil API
│   │   └── checkup.ts                    # Checkup API
│   │
│   ├── stores/                           # 💾 State Management (Zustand)
│   │   ├── auth-store.ts                 # Auth state
│   │   ├── puskesmas-store.ts            # Puskesmas state
│   │   ├── perawat-store.ts              # Perawat state
│   │   └── ui-store.ts                   # UI state (sidebar, modals)
│   │
│   ├── types/                            # 📝 TypeScript Types
│   │   ├── auth.ts                       # Auth types
│   │   ├── statistics.ts                 # Statistics types
│   │   ├── puskesmas.ts                  # Puskesmas types
│   │   ├── perawat.ts                    # Perawat types
│   │   ├── ibu-hamil.ts                  # Ibu hamil types
│   │   └── common.ts                     # Common types
│   │
│   ├── validations/                      # ✅ Zod Validation Schemas
│   │   ├── auth.ts                       # Auth validation
│   │   ├── puskesmas.ts                  # Puskesmas validation
│   │   ├── perawat.ts                    # Perawat validation
│   │   └── ibu-hamil.ts                  # Ibu hamil validation
│   │
│   ├── hooks/                            # 🪝 Custom React Hooks
│   │   ├── use-auth.ts                   # Auth hooks
│   │   ├── use-statistics.ts             # Statistics hooks
│   │   ├── use-pagination.ts             # Pagination hooks
│   │   └── use-debounce.ts               # Debounce hook
│   │
│   ├── constants/                        # 📌 Constants
│   │   ├── routes.ts                     # Route paths
│   │   ├── roles.ts                      # User roles
│   │   └── status.ts                     # Status constants
│   │
│   └── utils.ts                          # 🛠️ Utility functions
│
├── public/
│   └── assets/
│       └── images/
│           ├── logo-wellmom.png          # Logo
│           └── placeholder.png           # Placeholders
│
├── middleware.ts                         # 🔒 Route Protection Middleware
│
├── .env.local                            # 🔐 Environment variables
├── .env.example                          # 📋 Example env file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 Key Principles

### 1. **Route Organization by Role**
```
(dashboard)/
├── super-admin/    → Only super admin can access
├── puskesmas/      → Only puskesmas can access
└── perawat/        → Only perawat can access
```

### 2. **Component Organization by Reusability**
```
components/
├── ui/             → Basic UI components (buttons, inputs)
├── shared/         → Shared across all roles (header, sidebar)
├── super-admin/    → Super admin specific
├── puskesmas/      → Puskesmas specific
└── perawat/        → Perawat specific
```

### 3. **Separation of Concerns**
```
lib/
├── api/            → API calls
├── stores/         → State management
├── types/          → Type definitions
├── validations/    → Form validations
└── hooks/          → Reusable logic
```

---

## 🔒 Route Protection Strategy

### Middleware (`middleware.ts`)
```typescript
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('wellmom-auth')?.value;
  
  // Protect dashboard routes
  if (path.startsWith('/super-admin')) {
    // Check super admin role
  }
  if (path.startsWith('/puskesmas')) {
    // Check puskesmas role
  }
  if (path.startsWith('/perawat')) {
    // Check perawat role
  }
}
```

---

## 📋 Migration Plan

### Phase 1: Create New Structure ✅
- Create all necessary folders
- Move existing files to new locations

### Phase 2: Refactor Components 🔄
- Extract shared components
- Create role-specific components

### Phase 3: Add Missing Routes 📍
- Create puskesmas dashboard
- Create perawat dashboard
- Add CRUD pages

### Phase 4: Implement Middleware 🔒
- Route protection
- Role-based access control

---

## 🚀 Benefits

### ✅ **Scalability**
- Easy to add new features per role
- Clear separation of concerns

### ✅ **Maintainability**
- Easy to find files
- Consistent structure

### ✅ **Reusability**
- Shared components reduce duplication
- DRY principle

### ✅ **Type Safety**
- Centralized types
- Better IDE support

### ✅ **Team Collaboration**
- Clear boundaries
- Easy to assign tasks

---

## 📝 Naming Conventions

### Files
- `kebab-case` for files: `user-profile.tsx`
- `PascalCase` for components: `UserProfile`
- `camelCase` for functions: `fetchUserData`

### Folders
- `kebab-case`: `ibu-hamil/`, `super-admin/`
- Group by feature: `puskesmas/perawat/`

### Routes
- `kebab-case`: `/super-admin/puskesmas/`
- Plural for collections: `/patients/`, `/reports/`
- Singular for single items: `/patient/[id]/`

---

## 🎨 Component Structure Example

### Shared Component
```
components/shared/cards/stat-card.tsx
```
Used by: Super Admin, Puskesmas, Perawat

### Role-Specific Component
```
components/puskesmas/perawat-card.tsx
```
Used by: Puskesmas only

---

## 🔄 Import Path Examples

```typescript
// UI Components
import { Button } from '@/components/ui/button';

// Shared Components
import { StatCard } from '@/components/shared/cards/stat-card';

// Role-Specific Components
import { PerawatCard } from '@/components/puskesmas/perawat-card';

// API
import { authApi } from '@/lib/api/auth';

// Types
import type { Puskesmas } from '@/lib/types/puskesmas';

// Hooks
import { useAuth } from '@/lib/hooks/use-auth';
```

---

## 📊 Next Steps

1. ✅ **Review & Approve Structure**
2. 🔄 **Migrate Existing Files**
3. 📝 **Create Missing Components**
4. 🎨 **Build Dashboard Layouts**
5. 🔒 **Implement Middleware**
6. ✅ **Test All Routes**

---

**Ready to implement? Let's migrate! 🚀**
