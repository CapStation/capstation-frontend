import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserService from "@/services/UserService";

export default function ProjectCard({ project, showStatus = false }) {
  const [ownerName, setOwnerName] = React.useState(null);
  const [supervisorName, setSupervisorName] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchUserData = React.useCallback(async () => {
    console.log('🔍 ProjectCard fetchUserData - project:', {
      owner: project.owner,
      supervisor: project.supervisor,
      title: project.title
    });
    
    setLoading(true);
    
    // Fetch owner name
    if (project.owner) {
      if (typeof project.owner === 'object' && (project.owner.name || project.owner.username)) {
        // Already populated
        const name = project.owner.fullName || project.owner.name || project.owner.username;
        console.log('✅ Owner populated:', name);
        setOwnerName(name);
      } else if (typeof project.owner === 'string' && /^[a-f0-9]{24}$/i.test(project.owner)) {
        // It's an ID, fetch from API
        console.log('🌐 Fetching owner by ID:', project.owner);
        const result = await UserService.getUserById(project.owner);
        console.log('📦 Owner fetch result:', result);
        if (result.success && result.data) {
          const name = result.data.fullName || result.data.name || result.data.username || result.data.email;
          console.log('✅ Owner fetched:', name);
          setOwnerName(name);
        } else {
          console.log('❌ Owner fetch failed');
          setOwnerName('Pemilik Proyek');
        }
      } else if (typeof project.owner === 'string') {
        // It's already a name
        console.log('✅ Owner is string:', project.owner);
        setOwnerName(project.owner);
      }
    } else {
      console.log('⚠️ No owner data');
      setOwnerName('Pemilik Proyek');
    }

    // Fetch supervisor name
    if (project.supervisor) {
      if (typeof project.supervisor === 'object' && (project.supervisor.name || project.supervisor.username)) {
        // Already populated
        const name = project.supervisor.fullName || project.supervisor.name || project.supervisor.username;
        console.log('✅ Supervisor populated:', name);
        setSupervisorName(name);
      } else if (typeof project.supervisor === 'string' && /^[a-f0-9]{24}$/i.test(project.supervisor)) {
        // It's an ID, fetch from API
        console.log('🌐 Fetching supervisor by ID:', project.supervisor);
        const result = await UserService.getUserById(project.supervisor);
        console.log('📦 Supervisor fetch result:', result);
        if (result.success && result.data) {
          const name = result.data.fullName || result.data.name || result.data.username || result.data.email;
          console.log('✅ Supervisor fetched:', name);
          setSupervisorName(name);
        } else {
          console.log('❌ Supervisor fetch failed');
          setSupervisorName('Dosen Pembimbing');
        }
      } else if (typeof project.supervisor === 'string') {
        // It's already a name
        const cleanName = project.supervisor.replace('Dosen Pembimbing:', '').trim();
        console.log('✅ Supervisor is string:', cleanName);
        setSupervisorName(cleanName);
      }
    } else {
      console.log('⚠️ No supervisor data');
      setSupervisorName(null);
    }

    setLoading(false);
    console.log('✅ fetchUserData completed');
  }, [project.owner, project.supervisor, project.title]);

  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const getStatusColor = (status) => {
    // Normalize status - check if project is available to continue
    const normalizedStatus = status?.toLowerCase();
    
    // Available statuses (green)
    if (normalizedStatus === "accepted" || 
        normalizedStatus === "pending" || 
        normalizedStatus === "active" || 
        normalizedStatus === "available") {
      return "bg-green-300 text-gray-800 border-neutral-300";
    }
    
    // Rejected status (red)
    if (normalizedStatus === "rejected" || normalizedStatus === "ditolak") {
      return "bg-red-300 text-black-800 border-neutral-300";
    }
    
    // Completed status (blue)
    if (normalizedStatus === "completed" || normalizedStatus === "selesai") {
      return "bg-blue-300 text-black-800 border-neutral-300";
    }
    
    // Default (gray)
    return "bg-neutral-300 text-gray-800 border-neutral-300";
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    // All "available" statuses show as "Dapat dilanjutkan"
    if (normalizedStatus === "accepted" || 
        normalizedStatus === "pending" || 
        normalizedStatus === "active" || 
        normalizedStatus === "available") {
      return "Dapat dilanjutkan";
    }
    
    // Other statuses
    if (normalizedStatus === "rejected") return "Ditolak";
    if (normalizedStatus === "completed") return "Selesai";
    if (normalizedStatus === "cancelled") return "Dibatalkan";
    
    // Fallback
    return status || "Dapat dilanjutkan";
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
    <Card className="overflow-hidden hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out border border-neutral-200 cursor-pointer group">
      {/* Image placeholder with gradient - mimicking screenshot */}
      <div className="relative w-full h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center group-hover:from-neutral-300 group-hover:to-neutral-400 transition-all duration-300">
        {/* Status Badge - top right (only show if showStatus is true) */}
        {showStatus && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(project.capstoneStatus || project.status)} border rounded-full px-3 py-1 text-xs font-medium shadow-md`}
            >
              {getStatusLabel(project.capstoneStatus || project.status)}
            </Badge>
          </div>
        )}
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
            <span className="font-semibold">Pemilik:</span> {loading ? "..." : (ownerName || "Pemilik Proyek")}
          </p>
          <p>
            <span className="font-semibold">Dosen Pembimbing:</span> {loading ? "..." : (supervisorName || "Dosen Pembimbing")}
          </p>
          <p className="text-xs text-neutral-500">
            Diajukan: {formatDate(project.createdAt || project.date)}
          </p>
        </div>

        {/* Detail Button */}
        <Button 
          variant="default" 
          className="w-full bg-[#B6EB75] hover:bg-[#FFE49C] text-neutral-900 font-medium"
        >
          Detail
        </Button>
      </CardContent>
    </Card>
  );
}
