"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Mail, Clock, ArrowLeft } from "lucide-react";

export default function AccountPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reason, setReason] = useState("unknown");

  useEffect(() => {
    const reasonParam = searchParams.get("reason");
    if (reasonParam) {
      setReason(reasonParam);
    }
  }, [searchParams]);

  const getContent = () => {
    switch (reason) {
      case "not-verified":
        return {
          icon: <Mail className="w-16 h-16 text-yellow-500" />,
          title: "Email Belum Diverifikasi",
          description:
            "Akun Anda belum dapat digunakan karena email belum diverifikasi.",
          message:
            "Silakan cek inbox atau folder spam email Anda untuk mendapatkan link verifikasi. Setelah email terverifikasi, Anda dapat login kembali.",
          action: "Cek Email",
          actionLink: null,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-900",
        };
      case "not-approved":
        return {
          icon: <Clock className="w-16 h-16 text-blue-500" />,
          title: "Menunggu Validasi Admin",
          description:
            "Akun Anda telah terdaftar dan email sudah diverifikasi.",
          message:
            "Namun, akun Anda masih menunggu validasi dari administrator. Mohon tunggu hingga admin memvalidasi role Anda. Anda akan mendapat notifikasi melalui email setelah akun Anda disetujui.",
          action: "Kembali ke Login",
          actionLink: "/login",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-900",
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-neutral-500" />,
          title: "Akun Pending",
          description: "Akun Anda belum dapat digunakan.",
          message:
            "Silakan hubungi administrator untuk informasi lebih lanjut.",
          action: "Kembali ke Login",
          actionLink: "/login",
          bgColor: "bg-neutral-50",
          borderColor: "border-neutral-200",
          textColor: "text-neutral-900",
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{content.icon}</div>
          <div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <CardDescription className="mt-2">
              {content.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div
            className={`p-4 rounded-lg border ${content.bgColor} ${content.borderColor}`}
          >
            <p className={`text-sm ${content.textColor}`}>{content.message}</p>
          </div>

          {reason === "not-verified" && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-neutral-600">
                <strong>Tips:</strong>
              </p>
              <ul className="text-xs text-neutral-600 space-y-1 ml-4 list-disc">
                <li>Periksa folder spam atau junk email Anda</li>
                <li>Pastikan email terdaftar benar</li>
                <li>Link verifikasi berlaku selama 24 jam</li>
              </ul>
            </div>
          )}

          {reason === "not-approved" && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-neutral-600">
                <strong>Informasi:</strong>
              </p>
              <ul className="text-xs text-neutral-600 space-y-1 ml-4 list-disc">
                <li>Proses validasi biasanya memakan waktu 1-2 hari kerja</li>
                <li>Anda akan menerima email konfirmasi setelah disetujui</li>
                <li>Hubungi admin jika lebih dari 3 hari belum divalidasi</li>
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() =>
              content.actionLink
                ? router.push(content.actionLink)
                : router.push("/login")
            }
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {content.action}
          </Button>

          {reason === "not-verified" && (
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Kembali ke Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
