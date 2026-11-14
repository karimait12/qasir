import { describe, expect, it } from 'vitest';
import { normalizeOverviewPayload } from './useOverviewStats';

describe('overview stats normalization', () => {
  it('normalizes authenticated payloads', () => {
    expect(
      normalizeOverviewPayload(
        {
          total_clicks: 120,
          previous_total_clicks: 95,
          unique_countries: 3,
          devices: { mobile: 50, desktop: 30, tablet: 10 },
          daily: [{ day: '2024-08-01', clicks: 10 }],
          countries: [{ country: 'US', clicks: 60 }],
          referrers: [{ host: 'example.com', clicks: 20 }],
          links_count: 12,
          total_all_time_clicks: 150,
        },
        false,
      ),
    ).toEqual({
      totalClicks: 120,
      previousTotalClicks: 95,
      uniqueCountries: 3,
      devices: { mobile: 50, desktop: 30, tablet: 10 },
      daily: [{ day: '2024-08-01', clicks: 10 }],
      countries: [{ country: 'US', clicks: 60 }],
      referrers: [{ host: 'example.com', clicks: 20 }],
      linksCount: 12,
      totalAllTimeClicks: 150,
      isPublic: false,
    });
  });

  it('returns empty arrays for public payloads without user-specific fields', () => {
    expect(
      normalizeOverviewPayload(
        {
          clicks_total: 321,
          countries_total: 5,
          links_total: 14,
          daily: [{ day: '2024-08-01', clicks: 13 }],
        },
        true,
      ),
    ).toEqual({
      totalClicks: 321,
      previousTotalClicks: 0,
      uniqueCountries: 5,
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      daily: [{ day: '2024-08-01', clicks: 13 }],
      countries: [],
      referrers: [],
      linksCount: 14,
      totalAllTimeClicks: 321,
      isPublic: true,
    });
  });
});
