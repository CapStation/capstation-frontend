"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import endpoints from "@/lib/api-config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email harus diisi");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(endpoints.auth.forgotPassword, {
        email,
      });

      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-xl">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Lupa Password?
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-neutral-600">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset
            password
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
            <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md flex items-start gap-3">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">Email terkirim!</p>
                <p className="text-sm">
                  Jika akun dengan email tersebut terdaftar, kami telah
                  mengirimkan link reset password. Silakan cek inbox atau folder
                  spam Anda.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 py-6">
              <Button
                type="submit"
                className="w-full text-sm sm:text-base"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
