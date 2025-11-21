"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [authCheckAttempted, setAuthCheckAttempted] = useState(false);

  useEffect(() => {
    // BUG FIX: Prevent premature redirect during auth check
    // Force re-check auth on mount to handle token refresh
    const initializeAuth = async () => {
      // Force checkAuth on mount/refresh to validate current token
      if (!authCheckAttempted) {
        setAuthCheckAttempted(true);
        await checkAuth();
        return; // Wait for next render with updated user state
      }

      // After auth check is complete
      if (!loading) {
        if (!user) {
          // No user found after loading complete - redirect to login
          router.push("/login?redirect=/admin");
        } else if (user.role !== "admin") {
          // User exists but not admin - redirect to dashboard
          router.push("/dashboard");
        } else {
          // User is admin - ready to render
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();
  }, [user, loading, router, checkAuth, authCheckAttempted]);

  // Show loading state while checking authentication
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-16 bg-white border-b border-neutral-200 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white rounded-lg shadow-sm animate-pulse" />
            <div className="h-32 bg-white rounded-lg shadow-sm animate-pulse" />
            <div className="h-32 bg-white rounded-lg shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Only render admin content if user is confirmed admin
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 overflow-auto">
        {/* Desktop / tablet: constrained centered container */}
        <div className="hidden lg:block mx-auto px-4 py-6">{children}</div>

        {/* Narrow screens: show message (admin not available) */}
        <div className="lg:hidden min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="max-w-sm text-center p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Halaman Admin
            </h2>
            <p className="text-neutral-600">
              Halaman admin tidak tersedia di perangkat seluler. Silakan buka di
              desktop untuk mengakses fitur admin.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
