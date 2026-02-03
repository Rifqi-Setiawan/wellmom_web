"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { nurseApi } from "@/lib/api/nurse";
import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, Home, MessageCircle, MessageSquareText } from "lucide-react";
import { buildImageUrl } from "@/lib/utils";
import { NavigationLoadingBar } from "@/components/ui/navigation-loading-bar";

export default function PerawatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Clear navigation loading when pathname changes (new page ready)
  useEffect(() => {
    if (isNavigating) setIsNavigating(false);
  }, [pathname]);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    console.log("🔄 Perawat Layout: Waiting for hydration...");
    setIsHydrated(true);
    console.log("✅ Perawat Layout: Hydrated");
  }, []);

  // Fetch profile photo setelah auth check berhasil
  useEffect(() => {
    if (isAuthenticated && token && user?.role === "perawat") {
      const fetchProfilePhoto = async () => {
        try {
          const profile = await nurseApi.getMe(token);
          if (profile?.profile_photo_url) {
            setProfilePhoto(profile.profile_photo_url);
          }
        } catch (error) {
          console.error("Failed to fetch profile photo:", error);
        }
      };
      fetchProfilePhoto();
    }
  }, [isAuthenticated, token, user?.role]);

  useEffect(() => {
    console.log("🔍 Perawat Layout: Auth check", {
      isHydrated,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      hasToken: !!token,
    });

    // Don't check auth until Zustand has hydrated
    if (!isHydrated) {
      console.log("⏳ Perawat Layout: Waiting for hydration...");
      return;
    }

    // Check authentication after hydration
    if (!isAuthenticated || !user || user.role !== "perawat") {
      console.log("🚫 Perawat Layout: Auth check failed, redirecting to login");
      console.log("   Details:", {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        expectedRole: "perawat",
        hasToken: !!token,
      });
      router.push("/login");
      return;
    }

    console.log("✅ Perawat Layout: Auth check passed");
    console.log("   User:", {
      role: user.role,
      email: user.email,
      id: user.id,
    });
    setIsLoading(false);
  }, [isAuthenticated, user, token, router, isHydrated]);

  const handleLogout = async () => {
    try {
      if (token) {
        await authApi.logoutPerawat(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // We continue even if API fails to clear local state
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
      </div>
    );
  }

  // Get user initials for profile picture
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      href: "/perawat/dashboard",
      label: "Beranda",
      icon: Home,
    },
    {
      href: "/perawat/pasien",
      label: "Daftar Pasien",
      icon: Users,
    },
    {
      href: "/perawat/forum",
      label: "Forum Diskusi",
      icon: MessageSquareText,
    },
    {
      href: "/perawat/chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      href: "/perawat/pengaturan",
      label: "Pengaturan",
      icon: Settings,
    },
  ];

  const handleNavClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = href.replace(/\/$/, "");
      const current = pathname.replace(/\/$/, "");
      if (current === target || current.startsWith(target + "/")) return;
      e.preventDefault();
      setIsNavigating(true);
      router.push(href);
    };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationLoadingBar show={isNavigating} />
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3B9ECF] rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden shrink-0 relative">
              {profilePhoto ? (
                <img
                  src={buildImageUrl(profilePhoto)}
                  alt={user?.full_name || "Profile"}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={() => {
                    console.error("Failed to load profile photo");
                    setProfilePhoto(null);
                  }}
                />
              ) : null}
              <span className={profilePhoto ? "invisible" : "visible"}>
                {user?.full_name ? getInitials(user.full_name) : "P"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || "Perawat"}
              </p>
              <p className="text-xs text-gray-500 truncate">Bidan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/perawat/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick(item.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#3B9ECF] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Logout Button */}
            <li className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
