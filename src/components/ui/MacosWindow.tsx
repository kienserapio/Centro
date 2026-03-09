import Image from "next/image";
import { Lock } from "lucide-react";

interface MacosWindowProps {
  src: string;
  alt: string;
  url?: string;
  className?: string;
}

export function MacosWindow({
  src,
  alt,
  url = "centro.io/dashboard",
  className = "",
}: MacosWindowProps) {
  return (
    <div className={`relative transition-transform duration-700 hover:-translate-y-2 ${className}`}>
      <div className="macos-window rounded-2xl overflow-hidden">
        {/* Title bar */}
        <div className="h-11 bg-white/50 border-b border-black/5 flex items-center px-4 shrink-0">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/10 block" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10 block" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10 block" />
          </div>
          {/* URL bar */}
          <div className="mx-auto flex items-center gap-1.5 bg-black/5 px-3 py-1 rounded-md">
            <Lock className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">{url}</span>
          </div>
          {/* Spacer to balance the traffic lights */}
          <div className="w-[54px]" />
        </div>

        {/* Screenshot */}
        <div className="p-1 bg-white/20">
          <Image
            src={src}
            alt={alt}
            width={900}
            height={580}
            className="w-full h-auto rounded-b-xl block"
            priority
          />
        </div>
      </div>

      {/* Soft drop shadow blob */}
      <div className="absolute -bottom-6 inset-x-16 h-8 bg-black/10 blur-3xl -z-10 rounded-full" />
    </div>
  );
}
