import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
      if (typeof project.owner === 'object' && project.owner !== null) {
        // Already populated - prioritize fullName
        const name = project.owner.fullName || project.owner.name || project.owner.username || project.owner.email;
        console.log('✅ Owner populated:', name);
        setOwnerName(name || 'Pemilik Proyek');
      } else if (typeof project.owner === 'string' && /^[a-f0-9]{24}$/i.test(project.owner)) {
        // It's an ID, fetch from API
        console.log('🌐 Fetching owner by ID:', project.owner);
        const result = await UserService.getUserById(project.owner);
        console.log('📦 Owner fetch result:', result);
        if (result.success && result.data) {
          const name = result.data.fullName || result.data.name || result.data.username || result.data.email;
          console.log('✅ Owner fetched:', name);
          setOwnerName(name || 'Pemilik Proyek');
        } else {
          console.log('❌ Owner fetch failed:', result.error);
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
      if (typeof project.supervisor === 'object' && project.supervisor !== null) {
        // Already populated - prioritize fullName
        const name = project.supervisor.fullName || project.supervisor.name || project.supervisor.username || project.supervisor.email;
        console.log('✅ Supervisor populated:', name);
        setSupervisorName(name || 'Dosen Pembimbing');
      } else if (typeof project.supervisor === 'string' && /^[a-f0-9]{24}$/i.test(project.supervisor)) {
        // It's an ID, fetch from API
        console.log('🌐 Fetching supervisor by ID:', project.supervisor);
        const result = await UserService.getUserById(project.supervisor);
        console.log('📦 Supervisor fetch result:', result);
        if (result.success && result.data) {
          const name = result.data.fullName || result.data.name || result.data.username || result.data.email;
          console.log('✅ Supervisor fetched:', name);
          setSupervisorName(name || 'Dosen Pembimbing');
        } else {
          console.log('❌ Supervisor fetch failed:', result.error);
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
      setSupervisorName('Dosen Pembimbing');
    }

    setLoading(false);
    console.log('✅ fetchUserData completed');
  }, [project.owner, project.supervisor, project.title]);

  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const getStatusColor = (status) => {
    // Normalize status
    const normalizedStatus = status?.toLowerCase();
    
    // Status colors based on new business logic
    if (normalizedStatus === "dapat_dilanjutkan") {
      return "bg-emerald-300 text-gray-800 border-neutral-300";
    }
    
    if (normalizedStatus === "active") {
      return "bg-green-300 text-gray-800 border-neutral-300";
    }
    
    if (normalizedStatus === "selesai") {
      return "bg-blue-300 text-black-800 border-neutral-300";
    }
    
    if (normalizedStatus === "inactive") {
      return "bg-gray-300 text-gray-800 border-neutral-300";
    }
    
    // CapstoneStatus colors
    if (normalizedStatus === "new") {
      return "bg-blue-200 text-gray-800 border-neutral-300";
    }
    
    if (normalizedStatus === "pending") {
      return "bg-yellow-300 text-gray-800 border-neutral-300";
    }
    
    if (normalizedStatus === "accepted") {
      return "bg-green-300 text-gray-800 border-neutral-300";
    }
    
    if (normalizedStatus === "rejected") {
      return "bg-red-300 text-gray-800 border-neutral-300";
    }
    
    // Default (gray)
    return "bg-neutral-300 text-gray-800 border-neutral-300";
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    // Status labels
    if (normalizedStatus === "dapat_dilanjutkan") return "Dapat Dilanjutkan";
    if (normalizedStatus === "active") return "Sedang Berjalan";
    if (normalizedStatus === "selesai") return "Selesai";
    if (normalizedStatus === "inactive") return "Tidak Aktif";
    
    // CapstoneStatus labels
    if (normalizedStatus === "new") return "Baru";
    if (normalizedStatus === "pending") return "Menunggu Persetujuan";
    if (normalizedStatus === "accepted") return "Diterima";
    if (normalizedStatus === "rejected") return "Ditolak";
    
    // Fallback
    return status || "Baru";
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
      'pengelolaan-sampah': 'Pengelolaan Sampah',
      'smart_city': 'Smart City',
      'smart-city': 'Smart City',
      'transportasi_ramah_lingkungan': 'Transportasi Ramah Lingkungan',
      'transportasi-ramah-lingkungan': 'Transportasi Ramah Lingkungan',
      'iot': 'IoT',
      'ai': 'Artificial Intelligence',
      'mobile': 'Mobile Development',
    };
    return themeMap[tema?.toLowerCase()] || tema || 'Smart City';
  };

  // Check if project is new (created within last 2 weeks)
  const isNewProject = () => {
    if (!project.createdAt) return false;
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const createdDate = new Date(project.createdAt);
    
    return createdDate >= twoWeeksAgo;
  };

  // Get theme image path based on project tema
  const getThemeImage = (tema) => {
    const normalizedTema = tema?.toLowerCase().replace(/_/g, '-');
    
    switch (normalizedTema) {
      case 'kesehatan':
        return '/images/themes/kesehatan.jpg';
      case 'pengelolaan-sampah':
        return '/images/themes/pengelolaan-sampah.jpg';
      case 'smart-city':
        return '/images/themes/smart-city.jpg';
      case 'transportasi-ramah-lingkungan':
        return '/images/themes/transportasi-ramah-lingkungan.jpg';
      default:
        return '/images/themes/default.png';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out border border-neutral-200 cursor-pointer group">
      {/* Gambar placeholder*/}
      <div className="relative w-full h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
        {/* Gambar dari tema */}
        <Image
          src={getThemeImage(project.tema)}
          alt={getThemeLabel(project.tema)}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient shadow overlay gambar */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 from-0% via-transparent via-30% to-transparent pointer-events-none"></div>
        
        {/* Badges - top right (Priority: 1. DAPAT DILANJUTKAN, 2. BARU) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {/* Priority 1: Dapat Dilanjutkan Badge */}
          {project.status === 'dapat_dilanjutkan' ? (
            <Badge 
              className="bg-emerald-500 text-white border-none rounded-full px-3 py-1 text-xs font-bold shadow-md"
            >
              DAPAT DILANJUTKAN
            </Badge>
          ) : /* Priority 2: NEW Badge (only for projects < 2 weeks old) */
          isNewProject() ? (
            <Badge 
              className="bg-red-500 text-white border-none rounded-full px-3 py-1 text-xs font-bold shadow-md"
            >
              BARU
            </Badge>
          ) : null}
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

