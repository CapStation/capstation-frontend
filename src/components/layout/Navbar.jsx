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
  LogIn,
  UserCircle,
  ChevronDown,
  Menu,
  X,
  Bell,
} from "lucide-react";

import Image from "next/image";

export default function Navbar({ className = "" }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="container mx-auto px-4 md:px-10">
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
          <div className="hidden md:flex items-center gap-3">
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

                    <Link href="/request">
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4 mr-2"/>
                        Request
                      </Button>
                    </Link>
          </div>
          {/* Menu kanan */}
          <div className="flex items-center gap-4">
            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              {(() => {
                const isAdmin = user?.role === "admin";
                const firstName = (user?.name || "User").split(" ")[0];
                return (
                  <>
                    {isAdmin && (
                      <Link href="/admin">
                        <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}

                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-semibold flex items-center gap-2 hover:bg-primary/10"
                          >
                            <UserCircle className="h-4 w-4" />
                            Hi, {firstName}
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
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                          <LogIn className="h-4 w-4 mr-2" />
                          Masuk
                        </Button>
                      </Link>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile slide-in drawer */}
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />

              <aside
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 md:hidden"
                role="dialog"
                aria-modal="true"
              >
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b flex items-center justify-between">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-lg font-semibold text-primary">CapStation</Link>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="px-3 py-4 flex-1 overflow-y-auto space-y-2">
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <Button size="sm" className="w-full justify-start bg-primary text-white hover:bg-primary/90">
                          <FolderOpen className="h-4 w-4 mr-2" /> Dashboard Admin
                        </Button>
                      </Link>
                    )}

                    <Link href="/projects" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><BookOpen className="h-4 w-4 mr-2" /> Project</Button>
                    </Link>

                    <Link href="/groups" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><Users className="h-4 w-4 mr-2" /> Group</Button>
                    </Link>

                    <Link href="/browse/capstones" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" /> Browse</Button>
                    </Link>

                    <Link href="/announcements" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><Bell className="h-4 w-4 mr-2" /> Announcement</Button>
                    </Link>

                    <Link href="/request" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><History className="h-4 w-4 mr-2" /> Request</Button>
                    </Link>

                    {user ? (
                      <>
                        <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => { router.push('/profile'); setMobileOpen(false); }}>
                          <User className="h-4 w-4 mr-2" /> Profile
                        </Button>
                        <Button type="button" variant="ghost" className="w-full justify-start text-destructive" onClick={() => { setShowLogoutDialog(true); setMobileOpen(false); }}>
                          <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full justify-start border-orange-500 text-orange-500 hover:bg-orange-50">
                          <LogIn className="h-4 w-4 mr-2" />
                          Masuk
                        </Button>
                      </Link>
                    )}
                  </nav>
                </div>
              </aside>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} className="">
        <DialogContent className=" rounded-lg px-10">
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
