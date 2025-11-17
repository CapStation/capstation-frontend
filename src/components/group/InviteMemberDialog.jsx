'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const InviteMemberDialog = ({
  isOpen = false,
  onClose = () => {},
  onInvite = () => {},
  availableUsers = [],
  isLoading = false,
  error = null
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleInvite = () => {
    if (!selectedUserId) {
      return;
    }

    onInvite(selectedUserId);
    setSelectedUserId('');
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setSelectedUserId('');
      onClose();
    }
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
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user-select" className="text-neutral-700 font-semibold">
              Pilih Pengguna <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger
                id="user-select"
                className="border-neutral-300 text-neutral-900"
              >
                <SelectValue placeholder="Pilih pengguna" />
              </SelectTrigger>
              <SelectContent className="bg-white border-neutral-300">
                {availableUsers.length === 0 ? (
                  <div className="p-2 text-center text-neutral-600 text-sm">
                    Tidak ada pengguna tersedia
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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