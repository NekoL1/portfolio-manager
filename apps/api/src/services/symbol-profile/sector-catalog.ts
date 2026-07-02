import { DataSource } from '@prisma/client';

interface CatalogSectorEntry {
  name: string;
  weight: number;
}

export interface SectorCatalogEntry {
  asOf: string;
  sectors: CatalogSectorEntry[];
  source: string;
}

export const SECTOR_CATALOG: Record<string, SectorCatalogEntry> = {
  'YAHOO:BRK-B': {
    asOf: '2026-05-15',
    sectors: [
      { name: 'Financial Services', weight: 0.481871 },
      { name: 'Industrials', weight: 0.167293 },
      { name: 'Consumer Staples', weight: 0.067956 },
      { name: 'Technology', weight: 0.058689 },
      { name: 'Utilities', weight: 0.052961 },
      { name: 'UNKNOWN', weight: 0.044168 },
      { name: 'Consumer Cyclical', weight: 0.037558 },
      { name: 'Energy', weight: 0.034782 },
      { name: 'Communication Services', weight: 0.021611 },
      { name: 'Basic Materials', weight: 0.019289 },
      { name: 'Healthcare', weight: 0.013722 },
      { name: 'Real Estate', weight: 0.000101 }
    ],
    source:
      'Curated Berkshire Hathaway look-through sector mix blending the existing operating business/cash baseline with the Q1 2026 disclosed equity portfolio from Berkshire Hathaway 13F-HR filed 2026-05-15'
  },
  'YAHOO:BRK.NE': {
    asOf: '2026-05-15',
    sectors: [
      { name: 'Financial Services', weight: 0.481871 },
      { name: 'Industrials', weight: 0.167293 },
      { name: 'Consumer Staples', weight: 0.067956 },
      { name: 'Technology', weight: 0.058689 },
      { name: 'Utilities', weight: 0.052961 },
      { name: 'UNKNOWN', weight: 0.044168 },
      { name: 'Consumer Cyclical', weight: 0.037558 },
      { name: 'Energy', weight: 0.034782 },
      { name: 'Communication Services', weight: 0.021611 },
      { name: 'Basic Materials', weight: 0.019289 },
      { name: 'Healthcare', weight: 0.013722 },
      { name: 'Real Estate', weight: 0.000101 }
    ],
    source:
      'Curated Berkshire Hathaway look-through sector mix blending the existing operating business/cash baseline with the Q1 2026 disclosed equity portfolio from Berkshire Hathaway 13F-HR filed 2026-05-15'
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
