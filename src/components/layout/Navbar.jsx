"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Users,
  FileText,
  Search,
  FolderOpen,
  History,
  User,
  LogOut,
  UserCircle,
  ChevronDown,
  Bell,
} from "lucide-react";

import Image from "next/image";

export default function Navbar({ className = "" }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutDialog(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className={`bg-white border-b border-neutral-200 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Search */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              <Image 
                src="/LogoVertical.png" 
                alt="CapStation Logo" 
                width={150} 
                height={150}
                />
            </Link>
          </div>

          {/* Menu kanan */}
          <div className="flex items-center gap-4">
            {(() => {
              const isAdmin = user?.role === "admin";
              const firstName = (user?.name || "User").split(" ")[0];

              if (isAdmin) {
                return (
                  <>
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Dashboard Admin
                      </Button>
                    </Link>

                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-semibold flex items-center gap-2 hover:bg-primary/10"
                          >
                            <UserCircle className="h-4 w-4" />
                            Halo, {firstName}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{firstName}</p>
                              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={() => setShowLogoutDialog(true)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link href="/login">
                        <Button variant="default" size="sm">Masuk</Button>
                      </Link>
                    )}
                  </>
                );
              }

              // Non-admin view: show regular links but hide admin dashboard
              return (
                <>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Project
                    </Button>
                  </Link>

                  <Link href="/groups">
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Group
                    </Button>
                  </Link>

                  <Link href="/browse/capstones">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </Link>

                  <Link href="/announcements">
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Announcement
                    </Button>
                  </Link>

                  {(user?.role === "admin" || user?.role === "dosen") && (
                    <Link href="/documents">
                      <Button variant="ghost" size="sm">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                    </Link>
                  )}

                  <Link href="/request">
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-2"/>
                      Request
                    </Button>
                  </Link>

                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-semibold flex items-center gap-2 hover:bg-primary/10"
                        >
                          <UserCircle className="h-4 w-4" />
                          Halo, {firstName}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{firstName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => router.push("/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>User Profile</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onSelect={() => setShowLogoutDialog(true)}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/login">
                      <Button variant="default" size="sm">Masuk</Button>
                    </Link>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Konfirmasi Logout
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Apakah Anda yakin ingin logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}