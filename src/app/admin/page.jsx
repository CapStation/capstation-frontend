"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminService from "@/services/AdminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FolderKanban,
  Users,
  UsersRound,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalGroups: 0,
    totalDocuments: 0,
    activeProjects: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await AdminService.getDashboardStats();
      if (result.success) {
        setStats(result.data);
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalProjects: 156,
          totalUsers: 423,
          totalGroups: 89,
          totalDocuments: 1247,
          activeProjects: 67,
          pendingRequests: 12,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Gagal memuat statistik dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Proyek",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/projects",
    },
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/users",
    },
    {
      title: "Total Grup",
      value: stats.totalGroups,
      icon: UsersRound,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/groups",
    },
    {
      title: "Total Dokumen",
      value: stats.totalDocuments,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/documents",
    },
  ];

  const quickActions = [
    {
      title: "Proyek Aktif",
      value: stats.activeProjects,
      description: "Proyek yang sedang berjalan",
      icon: TrendingUp,
      href: "/admin/projects?status=active",
    },
    {
      title: "Permintaan Tertunda",
      value: stats.pendingRequests,
      description: "Menunggu persetujuan",
      icon: Clock,
      href: "/admin/projects?status=pending",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Selamat datang kembali, {user?.name || user?.username || 'Admin'}
            </h1>
            <p className="text-neutral-500 mt-1">
              Berikut yang terjadi dengan CapStation hari ini.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-neutral-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-neutral-900">
                    {loading ? "..." : stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center">
                    Lihat semua <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-neutral-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-neutral-900">
                            {action.title}
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-3">
                          {action.description}
                        </p>
                        <div className="text-2xl font-bold text-neutral-900">
                          {loading ? "..." : action.value}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-neutral-400 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Management Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Manajemen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Kelola Proyek",
              description: "Buat, edit, dan kelola semua proyek capstone",
              icon: FolderKanban,
              href: "/admin/projects",
              color: "primary",
            },
            {
              title: "Kelola Pengguna",
              description: "Kelola akun pengguna dan izin",
              icon: Users,
              href: "/admin/users",
              color: "blue-600",
            },
            {
              title: "Kelola Grup",
              description: "Kelola grup dan tim mahasiswa",
              icon: UsersRound,
              href: "/admin/groups",
              color: "green-600",
            },
            {
              title: "Kelola Dokumen",
              description: "Kelola dokumen dan file proyek",
              icon: FileText,
              href: "/admin/documents",
              color: "purple-600",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-neutral-200 h-full">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-lg bg-${item.color}/10 w-fit mb-4`}>
                      <Icon className={`h-6 w-6 text-${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      {item.description}
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                      Kelola <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
