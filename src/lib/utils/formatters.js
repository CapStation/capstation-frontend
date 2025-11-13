/**
 * Format file size from bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date to Indonesian format
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "27 Mei 2026")
 */
export function formatDate(dateString) {
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
}

/**
 * Get user name from user object or string
 * @param {object|string} user - User object or string
 * @returns {string} User name
 */
export function getUserName(user) {
  if (!user) return "Unknown";
  
  // Handle nested object { _id, name, email }
  if (typeof user === 'object' && user.name) {
    return String(user.name);
  }
  
  // Handle string
  if (typeof user === 'string') {
    return user;
  }
  
  return "Unknown";
}

/**
 * Get status label in Indonesian
 * @param {string} status - Status from API
 * @returns {string} Indonesian status label
 */
export function getStatusLabel(status) {
  const statusMap = {
    'accepted': 'Disetujui',
    'pending': 'Sedang Proses',
    'rejected': 'Ditolak',
    'active': 'Aktif',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'draft': 'Draft'
  };
  return statusMap[status?.toLowerCase()] || status || '-';
}

/**
 * Get status color class
 * @param {string} status - Status from API
 * @returns {string} Tailwind CSS classes
 */
export function getStatusColor(status) {
  const lowerStatus = status?.toLowerCase();
  
  if (lowerStatus === 'accepted' || lowerStatus === 'disetujui') {
    return "bg-accent text-neutral-900";
  }
  if (lowerStatus === 'pending' || lowerStatus === 'sedang proses') {
    return "bg-warning text-neutral-900";
  }
  if (lowerStatus === 'rejected' || lowerStatus === 'ditolak') {
    return "bg-red-500 text-white";
  }
  if (lowerStatus === 'active' || lowerStatus === 'aktif') {
    return "bg-blue-500 text-white";
  }
  if (lowerStatus === 'completed' || lowerStatus === 'selesai') {
    return "bg-green-500 text-white";
  }
  
  return "bg-neutral-200 text-neutral-700";
}

/**
 * Get theme label in Indonesian
 * @param {string} tema - Theme code from API
 * @returns {string} Indonesian theme label
 */
export function getThemeLabel(tema) {
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
  return themeMap[tema?.toLowerCase()] || tema || '-';
}
