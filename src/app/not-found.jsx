"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF8730]/5 via-white to-[#FF8730]/10 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <FileQuestion className="h-32 w-32 text-[#FF8730]/20" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-[#FF8730]">404</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#090B08] mb-4">
          Halaman Tidak Ditemukan
        </h1>

        {/* Description */}
        <p className="text-lg text-[#535351] mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman mungkin telah dipindahkan atau tidak pernah ada.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto border-[#FF8730] text-[#FF8730] hover:bg-[#FF8730]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full bg-[#FF8730] hover:bg-[#FF8730]/90 text-white">
              <Home className="h-4 w-4 mr-2" />
              Ke Dashboard
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-[#D9D9D9]">
          <p className="text-sm text-[#535351] mb-4">
            Butuh bantuan? Berikut beberapa link yang mungkin berguna:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/browse/capstones" className="text-[#FF8730] hover:underline">
              Jelajahi Capstone
            </Link>
            <span className="text-[#D9D9D9]">•</span>
            <Link href="/projects" className="text-[#FF8730] hover:underline">
              Proyek Saya
            </Link>
            <span className="text-[#D9D9D9]">•</span>
            <Link href="/documents" className="text-[#FF8730] hover:underline">
              Dokumen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
