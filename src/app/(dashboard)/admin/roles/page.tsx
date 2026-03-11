"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { RolesListing, StaffMember } from "./_components/RolesListing";
import { AddUserModal } from "./_components/AddUserModal";
import { StaffRole } from "./_components/RoleBadge";

/** Map DB role values to frontend display labels */
function mapDbRole(dbRole: string): StaffRole {
  switch (dbRole) {
    case "admin":
      return "Admin";
    case "guard":
      return "Security";
    case "resident":
      return "Resident";
    default:
      return "Resident";
  }
}

export default function RolesPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  /** Fetch all users from the database */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        console.error("[RolesPage] Failed to fetch users:", data.error);
        return;
      }

      // Map the DB profiles to the StaffMember shape the listing expects
      const mapped: StaffMember[] = data.map(
        (p: { id: string; full_name: string; role: string; phone: string; avatar_url: string | null; is_active: boolean }) => ({
          id: p.id,
          name: p.full_name || "—",
          email: "",
          phone: p.phone ?? "",
          role: mapDbRole(p.role),
          status: p.is_active ? "Active" as const : "Inactive" as const,
          avatar: p.avatar_url ?? "",
        })
      );

      setMembers(mapped);
    } catch (err) {
      console.error("[RolesPage] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users on initial mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** After creating a user, re-fetch from the database */
  function handleUserCreated() {
    fetchUsers();
  }

  /** After saving edits, call PATCH API and re-fetch */
  async function handleSaveUser(updated: StaffMember) {
    // Map the frontend role label back to DB enum
    const roleMap: Record<string, string> = {
      Admin: "admin",
      Security: "guard",
      Resident: "resident",
    };

    try {
      const res = await fetch(`/api/admin/users/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: updated.name,
          phone: updated.phone,
          role: roleMap[updated.role] ?? updated.role.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[RolesPage] Save failed:", data.error);
        alert(data.error || "Failed to save changes.");
        return;
      }

      console.log("[RolesPage] ✅ User updated");
      fetchUsers();
    } catch (err) {
      console.error("[RolesPage] Save error:", err);
      alert("Network error while saving.");
    }
  }

  /** Delete user via API and re-fetch */
  async function handleRemove(id: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[RolesPage] Delete failed:", data.error);
        alert(data.error || "Failed to delete user.");
        return;
      }

      console.log("[RolesPage] ✅ User deleted");
      fetchUsers();
    } catch (err) {
      console.error("[RolesPage] Delete error:", err);
      alert("Network error while deleting.");
    }
  }

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                Roles &amp; Permissions
              </h1>
              <p className="text-[#6B7280] mt-1">
                Manage administrative and security personnel access.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              <span className="material-icons-round text-[18px]">person_add</span>
              Add New User
            </button>
          </header>

          {/* Roles Listing */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round animate-spin mr-2">refresh</span>
              Loading users...
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round text-5xl mb-3">group_off</span>
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Click &quot;Add New User&quot; to create one.</p>
            </div>
          ) : (
            <RolesListing
              members={members}
              onEdit={(member) => setEditingMember(member)}
              onRemove={handleRemove}
            />
          )}
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddUserModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleUserCreated}
        />
      )}

      {editingMember && (
        <AddUserModal
          onClose={() => setEditingMember(null)}
          onSave={handleSaveUser}
          editMember={editingMember}
        />
      )}
    </div>
  );
}
