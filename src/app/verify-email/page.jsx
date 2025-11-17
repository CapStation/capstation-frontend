'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';
import AuthService from '@/services/AuthService';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');

      if (!token || !emailParam) {
        setError('Token atau email tidak ditemukan. Link verifikasi tidak valid.');
        return;
      }

      setEmail(emailParam);

      // Call backend to verify email
      const response = await AuthService.verifyEmail(token, emailParam);

      if (response.success || response.message === 'Email verified') {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.message || 'Gagal memverifikasi email');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Terjadi kesalahan saat memverifikasi email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-neutral-200 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-neutral-200">
          <CardTitle className="text-2xl">Verifikasi Email</CardTitle>
          <CardDescription>
            Sedang memverifikasi akun Anda...
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-center text-muted-foreground">
                Memproses verifikasi email...
              </p>
            </div>
          )}

          {success && !loading && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="text-center">
                <h3 className="font-semibold text-green-900 mb-2">
                  Verifikasi Berhasil!
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Email Anda telah berhasil diverifikasi. Anda sekarang dapat masuk ke akun Anda.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Anda akan diarahkan ke halaman login dalam 3 detik...
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                Ke Halaman Login
              </Button>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <div className="text-center">
                <h3 className="font-semibold text-red-900 mb-2">
                  Verifikasi Gagal
                </h3>
                <p className="text-sm text-red-700 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">
                    Hubungi support jika Anda memerlukan bantuan.
                  </p>
                  <Button
                    onClick={() => router.push('/register')}
                    variant="outline"
                    className="w-full border-neutral-300"
                  >
                    Kembali ke Daftar
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                  >
                    Ke Halaman Login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
