"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, GraduationCap, Users } from "lucide-react";
import OAuthService from "@/services/OAuthService";

function OAuthSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuth } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [setupToken, setSetupToken] = useState("");

  useEffect(() => {
    // BUG FIX #3: Check if user already has approved role FIRST
    // If user is already authenticated with approved role, redirect to dashboard
    const checkExistingAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Try to get current user profile
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const currentUser = data.user || data;

            // If user has approved role, redirect to dashboard
            if (currentUser.role && currentUser.roleApproved) {
              toast({
                title: "Sudah Terautentikasi",
                description:
                  "Anda sudah memiliki akses ke aplikasi. Mengarahkan ke dashboard...",
                variant: "default",
              });
              setTimeout(() => router.push("/dashboard"), 1000);
              return;
            }

            // If user has pending role, redirect to account-pending
            if (currentUser.pendingRole && !currentUser.roleApproved) {
              toast({
                title: "Menunggu Persetujuan",
                description: "Akun Anda sedang menunggu persetujuan admin.",
                variant: "default",
              });
              setTimeout(
                () => router.push("/account-pending?reason=role_approval"),
                1000
              );
              return;
            }
          }
        } catch (error) {
          console.log("No existing auth or token invalid - proceed with setup");
        }
      }

      // No existing auth or auth invalid - proceed with setup token
      const setupTokenFromURL = OAuthService.getSetupTokenFromURL(searchParams);

      if (!setupTokenFromURL) {
        setError("Token setup tidak ditemukan. Silakan login ulang.");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (!OAuthService.isValidSetupToken(setupTokenFromURL)) {
        setError("Token setup tidak valid. Silakan login ulang.");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      setSetupToken(setupTokenFromURL);
    };

    checkExistingAuth();
  }, [searchParams, router, toast]);

  const handleRoleSelection = async (role) => {
    if (!setupToken) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedRole(role);

    try {
      const result = await loginWithOAuth(setupToken, role);

      if (result.success) {
        // BUG FIX #3: Handle already approved users
        if (result.alreadyApproved && result.redirectTo) {
          toast({
            title: "Sudah Terautentikasi",
            description:
              result.message ||
              "Anda sudah memiliki akses. Mengarahkan ke dashboard...",
            variant: "default",
          });
          setTimeout(() => router.push(result.redirectTo), 1000);
          return;
        }

        // Handle pending users with specific redirect
        if (result.isPending && result.redirectTo) {
          toast({
            title: "Menunggu Persetujuan Admin",
            description: result.message,
            variant: "default",
            duration: 5000,
          });
          setTimeout(() => router.push(result.redirectTo), 1500);
          return;
        }

        if (result.isPending) {
          // All OAuth users require admin approval
          toast({
            title: "Menunggu Persetujuan Admin",
            description:
              result.message ||
              "Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan dari admin. Anda akan diberitahu melalui email setelah disetujui.",
            variant: "default",
            duration: 5000,
          });

          // Redirect to account-pending page
          setTimeout(() => {
            router.push("/account-pending?reason=role_approval");
          }, 1500);
        } else {
          // This shouldn't happen anymore as all OAuth users are pending
          toast({
            title: "Setup Berhasil",
            description: "Selamat datang di CapStation!",
            variant: "default",
          });
          router.push("/dashboard");
        }
      } else {
        // BUG FIX: Handle role already selected error
        if (result.error && result.error.includes("sudah dipilih")) {
          toast({
            title: "Role Sudah Dipilih",
            description: result.error,
            variant: "destructive",
            duration: 5000,
          });

          // Redirect to login after showing notification
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(result.error || "Gagal menyelesaikan setup profil.");
        }
      }
    } catch (err) {
      console.error("Role selection error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (error && !setupToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Terjadi Kesalahan
            </CardTitle>
            <CardDescription className="text-neutral-600">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6 py-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-primary rounded-full p-2 sm:p-3">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Selamat Datang di CapStation
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg text-neutral-600">
            Pilih peran Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mahasiswa Card */}
            <button
              onClick={() => handleRoleSelection("mahasiswa")}
              disabled={loading}
              className={`group relative overflow-hidden rounded-lg border-2 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg ${
                selectedRole === "mahasiswa"
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 hover:border-primary/50"
              } ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div
                  className={`rounded-full p-3 sm:p-4 transition-colors ${
                    selectedRole === "mahasiswa"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
                    Mahasiswa
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Saya adalah mahasiswa yang ingin mengerjakan proyek capstone
                    dan berkolaborasi dengan dosen
                  </p>
                </div>

                {loading && selectedRole === "mahasiswa" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </button>

            {/* Dosen Card */}
            <button
              onClick={() => handleRoleSelection("dosen")}
              disabled={loading}
              className={`group relative overflow-hidden rounded-lg border-2 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg ${
                selectedRole === "dosen"
                  ? "border-secondary bg-secondary/5"
                  : "border-neutral-200 hover:border-secondary/50"
              } ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div
                  className={`rounded-full p-3 sm:p-4 transition-colors ${
                    selectedRole === "dosen"
                      ? "bg-secondary text-white"
                      : "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white"
                  }`}
                >
                  <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
                    Dosen
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Saya adalah dosen pembimbing yang ingin membimbing mahasiswa
                    dalam proyek capstone
                  </p>
                </div>

                {loading && selectedRole === "dosen" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-neutral-500 pt-4">
            <p>
              Pilihan role ini akan menentukan akses dan fitur yang tersedia
              untuk Anda.
            </p>
            {selectedRole === "dosen" && (
              <p className="mt-2 text-amber-600 font-medium">
                ⚠️ Role Dosen memerlukan persetujuan admin
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg font-medium">Memuat...</span>
          </div>
        </div>
      }
    >
      <OAuthSetupContent />
    </Suspense>
  );
}
