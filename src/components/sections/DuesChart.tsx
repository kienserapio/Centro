"use client";

/**
 * DuesChart — wrapper around a chart library (e.g. Tremor / Recharts).
 * TODO: Install `@tremor/react` and replace the placeholder with a real BarChart.
 */

interface DuesDataPoint {
  month: string;
  paid: number;
  unpaid: number;
}

interface DuesChartProps {
  data: DuesDataPoint[];
}

export function DuesChart({ data }: DuesChartProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Dues Collection</h3>
      {/* TODO: Replace with <BarChart /> from @tremor/react */}
      <pre className="text-xs text-gray-400">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
