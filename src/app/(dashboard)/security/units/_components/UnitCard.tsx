"use client";

export interface UnitNote {
  icon: string;
  label: string;
  bg: string;
  color: string;
}

export interface Unit {
  id: string;
  block: string;
  lot: string;
  phase: string;
  status: "occupied" | "vacant";
  residentName?: string;
  contact?: string;
  notes: UnitNote[];
}

interface Props {
  unit: Unit;
}

export function UnitCard({ unit }: Props) {
  const address = `B${unit.block} / L${unit.lot}`;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-md transition-shadow">
      {/* Card top */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#111827] leading-none">{address}</h3>
          <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-wide">
            {unit.phase}
          </p>
        </div>
        {unit.status === "occupied" ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Occupied
          </span>
        ) : (
          <span className="px-2 py-1 bg-[#F8F9FA] text-[#6B7280] text-[10px] font-bold rounded-full border border-[#E5E7EB]">
            Vacant
          </span>
        )}
      </div>

      {/* Card body */}
      {unit.status === "occupied" ? (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">
              Resident
            </p>
            <p className="text-sm font-semibold text-[#111827] mt-0.5">
              {unit.residentName}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">
              Contact
            </p>
            <p className="text-sm font-mono tracking-tight text-[#374151] mt-0.5">
              {unit.contact}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <span className="material-icons-round text-[#9CA3AF] text-3xl mb-1">
            meeting_room
          </span>
          <p className="text-[10px] text-[#9CA3AF] font-medium">No active resident</p>
        </div>
      )}

      {/* Card footer */}
      <div
        className={`mt-4 pt-4 border-t border-[#E5E7EB] flex items-center ${
          unit.status === "occupied" ? "justify-between" : "justify-end"
        }`}
      >
        {unit.status === "occupied" && (
          <div className="flex gap-1.5">
            {unit.notes.map((note) => (
              <div
                key={note.icon}
                title={note.label}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${note.bg} ${note.color}`}
              >
                <span className="material-icons-round text-[18px]">{note.icon}</span>
              </div>
            ))}
          </div>
        )}
        <button
          className={
            unit.status === "occupied"
              ? "p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              : "p-1.5 rounded-lg text-[#6B7280] hover:text-primary transition-colors"
          }
        >
          <span className="material-icons-round text-[20px]">
            {unit.status === "occupied" ? "info" : "edit"}
          </span>
        </button>
      </div>
    </div>
  );
}
