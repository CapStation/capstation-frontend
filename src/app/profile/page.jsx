"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, UserCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsLoadingProfile(false);
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">User Profile</h1>
          <p className="text-muted-foreground mt-2">
            Informasi profil pengguna Anda
          </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
              <CardDescription>
                Detail informasi akun Anda di CapStation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nama Lengkap */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nama Lengkap
                  </p>
                  <p className="text-base font-semibold text-neutral-900">
                    {user?.name || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="text-base font-semibold text-neutral-900 break-all">
                    {user?.email || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                  {user?.isVerified !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        user.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.isVerified
                        ? "✓ Terverifikasi"
                        : "⏳ Belum Terverifikasi"}
                    </span>
                  )}
                  {user?.isVerified === undefined && (
                    <span className="text-xs text-muted-foreground italic mt-2 block">
                      Loading status...
                    </span>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Role
                  </p>
                  <p className="text-base font-semibold text-neutral-900 capitalize">
                    {user?.role || (
                      <span className="text-muted-foreground italic">
                        Loading...
                      </span>
                    )}
                  </p>
                  {user?.role && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.role === "mahasiswa"
                        ? "Akses penuh untuk mengelola proyek capstone"
                        : user.role === "dosen"
                        ? "Akses pembimbing dan pengelolaan dokumen"
                        : "Akses administrator penuh"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  Status Akun
                </span>
                <span className="text-sm font-medium text-green-600">
                  {user?.isVerified !== undefined ? (
                    user.isVerified ? (
                      "Aktif & Terverifikasi"
                    ) : (
                      "Belum Terverifikasi"
                    )
                  ) : (
                    <span className="text-muted-foreground italic">
                      Loading...
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Member Since
                </span>
                <span className="text-sm font-medium">
                  {user?.createdAt ? (
                    new Date(user.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="text-muted-foreground italic">
                      Loading...
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
