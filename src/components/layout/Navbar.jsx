"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, Search, FolderOpen } from "lucide-react";

export default function Navbar({ className = "" }) {
  const { user } = useAuth();

  return (
    <nav className={`bg-white border-b border-neutral-200 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">CapStation</Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm"><BookOpen className="h-4 w-4 mr-2"/>Project</Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" size="sm"><Users className="h-4 w-4 mr-2"/>Group</Button>
            </Link>
            <Link href="/browse/capstones">
              <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-2"/>Browse</Button>
            </Link>
            {(user?.role === 'admin' || user?.role === 'dosen') && (
              <Link href="/documents">
                <Button variant="ghost" size="sm"><FolderOpen className="h-4 w-4 mr-2"/>Dokumen Admin</Button>
              </Link>
            )}
            {user ? (
              <Button variant="ghost" size="sm" className="font-semibold">
                Halo, {user?.name || "User"}
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">Masuk</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
