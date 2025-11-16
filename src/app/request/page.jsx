"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ProjectService from "@/services/ProjectService";
import RequestService from "@/services/RequestService";
import { Loader2 } from "lucide-react";

export default function RequestPage() {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    loadProjects();
    loadMyRequests();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const result = await ProjectService.getAllProjects();

      if (result.success && Array.isArray(result.data)) {
        const projects = result.data;

        const available = projects.filter(
          (p) =>
            p.status === "active" &&
            (p.capstoneStatus === "pending" ||
              p.capstoneStatus === "accepted")
        );

        setAvailableProjects(available);
      } else {
        setAvailableProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects for request page:", error);
      setAvailableProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const result = await RequestService.getMyRequests();
      if (result.success && Array.isArray(result.data)) {
        setMyRequests(result.data);
      } else {
        setMyRequests([]);
      }
    } catch (error) {
      console.error("Failed to load my requests:", error);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // kartu proyek di tab Submit Request
const renderProjectCard = (project) => {
  const title =
    project.title ||
    "Smart City Dashboard untuk Monitoring Lingkungan Area Malioboro";

  const titleLength = title.length;

  // atur ukuran font berdasarkan panjang judul
  let titleSizeClass = "text-lg";
  if (titleLength > 60 && titleLength <= 100) {
    titleSizeClass = "text-base";
  } else if (titleLength > 100) {
    titleSizeClass = "text-sm";
  }

  const year =
    project.year ||
    (project.startedAt
      ? new Date(project.startedAt).getFullYear()
      : project.createdAt
      ? new Date(project.createdAt).getFullYear()
      : "2024");

  return (
    <Card
      key={project._id}
      className="flex h-full min-h-[260px] flex-col rounded-2xl border border-neutral-200 shadow-sm"
    >
      {/* flex-col + justify-between supaya tombol selalu di bawah */}
      <CardContent className="flex flex-1 flex-col justify-between px-6 pt-6 pb-6">
        {/* Bagian atas: judul + chip + info pemilik & tahun */}
        <div className="space-y-3">
          {/* min-h bikin posisi bagian bawah tetap, judul aja yang menyesuaikan */}
          <div className="min-h-[48px]">
            <h3
              className={`${titleSizeClass} font-semibold leading-tight`}
            >
              {title}
            </h3>
          </div>

          <Badge
            variant="outline"
            className="mt-1 rounded-full px-3 py-1 text-xs font-medium"
          >
            {project.category?.name || project.category || "Smart City"}
          </Badge>

          <div className="mt-3 space-y-1 text-sm text-neutral-800">
            <p>
              <span className="font-semibold">Pemilik: </span>
              {project.ownerName ||
                project.owner?.name ||
                "Nama pemilik proyek"}
            </p>
            <p>
              <span className="font-semibold">Tahun: </span>
              {year}
            </p>
          </div>
        </div>

        {/* Bagian bawah: tombol Lanjutkan, tidak ada garis pemisah */}
        <div className="mt-6">
          <Button
            asChild
            className="w-full rounded-lg bg-[#FFE196] text-neutral-900 hover:bg-[#ffd56b] font-semibold"
          >
            <Link href={`/request/new?projectId=${project._id}`}>
              Ajukan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


  // baris di My Request, simple dulu (bisa kamu sesuaikan dengan Figma page 2)
  const renderMyRequestRow = (req) => {
    const submittedAt = req.createdAt
      ? new Date(req.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

    return (
      <div
        key={req._id}
        className="grid grid-cols-12 items-center gap-3 border-b border-neutral-200 py-3 text-sm"
      >
        <div className="col-span-5 font-medium">
          {req.project?.title || req.title || "Judul proyek"}
        </div>
        <div className="col-span-2">
          <Badge className="rounded-full bg-neutral-900 text-white">
            {req.status || "Pending"}
          </Badge>
        </div>
        <div className="col-span-3 text-neutral-600">{submittedAt}</div>
        <div className="col-span-2 text-right">
          {/* nanti bisa dipakai untuk lihat detail atau batalkan */}
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-300 text-neutral-800"
          >
            Detail
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <Navbar />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900">Request</h1>
        <p className="text-neutral-600 mb-6">
          Kelola pengajuan untuk melanjutkan capstone.
        </p>

        {/* bar tab atas (kuning seperti di Figma) */}
        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="
            flex w-full items-center gap-2
            rounded-xl bg-[#F3F4F6]
            p-1
            border border-neutral-200">
            <TabsTrigger
              value="submit"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Submit Request
            </TabsTrigger>
            <TabsTrigger
              value="my-request"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              My Request
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Decision Inbox
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="
                flex-1 px-4 py-2 text-sm font-semibold
                rounded-lg border-0
                bg-[#F3F4F6]
                text-neutral-700
                transition-all
                data-[state=active]:bg-[#FFE196]
                data-[state=active]:text-neutral-900
                data-[state=active]:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              Decision History
            </TabsTrigger>
          </TabsList>

          {/* card besar di bawah tab */}
          <Card className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm">

            {/* TAB Submit Request */}
            <TabsContent value="submit" className="p-6">
              <h2 className="text-lg font-semibold">Submit Request</h2>
              <p className="text-sm text-neutral-600 mb-6">
                Pilih proyek yang ingin Anda lanjutkan.
              </p>

              {loadingProjects ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                  Belum ada proyek yang dapat dilanjutkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {availableProjects.map((project) =>
                    renderProjectCard(project)
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB My Request */}
            <TabsContent value="my-request" className="p-6">
              <h2 className="text-lg font-semibold mb-1">My Request</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Lihat dan pantau semua permintaan yang telah Anda ajukan.
              </p>

              {loadingRequests ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                  Belum ada request yang diajukan.
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white">
                  <div className="grid grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-600">
                    <div className="col-span-5">Proyek</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Tanggal Pengajuan</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>

                  {myRequests.map((req) => renderMyRequestRow(req))}
                </div>
              )}
            </TabsContent>

            {/* TAB Decision Inbox */}
            <TabsContent value="inbox" className="p-6">
              <h2 className="text-lg font-semibold mb-1">Decision Inbox</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Tinjau dan beri keputusan permintaan melanjutkan proyek.
              </p>
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                Belum ada keputusan baru.
              </div>
            </TabsContent>

            {/* TAB Decision History */}
            <TabsContent value="history" className="p-6">
              <h2 className="text-lg font-semibold mb-1">Decision History</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Lihat riwayat keputusan yang Anda buat.
              </p>
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
                Riwayat keputusan masih kosong.
              </div>
            </TabsContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
}
