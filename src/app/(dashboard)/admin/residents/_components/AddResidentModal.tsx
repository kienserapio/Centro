"use client";

import { useState, useRef } from "react";
import type { Resident } from "./ResidentListing";

type ResidentType = "owner" | "tenant";

interface AddResidentModalProps {
  onClose: () => void;
  onAdd?: () => void;
  onSave?: (resident: Resident) => void;
  editResident?: Resident;
  existingAddresses: { phases: string[]; blocks: string[]; lots: string[]; streets: string[] };
}

export function AddResidentModal({ onClose, onAdd, onSave, editResident, existingAddresses }: AddResidentModalProps) {
  const isEditing = !!editResident;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const editUnit = editResident?.unit ?? null;

  const defaultPhase = editUnit?.phase ?? (isEditing ? "" : existingAddresses.phases[0] ?? "Phase 1");
  const defaultBlock = editUnit?.block_number
    ? `Block ${editUnit.block_number}`
    : (isEditing ? "" : existingAddresses.blocks[0] ?? "Block 1");
  const defaultLot = editUnit?.lot_number
    ? `Lot ${editUnit.lot_number}`
    : (isEditing ? "" : existingAddresses.lots[0] ?? "Lot 1");
  const defaultStreet = editUnit?.address_label ?? (isEditing ? "" : existingAddresses.streets[0] ?? "Street 1");
  const [form, setForm] = useState({
    name: editResident?.name ?? "",
    email: editResident?.email ?? "",
    phone: editResident?.phone ?? "",
    username: editResident?.username ?? "",
    password: "",
    street: defaultStreet,
    phase: defaultPhase,
    block: defaultBlock,
    lot: defaultLot,
    customPhase: "",
    customBlock: "",
    customLot: "",
    customStreet: "",
    useCustomPhase: false,
    useCustomBlock: false,
    useCustomLot: false,
    useCustomStreet: false,
    residentType: ((editResident?.houseStatus === "tenant" ? "tenant" : "owner") as ResidentType),
  });

  function cleanUnitValue(value: string, prefix: string) {
    return value.replace(new RegExp(`^${prefix}\\s*`, "i"), "").trim();
  }

  function getResolvedAddress() {
    const phase = form.useCustomPhase ? form.customPhase : form.phase;
    const block = form.useCustomBlock ? form.customBlock : form.block;
    const lot = form.useCustomLot ? form.customLot : form.lot;
    const street = form.useCustomStreet ? form.customStreet : form.street;

    const cleanPhase = cleanUnitValue(phase, "Phase");
    const cleanBlock = cleanUnitValue(block, "Block");
    const cleanLot = cleanUnitValue(lot, "Lot");
    const trimmedStreet = street.trim();
    const fallbackLabel = cleanBlock && cleanLot ? `Block ${cleanBlock}, Lot ${cleanLot}` : "";

    return {
      phase: cleanPhase || null,
      block_number: cleanBlock,
      lot_number: cleanLot,
      address_label: trimmedStreet || fallbackLabel,
    };
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const resolvedUnit = getResolvedAddress();
    const hasUnitInput =
      !!resolvedUnit.block_number ||
      !!resolvedUnit.lot_number ||
      !!resolvedUnit.address_label ||
      !!resolvedUnit.phase;

    if (!hasUnitInput && isEditing && !editUnit) {
      onSave?.({
        ...editResident!,
        name: form.name,
        phone: form.phone,
        houseStatus: form.residentType === "owner" ? "owner" : "tenant",
        unit: null,
      });
      onClose();
      return;
    }

    if (!resolvedUnit.block_number || !resolvedUnit.lot_number) {
      setErrorMsg("Block and lot are required.");
      return;
    }

    // ── Editing an existing resident: call onSave (parent handles PATCH) ──
    if (isEditing && editResident) {
      const emailValue = form.email.trim();
      const usernameValue = form.username.trim();
      const passwordValue = form.password.trim();

      onSave?.({
        ...editResident,
        name: form.name,
        email: emailValue || editResident.email,
        username: usernameValue || editResident.username,
        password: passwordValue || undefined,
        phone: form.phone,
        houseStatus: form.residentType === "owner" ? "owner" : "tenant",
        unit: resolvedUnit,
      });
      onClose();
      return;
    }

    // ── Creating a new resident ──
    setIsSubmitting(true);
    console.log("[AddResidentModal] 🚀 Submit clicked");

    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.name,
        username: form.username,
        role: "resident",
        phone: form.phone,
        resident_type: form.residentType,
        unit: resolvedUnit,
      };

      console.log("[AddResidentModal] 📤 Sending to /api/admin/create-user:", {
        ...payload,
        password: "***",
      });

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[AddResidentModal] 📥 Response:", res.status, data);

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      console.log("[AddResidentModal] ✅ Resident created successfully!");
      onAdd?.();
      onClose();
    } catch (err) {
      console.error("[AddResidentModal] ❌ Fetch error:", err);
      setErrorMsg("Network error. Check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const inputClass =
    "w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition";
  const selectClass =
    "flex-1 px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition";

  const phaseOptions = form.phase && !existingAddresses.phases.includes(form.phase)
    ? [form.phase, ...existingAddresses.phases]
    : existingAddresses.phases;
  const blockOptions = form.block && !existingAddresses.blocks.includes(form.block)
    ? [form.block, ...existingAddresses.blocks]
    : existingAddresses.blocks;
  const lotOptions = form.lot && !existingAddresses.lots.includes(form.lot)
    ? [form.lot, ...existingAddresses.lots]
    : existingAddresses.lots;
  const streetOptions = form.street && !existingAddresses.streets.includes(form.street)
    ? [form.street, ...existingAddresses.streets]
    : existingAddresses.streets;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-icons-round">{isEditing ? "edit" : "person_add"}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#111827]">{isEditing ? "Edit Resident" : "Add New Resident"}</h3>
              <p className="text-xs text-[#6B7280]">{isEditing ? "Update resident details." : "Register a new community member."}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5 overflow-y-auto">
          {/* Avatar Upload */}
          <div
            className="flex flex-col items-center gap-3 py-5 border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F8F9FA] cursor-pointer hover:border-secondary/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <div
                className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-secondary/30"
                style={{ backgroundImage: `url('${avatarPreview}')` }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#6B7280] shadow-sm">
                <span className="material-icons-round text-3xl">add_a_photo</span>
              </div>
            )}
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              {avatarPreview ? "Change Photo" : "Upload Profile Photo"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+63 9XX XXX XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required={!isEditing}
                placeholder="juan@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Username + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                placeholder="j.delacruz24"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required={!isEditing}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEditing ? "Leave blank to keep" : "••••••••"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!isEditing}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <span className="material-icons-round text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Resident Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Resident Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-1">
              {(["owner", "tenant"] as const).map((type) => {
                const selected = form.residentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, residentType: type })}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      selected
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {type === "owner" ? "Owner Resident" : "Tenant Resident"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Address
            </label>

            {/* Phase */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#6B7280] font-medium">Phase</span>
              <div className="flex gap-2 items-center">
                {form.useCustomPhase ? (
                  <input
                    type="text"
                    placeholder="e.g. Phase 4"
                    value={form.customPhase}
                    onChange={(e) => setForm({ ...form, customPhase: e.target.value })}
                    className={selectClass}
                  />
                ) : (
                  <select
                    value={form.phase}
                    onChange={(e) => setForm({ ...form, phase: e.target.value })}
                    className={selectClass}
                  >
                    {phaseOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCustomPhase: !form.useCustomPhase, customPhase: "" })}
                  className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-secondary/10 hover:text-secondary transition-colors"
                >
                  {form.useCustomPhase ? "Use existing" : "Add new"}
                </button>
              </div>
            </div>

            {/* Block */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#6B7280] font-medium">Block</span>
              <div className="flex gap-2 items-center">
                {form.useCustomBlock ? (
                  <input
                    type="text"
                    placeholder="e.g. Block 11"
                    value={form.customBlock}
                    onChange={(e) => setForm({ ...form, customBlock: e.target.value })}
                    className={selectClass}
                  />
                ) : (
                  <select
                    value={form.block}
                    onChange={(e) => setForm({ ...form, block: e.target.value })}
                    className={selectClass}
                  >
                    {blockOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCustomBlock: !form.useCustomBlock, customBlock: "" })}
                  className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-secondary/10 hover:text-secondary transition-colors"
                >
                  {form.useCustomBlock ? "Use existing" : "Add new"}
                </button>
              </div>
            </div>

            {/* Lot */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#6B7280] font-medium">Lot</span>
              <div className="flex gap-2 items-center">
                {form.useCustomLot ? (
                  <input
                    type="text"
                    placeholder="e.g. Lot 16"
                    value={form.customLot}
                    onChange={(e) => setForm({ ...form, customLot: e.target.value })}
                    className={selectClass}
                  />
                ) : (
                  <select
                    value={form.lot}
                    onChange={(e) => setForm({ ...form, lot: e.target.value })}
                    className={selectClass}
                  >
                    {lotOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCustomLot: !form.useCustomLot, customLot: "" })}
                  className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-secondary/10 hover:text-secondary transition-colors"
                >
                  {form.useCustomLot ? "Use existing" : "Add new"}
                </button>
              </div>
            </div>

            {/* Street */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#6B7280] font-medium">Street</span>
              <div className="flex gap-2 items-center">
                {form.useCustomStreet ? (
                  <input
                    type="text"
                    placeholder="e.g. Mango Street"
                    value={form.customStreet}
                    onChange={(e) => setForm({ ...form, customStreet: e.target.value })}
                    className={selectClass}
                  />
                ) : (
                  <select
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className={selectClass}
                  >
                    {streetOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCustomStreet: !form.useCustomStreet, customStreet: "" })}
                  className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-secondary/10 hover:text-secondary transition-colors"
                >
                  {form.useCustomStreet ? "Use existing" : "Add new"}
                </button>
              </div>
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
            className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons-round text-[18px]">{isEditing ? "save" : "person_add"}</span>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Resident"}
          </button>
        </form>
      </div>
    </div>
  );
}
