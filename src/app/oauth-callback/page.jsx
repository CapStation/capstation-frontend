"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState("processing"); // processing, success, error

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        // Store token in localStorage
        localStorage.setItem("accessToken", token);

        // Verify token and load user data
        await checkAuth();

        setStatus("success");

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    processCallback();
  }, [searchParams, router, checkAuth]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Memproses Login...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-neutral-600">
              Mohon tunggu, kami sedang memverifikasi akun Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Login Berhasil!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-neutral-600">
              Anda akan diarahkan ke dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
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
            Login Gagal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-neutral-600 mb-4">
            Terjadi kesalahan saat memproses login Anda.
          </p>
          <p className="text-sm text-neutral-500">
            Anda akan diarahkan kembali ke halaman login...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

// Import Suspense at the top
import { Suspense } from "react";
