"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UsersRound,
  FileText,
  Megaphone,
  Award,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kelola Proyek",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    title: "Kelola Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Kelola Grup",
    href: "/admin/groups",
    icon: UsersRound,
  },
  {
    title: "Kelola Dokumen",
    href: "/admin/documents",
    icon: FileText,
  },
  {
    title: "Pengumuman",
    href: "/admin/announcements",
    icon: Megaphone,
    disabled: true,
  },
  {
    title: "Kompetensi",
    href: "/admin/competencies",
    icon: Award,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-neutral-200 h-screen sticky top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          <span className="text-primary">Cap</span>Station
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Admin Panel</p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : item.disabled
                  ? "text-neutral-400 cursor-not-allowed"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-5 w-5" />
              {item.title}
              {item.disabled && (
                <span className="ml-auto text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                  Segera
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Kembali ke Situs
          </Button>
        </Link>
      </div>
    </div>
  );
}
