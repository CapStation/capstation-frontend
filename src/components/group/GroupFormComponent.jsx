'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import UserService from '@/services/UserService';

const GroupForm = ({ initialData = null, onSubmit, isLoading = false, error = null, success = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    maxMembers: initialData?.maxMembers || 2,
    inviteEmails: initialData?.inviteEmails || [],
    status: initialData?.status || 'active'
  });

  const [emailInput, setEmailInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [emailValidating, setEmailValidating] = useState(false);
  const [validatedEmails, setValidatedEmails] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama grup harus diisi';
    } else if (formData.name.length < 3) {
      errors.name = 'Nama grup minimal 3 karakter';
    } else if (formData.name.length > 100) {
      errors.name = 'Nama grup maksimal 100 karakter';
    }

    if (formData.description.length > 500) {
      errors.description = 'Deskripsi maksimal 500 karakter';
    }

    const maxMembersNum = parseInt(formData.maxMembers);
    if (isNaN(maxMembersNum) || maxMembersNum < 2 || maxMembersNum > 5) {
      errors.maxMembers = 'Max members harus antara 2-5';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAddEmail = async () => {
    if (!emailInput.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: 'Email tidak boleh kosong'
      }));
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: 'Format email tidak valid'
      }));
      return;
    }

    if (formData.inviteEmails.includes(emailInput.trim())) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: 'Email sudah ditambahkan'
      }));
      return;
    }

    // Check if email already validated
    const email = emailInput.trim().toLowerCase();
    if (!validatedEmails[email]) {
      setEmailValidating(true);
      try {
        const result = await UserService.searchByEmail(email);
        console.log('📧 Email validation result:', { email, result });
        
        if (result && result.success && result.data) {
          // User found
          console.log('✅ User found, adding to invite list:', result.data);
          setValidatedEmails((prev) => ({
            ...prev,
            [email]: true
          }));
          setFormData((prev) => ({
            ...prev,
            inviteEmails: [...prev.inviteEmails, email]
          }));
          setEmailInput('');
          if (formErrors.inviteEmails) {
            setFormErrors((prev) => ({
              ...prev,
              inviteEmails: null
            }));
          }
        } else {
          // User not found
          console.log('❌ User not found for email:', email);
          setFormErrors((prev) => ({
            ...prev,
            inviteEmails: `Email "${email}" belum terdaftar di sistem. Pastikan pengguna sudah membuat akun terlebih dahulu.`
          }));
        }
      } catch (err) {
        // API error
        console.error('🔴 Error searching for email:', err);
        setFormErrors((prev) => ({
          ...prev,
          inviteEmails: err.message || 'Terjadi kesalahan saat memverifikasi email'
        }));
      } finally {
        setEmailValidating(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        inviteEmails: [...prev.inviteEmails, email]
      }));
      setEmailInput('');
      if (formErrors.inviteEmails) {
        setFormErrors((prev) => ({
          ...prev,
          inviteEmails: null
        }));
      }
    }
  };

  const handleRemoveEmail = (email) => {
    setFormData((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit({
      name: formData.name,
      description: formData.description,
      maxMembers: parseInt(formData.maxMembers),
      inviteEmails: formData.inviteEmails,
      status: formData.status
    });
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">
          {initialData ? 'Edit Grup' : 'Buat Grup Baru'}
        </CardTitle>
        <CardDescription className="text-neutral-600">
          {initialData
            ? 'Ubah informasi grup Anda'
            : 'Buat grup baru untuk kolaborasi capstone'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Berhasil</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-700 font-semibold">
              Nama Grup <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: Tim Capstone AI"
              value={formData.name}
              onChange={handleChange}
              className={`border-neutral-300 text-neutral-900 placeholder:text-neutral-500 ${
                formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-neutral-700 font-semibold">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi grup (opsional)"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`border-neutral-300 text-neutral-900 placeholder:text-neutral-500 resize-none ${
                formErrors.description ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            <p className="text-xs text-neutral-600">
              {formData.description.length}/500
            </p>
            {formErrors.description && (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          {/* Max Members Field */}
          <div className="space-y-2">
            <Label htmlFor="maxMembers" className="text-neutral-700 font-semibold">
              Maksimal Anggota <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.maxMembers.toString()}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  maxMembers: value
                }));
                if (formErrors.maxMembers) {
                  setFormErrors((prev) => ({
                    ...prev,
                    maxMembers: null
                  }));
                }
              }}
            >
              <SelectTrigger className="border-neutral-300 text-neutral-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-neutral-300">
                {[2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Anggota
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-600">Minimum 2, maksimum 5 anggota per grup</p>
            {formErrors.maxMembers && (
              <p className="text-sm text-red-600">{formErrors.maxMembers}</p>
            )}
          </div>

          {/* Email Invite Field */}
          {!initialData && (
            <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Label className="text-neutral-700 font-semibold">
                Undang Anggota Berdasarkan Email
              </Label>
              <p className="text-xs text-neutral-600">
                Masukkan email dari anggota yang sudah terdaftar di sistem CapStation
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Contoh: nama@example.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (formErrors.inviteEmails) {
                      setFormErrors((prev) => ({
                        ...prev,
                        inviteEmails: null
                      }));
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !emailValidating) {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  disabled={emailValidating}
                  className="border-green-300 text-neutral-900 placeholder:text-neutral-500 disabled:bg-gray-100"
                />
                <Button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={emailValidating || isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 disabled:bg-gray-400"
                >
                  {emailValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validasi
                    </>
                  ) : (
                    'Tambah'
                  )}
                </Button>
              </div>
              {formErrors.inviteEmails && (
                <div className="text-sm p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  ❌ {formErrors.inviteEmails}
                  <p className="text-xs mt-1 text-red-600">
                    Pastikan email yang dimasukkan sudah terdaftar di sistem CapStation
                  </p>
                </div>
              )}

              {/* Email List */}
              {formData.inviteEmails.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-neutral-700">
                    ✅ Anggota yang diundang ({formData.inviteEmails.length}):
                  </p>
                  <div className="space-y-2">
                    {formData.inviteEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 bg-white border border-green-300 rounded-lg"
                      >
                        <span className="text-sm text-neutral-700">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-green-700">
                Anggota harus memiliki akun yang sudah terdaftar untuk bisa diundang
              </p>
            </div>
          )}

          {/* Status Field (Edit only) */}
          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-neutral-700 font-semibold">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    status: value
                  }));
                  if (formErrors.status) {
                    setFormErrors((prev) => ({
                      ...prev,
                      status: null
                    }));
                  }
                }}
              >
                <SelectTrigger className="border-neutral-300 text-neutral-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-300">
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                  <SelectItem value="archived">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5"
          >
            {isLoading ? 'Memproses...' : initialData ? 'Simpan Perubahan' : 'Buat Grup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;
