import { Sector } from '@ghostfolio/common/interfaces/sector.interface';

import { DataSource } from '@prisma/client';

import { getSectorCatalogEntry } from './sector-catalog';

const MAX_ACCEPTED_SECTOR_WEIGHT_SUM = 1.5;
const MIN_ACCEPTED_SECTOR_WEIGHT_SUM = 0.5;

export const normalizeSectorBreakdown = (rawSectors: Sector[] = []) => {
  const mergedSectors = new Map<string, Sector>();

  for (const sector of rawSectors ?? []) {
    const name = sector?.name?.trim?.();
    const weight = Number(sector?.weight);

    if (!name || !Number.isFinite(weight) || weight <= 0) {
      continue;
    }

    const existingSector = mergedSectors.get(name);

    mergedSectors.set(name, {
      name,
      weight: (existingSector?.weight ?? 0) + weight
    });
  }

  const normalizedSectors = [...mergedSectors.values()];
  const totalWeight = normalizedSectors.reduce((sum, { weight }) => {
    return sum + weight;
  }, 0);

  if (
    normalizedSectors.length <= 0 ||
    totalWeight < MIN_ACCEPTED_SECTOR_WEIGHT_SUM ||
    totalWeight > MAX_ACCEPTED_SECTOR_WEIGHT_SUM
  ) {
    return [];
  }

  return normalizedSectors.map((sector) => ({
    ...sector,
    weight: sector.weight / totalWeight
  }));
};

export const resolveStoredSectorBreakdown = ({
  dataSource,
  overrideSectors = [],
  storedSectors = [],
  symbol
}: {
  dataSource: DataSource;
  overrideSectors?: Sector[];
  storedSectors?: Sector[];
  symbol: string;
}) => {
  const normalizedOverrideSectors = normalizeSectorBreakdown(overrideSectors);

  if (normalizedOverrideSectors.length > 0) {
    return normalizedOverrideSectors;
  }

  const catalogEntry = getSectorCatalogEntry({ dataSource, symbol });

  if (catalogEntry) {
    const normalizedCatalogSectors = normalizeSectorBreakdown(
      catalogEntry.sectors
    );

    if (normalizedCatalogSectors.length > 0) {
      return normalizedCatalogSectors;
    }
  }

  return normalizeSectorBreakdown(storedSectors);
};
