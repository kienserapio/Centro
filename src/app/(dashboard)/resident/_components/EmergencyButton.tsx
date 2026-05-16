interface Props {
  onClick?: () => void;
}

export function EmergencyButton({ onClick }: Props) {
  return (
    <div className="fixed bottom-8 right-8 z-50 group hidden md:block">
      <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-slate-900 text-white text-xs py-2 px-4 rounded-lg whitespace-nowrap shadow-xl">
          Report an incident immediately
        </div>
      </div>
      <button
        onClick={onClick}
        className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-110 active:scale-95 transition-all"
      >
        <span className="material-icons-round text-3xl">emergency</span>
      </button>
    </div>
  );
}
