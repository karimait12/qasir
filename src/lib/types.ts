export interface Link {
  id: string;
  user_id: string;
  code: string;
  target_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  click_count: number;
  created_at: string;
}

export interface ClickRow {
  clicked_at: string;
  country: string | null;
  device: string | null;
  browser: string | null;
  referrer_host: string | null;
}

export interface Bucket {
  value: string;
  count: number;
}

export interface DailyPoint {
  date: string;
  count: number;
}

export interface LinkStats {
  total: number;
  last24h: number;
  series: DailyPoint[];
  countries: Bucket[];
  devices: Bucket[];
  browsers: Bucket[];
  referrers: Bucket[];
  uniqueCountries?: number;
  mobileShare?: number;
  avgLatency?: number | null;
}
