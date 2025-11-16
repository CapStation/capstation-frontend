"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, LayoutDashboard, FolderKanban, CheckCircle2, Bell, Calendar, Users, Folder } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Only redirect to dashboard if user is authenticated
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral-600">Memuat CapStation...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 overflow-hidden relative">

      {/* Floating Elements - Top Left */}
      <div className="absolute top-20 left-10 hidden lg:block">
       
        <div className="bg-secondary p-6 rounded-2xl shadow-2xl transform rotate-[-5deg] w-64">
          <p className="text-neutral-800 text-xl leading-relaxed">
            Kelola proyek capstone dengan mudah dan terorganisir
          </p>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full shadow-lg"></div>
        </div>
      </div>

      <div className="flex gap-4 p-8">
        <Folder 
          size={500} 
          className="text-primary/0 fill-primary/80 absolute top-20 -left-40 drop-shadow-lg"
          style={{ transform: 'rotate(15deg)' }}
        />
      </div>

      {/* Floating Elements - Top Right */}
      <div className="absolute top-32 right-16 animate-float-delayed hidden lg:block">
        <div className="bg-white p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <span className="font-semibold text-neutral-800 text-sm">Reminders</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Calendar className="w-4 h-4 text-accent" />
              <span>Bimbingan Hari Ini</span>
            </div>
            <div className="text-xs font-medium text-primary">13:00 - 15:00</div>
          </div>
        </div>
      </div>

      {/* Floating Elements - Bottom Left */}
      <div className="absolute bottom-24 left-16 animate-float-slow hidden lg:block">
        <div className="bg-white p-5 rounded-2xl shadow-xl w-72">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-neutral-800 text-sm">Today's Tasks</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-600">Revisi Proposal</span>
                <span className="text-xs font-medium text-primary">75%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-600">Testing IoT</span>
                <span className="text-xs font-medium text-accent">45%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements - Bottom Right */}
      <div className="absolute bottom-32 right-20 animate-float-delayed hidden lg:block">
        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <div className="mb-2 text-xs font-semibold text-neutral-700">Integrations</div>
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-md">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-neutral-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Card - Left Side */}
      <div className="absolute top-1/3 left-8 hidden md:block animate-float-slow">
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="text-neutral-900">Capstone </span>
            <span className="text-neutral-400">Station</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
            A Information portal for capstone projects
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            <Link 
              href="/login"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="w-40 h-40 md:w-24 md:h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <LogIn size={10} className="text-white md:w-12 md:h-12" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Login</span>
            </Link>

            <Link 
              href="/dashboard"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <LayoutDashboard size={40} className="text-neutral-700 md:w-12 md:h-12" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Dashboard</span>
            </Link>

            <Link 
              href="/projects"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-accent to-accent-dark rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <FolderKanban size={40} className="text-white md:w-12 md:h-12" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Projects</span>
            </Link>
          </div>

          {/* CTA Button */}
          <Link 
            href="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(-5deg);
          }
          50% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }

        .font-handwriting {
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }
      `}</style>
    </div>
  );
}
