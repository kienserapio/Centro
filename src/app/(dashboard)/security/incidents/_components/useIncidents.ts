"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmergencyAlertWithDetails } from "@/lib/incidents/types";

interface UseIncidentsReturn {
  incidents: EmergencyAlertWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches emergency alerts from the API and provides refetch capability.
 * Used by both /security/incidents and /admin/incident-reports pages.
 */
export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<EmergencyAlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/incidents");

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to fetch incidents.");
        return;
      }

      const data: EmergencyAlertWithDetails[] = await res.json();
      setIncidents(data);
    } catch {
      setError("Network error. Could not load incidents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}
