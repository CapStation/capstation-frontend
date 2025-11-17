"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, Mail, Home } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import endpoints from "@/lib/api-config";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage(
          "Link verifikasi tidak valid. Token atau email tidak ditemukan."
        );
        return;
      }

      try {
        const response = await apiClient.post(endpoints.auth.verifyEmail, {
          token,
          email,
        });

        if (response.success) {
          setStatus("success");
          setMessage(response.message || "Email Anda berhasil diverifikasi!");

          // Auto redirect countdown
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(interval);
        } else {
          setStatus("error");
          setMessage(response.message || "Verifikasi gagal");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error?.data?.message ||
            error?.message ||
            "Token tidak valid atau sudah kadaluarsa. Silakan minta link verifikasi baru."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Separate useEffect for navigation when countdown reaches 0
  useEffect(() => {
    if (status === "success" && countdown === 0) {
      router.push("/login");
    }
  }, [countdown, status, router]);

  // Loading State
  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <div className="bg-white rounded-full p-6 shadow-xl mb-6 inline-block">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Memverifikasi Email...
          </h2>
          <p className="text-neutral-600">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" strokeWidth={2} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              Email Berhasil Diverifikasi!
            </h2>
            <p className="text-neutral-600 mb-4">{message}</p>
            <p className="text-sm text-neutral-500 mb-6">
              Anda akan diarahkan ke halaman login dalam{" "}
              <span className="font-bold text-primary">{countdown}</span>{" "}
              detik...
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Lanjut ke Login
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle
              className="w-12 h-12 text-destructive"
              strokeWidth={2}
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Verifikasi Gagal
          </h2>
          <p className="text-neutral-600 mb-6">{message}</p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-primary" />
              Apa yang harus dilakukan?
            </h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>
                • Periksa apakah link verifikasi sudah kadaluarsa (24 jam)
              </li>
              <li>• Pastikan Anda menggunakan link terbaru dari email</li>
              <li>• Coba daftar ulang jika masalah berlanjut</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              Daftar Ulang
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="text-center">
            <div className="bg-white rounded-full p-6 shadow-xl mb-6 inline-block">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
