"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login?redirect=/admin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="hidden lg:block max-w-screen-lg mx-auto px-4 py-6">
          {children}
        </div>

        {/* Narrow screens: show message (admin not available) */}
        <div className="block lg:hidden min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="max-w-sm text-center p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Halaman Admin</h2>
            <p className="text-neutral-600">Halaman admin tidak tersedia di perangkat seluler. Silakan buka di desktop untuk mengakses fitur admin.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
