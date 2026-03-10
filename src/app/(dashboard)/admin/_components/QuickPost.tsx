"use client";

import { useState } from "react";

export function QuickPost() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
        <span className="material-icons-round text-secondary">campaign</span>
        Quick Post
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
            Announcement Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Water Interruption"
            className="w-full bg-[#F8F9FA] border border-transparent rounded-xl text-sm px-3 py-2.5 text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase tracking-wider">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Write your community update here..."
            className="w-full bg-[#F8F9FA] border border-transparent rounded-xl text-sm px-3 py-2.5 text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all resize-none"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-[#6B7280] hover:text-secondary transition-colors"
            >
              <span className="material-icons-round text-[20px]">attach_file</span>
            </button>
            <button
              type="button"
              className="p-2 text-[#6B7280] hover:text-secondary transition-colors"
            >
              <span className="material-icons-round text-[20px]">image</span>
            </button>
          </div>
          <button
            type="submit"
            className="bg-secondary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-all flex items-center gap-2 shadow-sm"
          >
            Publish Post
            <span className="material-icons-round text-sm">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
