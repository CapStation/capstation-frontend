import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProjectCard({ project }) {
  const getStatusColor = (status) => {
    // Map capstoneStatus from API
    if (status === "accepted" || status === "Disetujui") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (status === "pending" || status === "Sedang Proses") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (status === "rejected" || status === "Ditolak") return "bg-red-100 text-red-800 border-red-300";
    if (status === "available" || status === "Dapat dilanjutkan") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-neutral-100 text-neutral-700 border-neutral-300";
  };

  const getStatusLabel = (status) => {
    // Map status to Indonesian labels
    const statusMap = {
      'accepted': 'Dapat dilanjutkan',
      'pending': 'Dapat dilanjutkan',
      'rejected': 'Ditolak',
      'active': 'Dapat dilanjutkan',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
      'available': 'Dapat dilanjutkan'
    };
    return statusMap[status] || status || 'Dapat dilanjutkan';
  };

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return "-";
    }
  };

  // Get owner name from API structure
  const getOwnerName = () => {
    if (project.owner && typeof project.owner === 'object' && project.owner.name) {
      return String(project.owner.name);
    }
    if (project.owner && typeof project.owner === 'string') {
      return project.owner;
    }
    if (project.author) {
      return String(project.author);
    }
    return "Unknown";
  };

  // Get supervisor info
  const getSupervisorInfo = () => {
    if (project.supervisor && typeof project.supervisor === 'object' && project.supervisor.name) {
      return String(project.supervisor.name);
    }
    if (project.supervisor && typeof project.supervisor === 'string') {
      // Remove "Dosen Pembimbing:" prefix if exists
      return project.supervisor.replace('Dosen Pembimbing:', '').trim();
    }
    if (project.supervisorLabel) {
      return String(project.supervisorLabel).replace('Dosen Pembimbing:', '').trim();
    }
    return null;
  };

  // Get theme label in Indonesian
  const getThemeLabel = (tema) => {
    const themeMap = {
      'kesehatan': 'Kesehatan',
      'pengelolaan_sampah': 'Pengelolaan Sampah',
      'smart_city': 'Smart City',
      'smart-city': 'Smart City',
      'transportasi_ramah_lingkungan': 'Transportasi Ramah Lingkungan',
      'iot': 'IoT',
      'ai': 'Artificial Intelligence',
      'mobile': 'Mobile Development',
    };
    return themeMap[tema?.toLowerCase()] || tema || 'Smart City';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border border-neutral-200">
      {/* Image placeholder with gradient - mimicking screenshot */}
      <div className="relative w-full h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
        {/* Status Badge - top right */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(project.capstoneStatus || project.status)} border rounded-full px-3 py-1 text-xs font-medium`}
          >
            {getStatusLabel(project.capstoneStatus || project.status)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-base text-neutral-900 line-clamp-2 min-h-[3rem]">
          {project.title}
        </h3>

        {/* Theme Badge */}
        {project.tema && (
          <Badge variant="outline" className="bg-white border-neutral-300 text-neutral-700 text-xs font-normal">
            {getThemeLabel(project.tema)}
          </Badge>
        )}

        {/* Metadata */}
        <div className="space-y-1 text-sm text-neutral-600">
          <p>
            <span className="font-semibold">Pemilik:</span> {getOwnerName()}
          </p>
          {getSupervisorInfo() && (
            <p>
              <span className="font-semibold">Dosen Pembimbing:</span> {getSupervisorInfo()}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Diajukan: {formatDate(project.createdAt || project.date)}
          </p>
        </div>

        {/* Detail Button */}
        <Button 
          variant="default" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium"
        >
          Detail
        </Button>
      </CardContent>
    </Card>
  );
}
