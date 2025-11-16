"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, LayoutDashboard, FolderKanban, CheckCircle2, Bell, Calendar, Users, Folder } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none" 
        style={{
          backgroundImage: `
            radial-gradient(circle, #D9D9D9 1.5px, transparent 1.5px),
            radial-gradient(circle, #D9D9D9 1.5px, transparent 1.5px)
          `,
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px'
        }}
      ></div>

        <svg 
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#B8B8B8" strokeWidth="1.5" />

        <line x1="72%" y1="0" x2="72%" y2="100%" stroke="#B8B8B8" strokeWidth="1.5" />
        
        <line x1="0" y1="22%" x2="100%" y2="22%" stroke="#B8B8B8" strokeWidth="1.5" />

        <line x1="0" y1="77%" x2="100%" y2="77%" stroke="#B8B8B8" strokeWidth="1.5" />
      </svg>

      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="bg-secondary p-6 rounded-sm transform rotate-[-5deg] w-64"
          style={{
            boxShadow: `
              0px 1px 2px 0px rgba(0,0,0,0.20),
              2px 3px 3px 0px rgba(0,0,0,0.17),
              4px 7px 5px 0px rgba(0,0,0,0.10),
              7px 12px 6px 0px rgba(0,0,0,0.03),
              12px 18px 6px 0px rgba(0,0,0,0.00)
                `
              }}>
          <p className="text-neutral-800 text-lg leading-relaxed">
            Kelola proyek capstone dengan mudah dan terorganisir
          </p>
          <p className="text-neutral-800 text-lg leading-relaxed">
            . . .
          </p>
          <p className="text-neutral-800 text-lg leading-relaxed">
            . 
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-8">
        <Folder 
          size={350} 
          className="text-primary/0 fill-neutral-100/90 absolute top-30 -left-[100px] drop-shadow-lg hidden lg:block"
          style={{ transform: 'rotate(15deg)' }}
        />
      </div>
      
      <div className="absolute top-[220px] left-[170px] rotate-[5deg] hidden lg:block">
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
      </div>

      


      {/* Floating Elements - Top Right */}
      <div className="absolute top-24 right-16  hidden lg:block rotate-[5deg] scale-110 ">
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
      <div className="absolute bottom-32 -left-[20px]  hidden lg:block rotate-[8deg] ">
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
      <div className="absolute bottom-32 right-20  hidden lg:block rotate-[-8deg] ">
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


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">

        <div className="mb-2">
          <div className="bg-white p-2 rounded-xl shadow-xl"  style={{
            boxShadow: `
              1px 1px 2px 0px rgba(0,0,0,0.10),
              2px 3px 3px 0px rgba(0,0,0,0.09),
              5px 6px 5px 0px rgba(0,0,0,0.05),
              9px 11px 6px 0px rgba(0,0,0,0.01),
              14px 17px 6px 0px rgba(0,0,0,0.00)
                `
              }} >
            <Image 
              src="/Logo.png" 
              alt="CapStation Logo" 
              width={50} 
              height={50}
            />
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-3 leading-relaxed">
            <span className="block text-primary mb-2">Share your capstone.</span>
            <span className="block text-neutral-400">Continue the legacy.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm md:text-lg text-neutral-600 mb-12 max-w-xl mx-auto">
            Streamline project uploads, browsing, and continuation everything in one centralized hub.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-10 mb-16">
            <Link 
              href="/login"
              className="group flex flex-col items-center gap-3 "
            >
              <div className="w-20 h-20 md:w-21 md:h-21 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-3xl transition-all">
                <LogIn size={20} className="text-white md:w-9 md:h-9" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Login</span>
            </Link>

            <Link 
              href="/dashboard"
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 md:w-21 md:h-21 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-3xl transition-all">
                <LayoutDashboard size={40} className="text-neutral-100 md:w-9 md:h-9" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Dashboard</span>
            </Link>

            <Link 
              href="/projects"
              className="group flex flex-col items-center gap-3 transition-transform "
            >
              <div className="w-20 h-20 md:w-21 md:h-21 bg-gradient-to-br from-accent to-accent-dark rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-3xl transition-all">
                <FolderKanban size={40} className="text-white md:w-9 md:h-9" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Projects</span>
            </Link>
          </div>


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
