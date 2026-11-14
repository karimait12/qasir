import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface OverviewDaily {
  day: string;
  clicks: number;
}

export interface OverviewCountry {
  country: string;
  clicks: number;
}

export interface OverviewReferrer {
  host: string;
  clicks: number;
}

export interface OverviewDevices {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface OverviewData {
  totalClicks: number;
  previousTotalClicks: number;
  uniqueCountries: number;
  devices: OverviewDevices;
  daily: OverviewDaily[];
  countries: OverviewCountry[];
  referrers: OverviewReferrer[];
  linksCount: number;
  totalAllTimeClicks: number;
  isPublic: boolean;
}

function mapDaily(data: unknown): OverviewDaily[] {
  return Array.isArray(data)
    ? data.map((entry: unknown) => {
        const item = (entry ?? {}) as Record<string, unknown>;
        return { day: String(item.day ?? ''), clicks: Number(item.clicks ?? 0) };
      })
    : [];
}

function mapCountries(data: unknown): OverviewCountry[] {
  return Array.isArray(data)
    ? data.map((entry: unknown) => {
        const item = (entry ?? {}) as Record<string, unknown>;
        return { country: String(item.country ?? ''), clicks: Number(item.clicks ?? 0) };
      })
    : [];
}

function mapReferrers(data: unknown): OverviewReferrer[] {
  return Array.isArray(data)
    ? data.map((entry: unknown) => {
        const item = (entry ?? {}) as Record<string, unknown>;
        return { host: String(item.host ?? ''), clicks: Number(item.clicks ?? 0) };
      })
    : [];
}

export function normalizeOverviewPayload(data: Record<string, unknown> | null | undefined, isPublic: boolean): OverviewData {
  const d = (data ?? {}) as Record<string, unknown>;
  const devices = (d.devices as Record<string, unknown> | null | undefined) ?? {};

  return {
    totalClicks: Number(d.total_clicks ?? d.clicks_total ?? 0),
    previousTotalClicks: Number(d.previous_total_clicks ?? 0),
    uniqueCountries: Number(d.unique_countries ?? d.countries_total ?? 0),
    devices: {
      mobile: Number(devices.mobile ?? 0),
      desktop: Number(devices.desktop ?? 0),
      tablet: Number(devices.tablet ?? 0),
    },
    daily: mapDaily(d.daily),
    countries: isPublic ? [] : mapCountries(d.countries),
    referrers: isPublic ? [] : mapReferrers(d.referrers),
    linksCount: Number(d.links_count ?? d.links_total ?? 0),
    totalAllTimeClicks: Number(d.total_all_time_clicks ?? d.clicks_total ?? 0),
    isPublic,
  };
}

export function useOverviewStats() {
  const { session, loading: authLoading } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (authLoading) {
        setData(null);
        return;
      }

      if (session) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const { data: rpcData, error: rpcError } = await supabase.rpc('overview_stats', {
          p_days: 7,
          p_tz: tz,
        });
        if (rpcError) throw rpcError;
        setData(normalizeOverviewPayload(rpcData as Record<string, unknown> | null | undefined, false));
        return;
      }

      const { data: rpcData, error: rpcError } = await supabase.rpc('public_stats');
      if (rpcError) throw rpcError;
      const publicData = normalizeOverviewPayload(rpcData as Record<string, unknown> | null | undefined, true);
      publicData.previousTotalClicks = 0;
      setData(publicData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stats unavailable');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, session]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      setData(null);
      return;
    }

    void fetchStats();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [authLoading, fetchStats]);

  return { data, loading, error };
}
