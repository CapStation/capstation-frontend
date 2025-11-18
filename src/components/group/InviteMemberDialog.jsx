'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const InviteMemberDialog = ({
  isOpen = false,
  onClose = () => {},
  onInvite = () => {},
  availableUsers = [],
  isLoading = false,
  error = null
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableUsers;
    }

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  // Get selected user info
  const selectedUser = availableUsers.find(u => u._id === selectedUserId);

  const handleInvite = () => {
    if (!selectedUserId) {
      return;
    }

    onInvite(selectedUserId);
    setSelectedUserId('');
    setSearchQuery('');
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setSelectedUserId('');
      setSearchQuery('');
      setIsDropdownOpen(false);
      onClose();
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-neutral-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">Undang Anggota</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Pilih pengguna yang ingin Anda undang untuk bergabung dengan grup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">
                  {typeof error === 'string' ? error : error.message || 'Terjadi kesalahan'}
                </p>
              </div>
            </div>
          )}

          {/* Combined Search and Dropdown */}
          <div className="space-y-2">
            <Label className="text-neutral-700 font-semibold">
              Pilih Mahasiswa <span className="text-red-500">*</span>
            </Label>
            
            <div className="relative">
              {/* Search Input / Display Selected */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
                <Input
                  type="text"
                  placeholder={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : "Cari mahasiswa berdasarkan nama atau email..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-9 border-neutral-300 text-neutral-900"
                />
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-neutral-600 text-sm">
                      {searchQuery 
                        ? 'Tidak ada mahasiswa yang sesuai dengan pencarian' 
                        : 'Tidak ada mahasiswa tersedia'}
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredUsers.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleSelectUser(user._id)}
                          className={cn(
                            "w-full px-3 py-2 text-left hover:bg-neutral-100 transition-colors flex items-center justify-between gap-2",
                            selectedUserId === user._id && "bg-primary/10"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">{user.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                          </div>
                          {selectedUserId === user._id && (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-500">
              * Hanya mahasiswa yang terverifikasi dan disetujui yang dapat diundang
              {searchQuery && ` (${filteredUsers.length} dari ${availableUsers.length} mahasiswa)`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Batal
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!selectedUserId || isLoading}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Undangan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;