"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, Loader2, Plus, X, Mail } from "lucide-react";
import UserService from "@/services/UserService";

const GroupForm = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  error = null,
  success = null,
  existingProjects = [],
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    inviteEmails: initialData?.inviteEmails || [],
    status: initialData?.status || "active",
  });

  const [emailInput, setEmailInput] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [emailValidating, setEmailValidating] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState(
    initialData?.inviteEmails?.map((email) => ({
      email,
      name: email.split("@")[0],
      isValidated: true,
    })) || []
  );
  const [successMessages, setSuccessMessages] = useState([]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce timer for autocomplete
  const debounceTimer = useRef(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const result = await UserService.autocompleteEmail(query);
      if (result.success && result.data) {
        // Filter out already invited members
        const filtered = result.data.filter(
          (user) => !invitedMembers.some((m) => m.email === user.email)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle email input change with debounce
  const handleEmailInputChange = (value) => {
    setEmailInput(value);
    setSelectedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Clear errors
    if (formErrors.inviteEmails) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.inviteEmails;
        return newErrors;
      });
    }

    // Debounce autocomplete
    if (value.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value.trim());
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (user) => {
    setEmailInput(user.email);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else if (!emailValidating) {
          handleAddEmail();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Nama grup harus diisi";
    } else if (formData.name.length < 3) {
      errors.name = "Nama grup minimal 3 karakter";
    } else if (formData.name.length > 100) {
      errors.name = "Nama grup maksimal 100 karakter";
    }

    if (formData.description.length > 500) {
      errors.description = "Deskripsi maksimal 500 karakter";
    }



    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleAddEmail = async () => {
    if (!emailInput.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: "Email tidak boleh kosong",
      }));
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: "Format email tidak valid",
      }));
      return;
    }

    const email = emailInput.trim().toLowerCase();

    // Check if email already added
    if (invitedMembers.some((m) => m.email === email)) {
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails: "Email sudah ditambahkan",
      }));
      return;
    }

    setEmailValidating(true);
    try {
      const result = await UserService.searchByEmail(email);
      console.log("📧 Email validation result:", { email, result });

      if (result && result.success && result.data) {
        // User found
        console.log("✅ User found, adding to invite list:", result.data);
        const newMember = {
          email: email,
          name: result.data.name || email.split("@")[0],
          userId: result.data._id,
          isValidated: true,
        };

        setInvitedMembers((prev) => [...prev, newMember]);
        setFormData((prev) => ({
          ...prev,
          inviteEmails: [...prev.inviteEmails, email],
        }));
        setEmailInput("");
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.inviteEmails;
          return newErrors;
        });
        setSuccessMessages((prev) => [
          ...prev,
          `✅ ${email} berhasil ditambahkan`,
        ]);
        setTimeout(() => setSuccessMessages((prev) => prev.slice(1)), 3000);
      } else {
        // User not found - result.error contains the error message
        console.log("❌ User not found for email:", email);
        setFormErrors((prev) => ({
          ...prev,
          inviteEmails:
            result.error ||
            `Email "${email}" belum terdaftar di sistem. Pastikan pengguna sudah membuat akun terlebih dahulu.`,
        }));
      }
    } catch (err) {
      // Unexpected error
      console.error("🔴 Error searching for email:", err);
      setFormErrors((prev) => ({
        ...prev,
        inviteEmails:
          err.message || "Terjadi kesalahan saat memverifikasi email",
      }));
    } finally {
      setEmailValidating(false);
    }
  };

  const handleRemoveEmail = (email) => {
    setInvitedMembers((prev) => prev.filter((m) => m.email !== email));
    setFormData((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email),
    }));
  };

  const getInitials = (nameOrEmail) => {
    const name = nameOrEmail || "";
    return (
      name
        .split("@")[0]
        .split(".")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "MB"
    );
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
      inviteEmails: formData.inviteEmails,
      status: formData.status,
    });
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">
          {initialData ? "Edit Grup" : "Buat Grup Baru"}
        </CardTitle>
        <CardDescription className="text-neutral-600">
          {initialData
            ? "Ubah informasi grup Anda"
            : "Buat grup baru untuk kolaborasi capstone"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">
                {typeof error === "string"
                  ? error
                  : error.message || "Terjadi kesalahan"}
              </p>
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
                formErrors.name
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-neutral-700 font-semibold"
            >
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
                formErrors.description
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            <p className="text-xs text-neutral-600">
              {formData.description.length}/500
            </p>
            {formErrors.description && (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          {/* Email Invite Field */}
          {!initialData && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg">
              <div>
                <Label className="text-neutral-700 font-semibold text-base">
                  📧 Undang Anggota Berdasarkan Email
                </Label>
                <p className="text-xs text-neutral-600 mt-1">
                  Masukkan email dari anggota yang sudah terdaftar di sistem
                  CapStation. Mereka akan langsung ditambahkan ke grup.
                </p>
              </div>

              {/* Success Messages */}
              {successMessages.length > 0 && (
                <div className="space-y-2">
                  {successMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 bg-green-50 border border-green-200 rounded text-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {msg}
                    </div>
                  ))}
                </div>
              )}

              {/* Email Input with Add Button */}
              <div className="relative" ref={suggestionsRef}>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="email"
                    placeholder="Contoh: nama@example.com"
                    value={emailInput}
                    onChange={(e) => handleEmailInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={emailValidating || isLoading}
                    className="border-accent/50 text-neutral-900 placeholder:text-neutral-500 disabled:bg-gray-100 focus:border-accent focus:ring-accent/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddEmail}
                    disabled={
                      emailValidating || isLoading || !emailInput.trim()
                    }
                    className="bg-accent hover:bg-accent text-neutral-900 font-semibold px-6 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    {emailValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Validasi</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tambah</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-accent/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingSuggestions ? (
                      <div className="p-3 text-center text-sm text-neutral-600 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mencari...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions.map((user, index) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => selectSuggestion(user)}
                            className={`w-full px-3 py-2 text-left hover:bg-accent/10 transition-colors flex items-center gap-3 ${
                              index === selectedIndex ? "bg-accent/20" : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">
                                {getInitials(user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-neutral-600 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                {user.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {formErrors.inviteEmails && (
                <div className="text-sm p-3 bg-red-50 border border-red-200 rounded text-red-700 space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formErrors.inviteEmails}
                  </div>
                  <p className="text-xs text-red-600 ml-6">
                    Pastikan email yang dimasukkan sudah terdaftar di sistem
                    CapStation
                  </p>
                </div>
              )}

              {/* Invited Members List */}
              {invitedMembers.length > 0 && (
                <div className="space-y-3 mt-4 pt-4 border-t border-accent/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-700">
                      ✅ Anggota yang Diundang
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-accent/10 text-accent border-accent"
                    >
                      {invitedMembers.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {invitedMembers.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-3 bg-white border border-accent/30 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">
                              {getInitials(member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">
                              {member.name}
                            </p>
                            <p className="text-xs text-neutral-600 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(member.email)}
                          disabled={isLoading}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 flex-shrink-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-white border border-accent/20 rounded text-xs text-neutral-600 space-y-1">
                <p>
                  <strong className="text-neutral-700">ℹ️ Catatan:</strong>{" "}
                  Anggota yang diundang harus sudah memiliki akun terdaftar di
                  CapStation untuk bisa ditambahkan ke grup.
                </p>
              </div>
            </div>
          )}

          {/* Status Field (Edit only) */}
          {initialData && (
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-neutral-700 font-semibold"
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    status: value,
                  }));
                  if (formErrors.status) {
                    setFormErrors((prev) => ({
                      ...prev,
                      status: null,
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
            {isLoading
              ? "Memproses..."
              : initialData
              ? "Simpan Perubahan"
              : "Buat Grup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;
