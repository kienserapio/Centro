"use client";

import { useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { RolesListing, StaffMember } from "./_components/RolesListing";
import { AddUserModal } from "./_components/AddUserModal";

const INITIAL_MEMBERS: StaffMember[] = [
  {
    id: 1,
    name: "Alex Rivera",
    email: "alex.r@centro.com",
    phone: "+1 (555) 012-3456",
    role: "Admin",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmAoCxpphoasviwRKLnNQFXXgG2GpS0nhuEmSEIB2PsadO_Bi4WCcgSuhgMIhPUIGmWk2hRbU59hkaBuJDwaxJYw0gt21j1TI2QkR8g4qmOsaf1XejKPiMjcGVKM0Br4NvAYRhwWyKJJYDNaXFCRfNE7fr5uJNGR_jcaoVt7dhJY7x7VUzC4S4OgWymKnTYFKzQBrCfW8pSfP9Q0AH2ZlG_yCH8NPxkefhI0XNDoYEnJE1lZkxFtMBFZoMZJJQVjPfVmmuUXu60ZI",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    email: "s.jenkins@centro.com",
    phone: "+1 (555) 012-9876",
    role: "Security",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfcfTKb5KzA2jV1zf7tH4APgl1WcQRtw9k7gIWRnNQaJwTGzmTXGiCOm7ICsnVMSqKUYcANQVJWSVLzVAZ0yZBNehjpH_T_7Oqm5-Erl5qJAb7GcjpSv-c1Otz1Yijm7KkblzyDaVgVFaVvLMcdSGWLCWXBWpl64CF9-PlqWiqr_Kuhlsrh8nkOZ-8dEElsQyttDPQt9C8XYtwsBATaKvI9VpLRAGWZOTMODcqKAw76pkWDXHX0JrSvkBx0HqDi9dab4n1WEAHEDU",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "e.davis@centro.com",
    phone: "+1 (555) 012-3344",
    role: "Security",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBi-1aCMM5X1YkOS5MRLF7LFjMeI90C-xy_gJyTCUnfK_mAWQYl2t4s17jwsyxBRUpvVa3NYF7P4mkB1V4wuyd34XqX7IZLQT13_LadzfCMoBqxoluajMms4mnm8Ou2paIIBxy-T4ChvXJMvpOYhGoK1-q-p9vi4MnmFps7MR43Vm--wt_WxUwzR8rswP2tq28BkjDw3WxbI7ycoR8ULATc9z8tUWBkL03IWxJ07rdzR1wHSU98N7njJ4iZa1-j3aA-uQhHBjL-PbQ",
  },
];

export default function RolesPage() {
  const [members, setMembers] = useState<StaffMember[]>(INITIAL_MEMBERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  function handleAddUser(newMember: Omit<StaffMember, "id">) {
    setMembers((prev) => [...prev, { ...newMember, id: Date.now() }]);
  }

  function handleSaveUser(updated: StaffMember) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleRemove(id: number) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
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
          <RolesListing
            members={members}
            onEdit={(member) => setEditingMember(member)}
            onRemove={handleRemove}
          />
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddUserModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddUser}
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
