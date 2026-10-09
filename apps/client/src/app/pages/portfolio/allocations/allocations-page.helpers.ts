import { BITCOIN_KEY, UNKNOWN_KEY } from '@ghostfolio/common/config';

const CANONICAL_SECTORS = new Set([
  'Basic Materials',
  'Communication Services',
  'Consumer Cyclical',
  'Consumer Staples',
  'Energy',
  'Financial Services',
  'Healthcare',
  'Industrials',
  'Real Estate',
  'Technology',
  'Utilities'
]);

export function normalizeAllocationSectorName(name?: string) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return UNKNOWN_KEY;
  }

  if (normalizedName.toUpperCase() === BITCOIN_KEY) {
    return BITCOIN_KEY;
  }

  if (CANONICAL_SECTORS.has(normalizedName)) {
    return normalizedName;
  }

  return UNKNOWN_KEY;
}

export function getAllocationSectorDisplayName(name: string) {
  if (name === BITCOIN_KEY) {
    return 'Bitcoin';
  }

  return name;
}
