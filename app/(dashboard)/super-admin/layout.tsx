'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Search, Bell, HelpCircle, Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (isLoading) {
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
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3B9ECF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">WellMom Health Portal</h1>
                <p className="text-xs text-gray-500">Super Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Puskesmas, staff, or reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
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

              {/* User Profile & Logout */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user?.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'SA'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.full_name || 'Super Admin'}
                    </p>
                    <p className="text-xs text-gray-500">SUPER ADMIN</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">{children}</main>
    </div>
  );
}
