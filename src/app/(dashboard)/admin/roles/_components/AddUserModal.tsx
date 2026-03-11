"use client";

import { useState } from "react";
import { StaffRole } from "./RoleBadge";
import type { StaffMember } from "./RolesListing";

interface AddUserModalProps {
  onClose: () => void;
  onAdd?: () => void;
  onSave?: (member: StaffMember) => void;
  editMember?: StaffMember;
}

const ROLES: StaffRole[] = ["Admin", "Security", "Resident"];

export function AddUserModal({ onClose, onAdd, onSave, editMember }: AddUserModalProps) {
  const isEditing = !!editMember;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: editMember?.name ?? "",
    email: editMember?.email ?? "",
    phone: editMember?.phone ?? "",
    username: "",
    password: "",
    role: (editMember?.role ?? "Admin") as StaffRole,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // ── Editing an existing user: use the parent callback ──
    if (isEditing && editMember) {
      onSave?.({
        ...editMember,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      });
      onClose();
      return;
    }

    // ── Creating a new user: call the API ──
    console.log("[AddUserModal] 🚀 Submit clicked");
    console.log("[AddUserModal] Form data:", { ...form, password: "***" });

    setIsSubmitting(true);

    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.name,      // maps form.name → API's full_name
        username: form.username,
        role: form.role.toLowerCase(), // "Admin" → "admin", "Security" → "guard" mapping below
        phone: form.phone,
      };

      // Map frontend role labels to database enum values
      const roleMap: Record<string, string> = {
        admin: "admin",
        security: "guard",
      };
      payload.role = roleMap[payload.role] ?? payload.role;

      console.log("[AddUserModal] 📤 Sending to /api/admin/create-user:", {
        ...payload,
        password: "***",
      });

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[AddUserModal] 📥 Response:", res.status, data);

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      console.log("[AddUserModal] ✅ User created successfully!");

      // Notify parent to re-fetch the user list
      onAdd?.();

      onClose();
    } catch (err) {
      console.error("[AddUserModal] ❌ Fetch error:", err);
      setErrorMsg("Network error. Check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-icons-round">person_add</span>
            </div>
            <h3 className="text-xl font-bold text-[#111827]">{isEditing ? "Edit User" : "Add New User"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3 py-4 border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F8F9FA] cursor-pointer hover:border-secondary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#6B7280] shadow-sm">
              <span className="material-icons-round text-3xl">add_a_photo</span>
            </div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Upload Profile Photo
            </span>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Mobile + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Mobile
              </label>
              <input
                type="tel"
                placeholder="+63..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="john@centro.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              placeholder="j.doe24"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                <span className="material-icons-round text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
