'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';
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
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo & Branding */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#3B9ECF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏥</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Admin Puskesmas</h1>
              <p className="text-xs text-gray-500">SISTEM MANAJEMEN</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#3B9ECF] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'SR'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'Staf Registrasi'}
              </p>
              <p className="text-xs text-gray-500">Kementerian Kesehatan</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
             <LogOut className="w-5 h-5" />
             <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
