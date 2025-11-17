'use client';

import React, { useState } from 'react';
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
import { AlertCircle, CheckCircle } from 'lucide-react';

const AnnouncementFormComponent = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    isImportant: initialData?.isImportant || false
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Judul harus diisi';
    } else if (formData.title.length < 3) {
      errors.title = 'Judul minimal 3 karakter';
    } else if (formData.title.length > 200) {
      errors.title = 'Judul maksimal 200 karakter';
    }

    if (!formData.content.trim()) {
      errors.content = 'Konten harus diisi';
    } else if (formData.content.length < 10) {
      errors.content = 'Konten minimal 10 karakter';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSelectChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">
          {initialData ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        </CardTitle>
        <CardDescription className="text-neutral-600">
          {initialData
            ? 'Ubah informasi pengumuman Anda'
            : 'Buat pengumuman baru untuk disampaikan ke pengguna sistem'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error.message || error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Berhasil</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-neutral-700 font-semibold">
              Judul <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Contoh: Pengumuman Ujian Akhir Semester"
              value={formData.title}
              onChange={handleChange}
              className={`border-neutral-300 text-neutral-900 placeholder:text-neutral-500 ${
                formErrors.title ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            <p className="text-xs text-neutral-600">
              {formData.title.length}/200
            </p>
            {formErrors.title && (
              <p className="text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-neutral-700 font-semibold">
              Konten <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Tulis konten pengumuman di sini..."
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className={`border-neutral-300 text-neutral-900 placeholder:text-neutral-500 resize-none ${
                formErrors.content ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            <p className="text-xs text-neutral-600">
              {formData.content.length} karakter (minimum 10)
            </p>
            {formErrors.content && (
              <p className="text-sm text-red-600">{formErrors.content}</p>
            )}
          </div>

          {/* Important Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <input
              type="checkbox"
              id="isImportant"
              name="isImportant"
              checked={formData.isImportant}
              onChange={handleChange}
              className="w-4 h-4 text-amber-600 rounded border-amber-300"
            />
            <label htmlFor="isImportant" className="text-sm font-medium text-amber-900 cursor-pointer">
              ⭐ Tandai sebagai pengumuman penting (akan ditampilkan di atas)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5"
            >
              {isLoading ? 'Memproses...' : initialData ? 'Simpan Perubahan' : 'Publikasikan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnnouncementFormComponent;