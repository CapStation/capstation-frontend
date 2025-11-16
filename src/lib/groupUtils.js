/**
 * Group Management Utilities
 */

export const groupStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

export const invitationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  switch (status) {
    case groupStatus.ACTIVE:
      return 'bg-accent text-neutral-900';
    case groupStatus.INACTIVE:
      return 'bg-neutral-200 text-neutral-700';
    case groupStatus.ARCHIVED:
      return 'bg-neutral-600 text-white';
    default:
      return 'bg-neutral-200 text-neutral-700';
  }
};

/**
 * Get role badge color
 */
export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'dosen':
      return 'bg-blue-100 text-blue-800';
    case 'mahasiswa':
      return 'bg-primary text-white';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

/**
 * Get role label
 */
export const getRoleLabel = (role) => {
  const roleMap = {
    admin: 'Admin',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa'
  };
  return roleMap[role] || role;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'GR';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date to locale string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date for short display
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if group is full
 */
export const isGroupFull = (group) => {
  return group.members.length >= group.maxMembers;
};

/**
 * Check if user is group owner
 */
export const isGroupOwner = (group, userId) => {
  return group.owner._id === userId;
};

/**
 * Check if user is group member
 */
export const isGroupMember = (group, userId) => {
  return group.members.some((member) => member._id === userId);
};

/**
 * Calculate available slots
 */
export const getAvailableSlots = (group) => {
  return group.maxMembers - group.members.length;
};

/**
 * Validate group name
 */
export const validateGroupName = (name) => {
  if (!name || !name.trim()) {
    return 'Nama grup harus diisi';
  }
  if (name.length < 3) {
    return 'Nama grup minimal 3 karakter';
  }
  if (name.length > 100) {
    return 'Nama grup maksimal 100 karakter';
  }
  return null;
};

/**
 * Validate group description
 */
export const validateGroupDescription = (description) => {
  if (description && description.length > 500) {
    return 'Deskripsi maksimal 500 karakter';
  }
  return null;
};

/**
 * Validate max members
 */
export const validateMaxMembers = (maxMembers) => {
  const num = parseInt(maxMembers);
  if (isNaN(num)) {
    return 'Max members harus berupa angka';
  }
  if (num < 1 || num > 10) {
    return 'Max members harus antara 1-10';
  }
  return null;
};
