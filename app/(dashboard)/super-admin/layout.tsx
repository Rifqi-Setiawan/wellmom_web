'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Bell, HelpCircle, Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    console.log('🔄 Super Admin Layout: Waiting for hydration...');
    setIsHydrated(true);
    console.log('✅ Super Admin Layout: Hydrated');
  }, []);

  useEffect(() => {
    console.log('🔍 Super Admin Layout: Auth check', {
      isHydrated,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      hasToken: !!token,
    });

    // Don't check auth until Zustand has hydrated
    if (!isHydrated) {
      console.log('⏳ Super Admin Layout: Waiting for hydration...');
      return;
    }

    // Check authentication after hydration
    if (!isAuthenticated || !user || user.role !== 'super_admin') {
      console.log('🚫 Super Admin Layout: Auth check failed, redirecting to login');
      console.log('   Details:', {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        expectedRole: 'super_admin',
        hasToken: !!token,
      });
      router.push('/login');
      return;
    }

    console.log('✅ Super Admin Layout: Auth check passed');
    console.log('   User:', { role: user.role, email: user.email, id: user.id });
    setIsLoading(false);
  }, [isAuthenticated, user, token, router, isHydrated]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // Show loading while hydrating or checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Left: User Info */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'SA'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || 'Super Admin'}
              </p>
              <p className="text-xs text-gray-500">SUPER ADMIN</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">{children}</main>
    </div>
  );
}
