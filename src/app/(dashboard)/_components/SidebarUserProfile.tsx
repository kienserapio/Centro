"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  /** "admin" shows role as subtext; "resident" shows address */
  variant: "admin" | "resident";
}

interface ProfileData {
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  units: {
    block_number: string | null;
    lot_number: string | null;
    phase: string | null;
    address_label: string | null;
    unit_type: "owned" | "rented" | "vacant" | null;
  } | null;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  guard: "Security",
  resident: "Resident",
};

const UNIT_TYPE_LABEL: Record<string, string> = {
  owned: "Owner-Occupied",
  rented: "Tenant-Occupied",
  vacant: "Vacant",
};

export function SidebarUserProfile({ variant }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, role, avatar_url, unit_residents(units(block_number, lot_number, phase, address_label, unit_type))"
        )
        .eq("id", user.id)
        .single();

      if (data) {
        // Supabase returns joined one-to-one relations as arrays; normalise to object or null
        const raw = data as unknown as {
          full_name: string | null;
          role: string | null;
          avatar_url: string | null;
          unit_residents: { units: ProfileData["units"][] }[];
        };
        const units = raw.unit_residents?.[0]?.units?.[0] ?? null;
        setProfile({
          full_name: raw.full_name,
          role: raw.role,
          avatar_url: raw.avatar_url,
          units,
        });
      }
    }

    load();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const name = profile?.full_name ?? "Juan Dela Cruz";

  let subtext: string;
  if (variant === "admin") {
    subtext = profile?.role ? (ROLE_LABEL[profile.role] ?? profile.role) : "Role";
  } else {
    // resident — prefer address_label, fallback to block/lot, fallback default
    const u = profile?.units;
    const occupancy = u?.unit_type ? (UNIT_TYPE_LABEL[u.unit_type] ?? "Unassigned") : "Unassigned";

    if (u?.address_label) {
      subtext = `${u.address_label} • ${occupancy}`;
    } else if (u?.block_number && u?.lot_number) {
      subtext = `Block ${u.block_number}, Lot ${u.lot_number} • ${occupancy}`;
    } else {
      subtext = occupancy;
    }
  }

  const avatarUrl = profile?.avatar_url;

  const signOutButton = (
    <button
      onClick={() => setConfirmOpen(true)}
      title="Sign out"
      className="p-1.5 text-[#6B7280] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
    >
      <span className="material-icons-round text-[18px]">logout</span>
    </button>
  );

  const confirmDialog = confirmOpen && (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-icons-round text-rose-500">logout</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Sign out?</h3>
            <p className="text-xs text-[#6B7280]">You will be redirected to the login page.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
          >
            {signingOut ? "Signing out…" : "Yes, sign out"}
          </button>
          <button
            onClick={() => setConfirmOpen(false)}
            disabled={signingOut}
            className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-xl hover:bg-[#F8F9FA] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === "admin") {
    return (
      <>
        {confirmDialog}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                <span className="material-icons-round text-[#6B7280] text-sm">person</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate">{name}</p>
              <p className="text-xs text-[#6B7280] truncate">{subtext}</p>
            </div>
            {signOutButton}
          </div>
        </div>
      </>
    );
  }

  // Resident style: card with bg pill
  return (
    <>
      {confirmDialog}
      <div className="p-4 mt-auto">
        <div className="bg-[#F8F9FA] rounded-xl p-4 flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
              <span className="material-icons-round text-[#6B7280]">person</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-[#111827]">{name}</p>
            <p className="text-xs text-[#6B7280] truncate">{subtext}</p>
          </div>
          {signOutButton}
        </div>
      </div>
    </>
  );
}
