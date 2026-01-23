'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { puskesmasApi } from '@/lib/api/puskesmas';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LogOut,
} from 'lucide-react';



  export default function PuskesmasLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, clearAuth, puskesmasInfo } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [buildingPhotoUrl, setBuildingPhotoUrl] = useState<string | null>(null);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    console.log('🔄 Puskesmas Layout: Waiting for hydration...');
    setIsHydrated(true);
    console.log('✅ Puskesmas Layout: Hydrated');
  }, []);

  useEffect(() => {
    console.log('🔍 Puskesmas Layout: Auth check', {
      isHydrated,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      hasToken: !!token,
    });

    // Don't check auth until Zustand has hydrated
    if (!isHydrated) {
      console.log('⏳ Puskesmas Layout: Waiting for hydration...');
      return;
    }

    // Check authentication after hydration
    if (!isAuthenticated || !user || user.role !== 'puskesmas') {
      console.log('🚫 Puskesmas Layout: Auth check failed, redirecting to login');
      console.log('   Details:', {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        expectedRole: 'puskesmas',
        hasToken: !!token,
      });
      router.push('/login');
      return;
    }

    console.log('✅ Puskesmas Layout: Auth check passed');
    console.log('   User:', { role: user.role, email: user.email, id: user.id });
    setIsLoading(false);
  }, [isAuthenticated, user, token, router, isHydrated]);

  const fetchBuildingPhoto = useCallback(async () => {
    if (!token) return;
    try {
      const data = await puskesmasApi.getPuskesmasProfile(token);
      setBuildingPhotoUrl(data.building_photo_url);
    } catch (error) {
      console.error('Failed to fetch building photo:', error);
    }
  }, [token]);

  useEffect(() => {
    // Fetch building photo if puskesmas info is available
    if (token && puskesmasInfo && isAuthenticated) {
      fetchBuildingPhoto();
    }
  }, [token, puskesmasInfo, isAuthenticated, fetchBuildingPhoto]);

  const handleLogout = async () => {
    try {
      if (token) {
        await authApi.logoutPuskesmas(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/puskesmas/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Kelola Perawat',
      href: '/puskesmas/dashboard/perawat',
      icon: UserCheck,
    },
    {
      name: 'Manajemen Pasien',
      href: '/puskesmas/dashboard/ibu-hamil',
      icon: Users,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed/Sticky */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm">
        {/* Profile Puskesmas */}
        <Link href="/puskesmas/profile" className="p-6 border-b border-gray-200 shrink-0 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            {buildingPhotoUrl ? (
              <img
                src={buildingPhotoUrl.startsWith('http') ? buildingPhotoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000'}${buildingPhotoUrl}`}
                alt="Foto Gedung"
                className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white"
                onError={() => setBuildingPhotoUrl(null)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm ring-2 ring-white">
                <span className="text-base font-semibold text-white">
                  {user?.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'AP'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || 'Admin Puskesmas'}
              </p>
              <p className="text-xs text-gray-500 font-medium truncate">
                {puskesmasInfo?.name || 'Puskesmas'}
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Special handling for Dashboard - only active if pathname is exactly /puskesmas/dashboard or /puskesmas/dashboard/
              // For other menu items, check if pathname starts with the href
              let isActive = false;
              if (item.href === '/puskesmas/dashboard') {
                // Dashboard is only active if pathname is exactly /puskesmas/dashboard or /puskesmas/dashboard/
                isActive = pathname === item.href || pathname === item.href + '/';
              } else {
                // Other menu items are active if pathname starts with their href
                isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3B9ECF] to-[#2d7ba8] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#3B9ECF]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#3B9ECF]'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#3B9ECF]'
                    }`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </Link>
                </li>
              );
            })}
            
            {/* Logout Button */}
            <li className="mt-2">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content - With left margin for sidebar */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
