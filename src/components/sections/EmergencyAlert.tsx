"use client";

type AlertCategory = "fire" | "intrusion" | "medical" | "other";

interface EmergencyAlertProps {
  category: AlertCategory;
  message: string;
  timestamp: string;
  onDismiss?: () => void;
}

const CATEGORY_STYLES: Record<AlertCategory, { label: string; className: string }> = {
  fire:      { label: "🔥 Fire Emergency",   className: "border-red-500 bg-red-50" },
  intrusion: { label: "🚨 Security Breach",  className: "border-orange-500 bg-orange-50" },
  medical:   { label: "🏥 Medical Emergency", className: "border-blue-500 bg-blue-50" },
  other:     { label: "⚠️ General Alert",    className: "border-yellow-500 bg-yellow-50" },
};

export function EmergencyAlert({
  category,
  message,
  timestamp,
  onDismiss,
}: EmergencyAlertProps) {
  const { label, className } = CATEGORY_STYLES[category];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        className={`w-full max-w-md rounded-xl border-2 p-6 shadow-xl ${className}`}
      >
        <h2 className="mb-1 text-lg font-bold">{label}</h2>
        <p className="mb-4 text-sm text-gray-700">{message}</p>
        <p className="mb-4 text-xs text-gray-500">{timestamp}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
