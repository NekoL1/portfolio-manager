import { DataSource } from '@prisma/client';

type CatalogSectorEntry = {
  name: string;
  weight: number;
};

export interface SectorCatalogEntry {
  asOf: string;
  sectors: CatalogSectorEntry[];
  source: string;
}

export const SECTOR_CATALOG: Record<string, SectorCatalogEntry> = {
  'YAHOO:BRK-B': {
    asOf: '2026-04-25',
    sectors: [
      { name: 'Financial Services', weight: 0.4981 },
      { name: 'Industrials', weight: 0.1634 },
      { name: 'Consumer Staples', weight: 0.0666 },
      { name: 'Technology', weight: 0.062 },
      { name: 'Utilities', weight: 0.0524 },
      { name: 'Other', weight: 0.0437 },
      { name: 'Consumer Cyclical', weight: 0.0395 },
      { name: 'Energy', weight: 0.0306 },
      { name: 'Basic Materials', weight: 0.0195 },
      { name: 'Healthcare', weight: 0.0142 },
      { name: 'Communication Services', weight: 0.01 },
      { name: 'Real Estate', weight: 0.0001 }
    ],
    source:
      'Curated Berkshire Hathaway look-through sector mix blending 2025 operating businesses, cash/T-bills, and the Q4 2025 disclosed equity portfolio (compiled 2026-04-25)'
  },
  'YAHOO:BRK.NE': {
    asOf: '2026-04-25',
    sectors: [
      { name: 'Financial Services', weight: 0.4981 },
      { name: 'Industrials', weight: 0.1634 },
      { name: 'Consumer Staples', weight: 0.0666 },
      { name: 'Technology', weight: 0.062 },
      { name: 'Utilities', weight: 0.0524 },
      { name: 'Other', weight: 0.0437 },
      { name: 'Consumer Cyclical', weight: 0.0395 },
      { name: 'Energy', weight: 0.0306 },
      { name: 'Basic Materials', weight: 0.0195 },
      { name: 'Healthcare', weight: 0.0142 },
      { name: 'Communication Services', weight: 0.01 },
      { name: 'Real Estate', weight: 0.0001 }
    ],
    source:
      'Curated Berkshire Hathaway look-through sector mix blending 2025 operating businesses, cash/T-bills, and the Q4 2025 disclosed equity portfolio (compiled 2026-04-25)'
  }
};

export const getSectorCatalogEntry = ({
  dataSource,
  symbol
}: {
  dataSource: DataSource;
  symbol: string;
}) => {
  return SECTOR_CATALOG[`${dataSource}:${symbol}`];
};
