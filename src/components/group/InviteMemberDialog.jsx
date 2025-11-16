import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Plus, X } from 'lucide-react';

/**
 * InviteMemberDialog - Dialog untuk invite members ke group
 */
export const InviteMemberDialog = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
  isLoading = false,
  groupName = '',
}) => {
  const { toast } = useToast();
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  const addEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();

    // Validation
    if (!trimmedEmail) {
      toast({
        title: 'Error',
        description: 'Email tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: 'Error',
        description: 'Format email tidak valid',
        variant: 'destructive',
      });
      return;
    }

    // Check duplicate
    if (emails.includes(trimmedEmail)) {
      toast({
        title: 'Error',
        description: 'Email sudah ditambahkan',
        variant: 'destructive',
      });
      return;
    }

    // Max 10 emails per invitation
    if (emails.length >= 10) {
      toast({
        title: 'Error',
        description: 'Maksimal 10 email per sekali invite',
        variant: 'destructive',
      });
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmailInput('');
  };

  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (emails.length === 0) {
      toast({
        title: 'Error',
        description: 'Minimal 1 email harus diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit(emails);
      setEmails([]);
      setEmailInput('');
    } catch (error) {
      console.error('Invitation failed:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmails([]);
      setEmailInput('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Anggota ke Grup</DialogTitle>
          <DialogDescription>
            Tambahkan email anggota untuk join ke grup "{groupName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addEmail}
                disabled={isLoading || !emailInput.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tekan Enter atau klik tombol + untuk menambah email
            </p>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Email yang akan diinvite ({emails.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 bg-accent rounded-md"
                  >
                    <span className="flex items-center gap-2 text-sm truncate">
                      <Mail className="w-4 h-4 shrink-0 text-primary" />
                      <span className="truncate">{email}</span>
                    </span>
                    <button
                      onClick={() => removeEmail(index)}
                      disabled={isLoading}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || emails.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              `Invite ${emails.length > 0 ? `(${emails.length})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
