import { DataSource } from '@prisma/client';

import {
  normalizeSectorBreakdown,
  resolveStoredSectorBreakdown
} from './sector-breakdown.util';

describe('sector breakdown resolver', () => {
  it('prefers manual override sectors over stored and catalog data', () => {
    const result = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      overrideSectors: [{ name: 'Technology', weight: 1 }],
      storedSectors: [{ name: 'Financial Services', weight: 1 }],
      symbol: 'BRK-B'
    });

    expect(result).toEqual([{ name: 'Technology', weight: 1 }]);
  });

  it('uses the curated catalog for BRK-B instead of the provider single-sector stock label', () => {
    const result = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      storedSectors: [{ name: 'Financial Services', weight: 1 }],
      symbol: 'BRK-B'
    });

    expect(result.some(({ name }) => name === 'Financial Services')).toBe(true);
    expect(result.some(({ name }) => name === 'Industrials')).toBe(true);
    expect(result.some(({ name }) => name === 'Technology')).toBe(true);
    expect(result.some(({ name }) => name === 'Utilities')).toBe(true);

    const totalWeight = result.reduce((sum, { weight }) => {
      return sum + weight;
    }, 0);

    expect(totalWeight).toBeCloseTo(1);
  });

  it('uses the curated catalog for BRK.NE as well', () => {
    const result = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      storedSectors: [{ name: 'Financial Services', weight: 1 }],
      symbol: 'BRK.NE'
    });

    expect(result.some(({ name }) => name === 'Financial Services')).toBe(true);
    expect(result.some(({ name }) => name === 'Industrials')).toBe(true);
    expect(result.some(({ name }) => name === 'Technology')).toBe(true);
  });
});

describe('normalizeSectorBreakdown', () => {
  it('merges duplicate sector names and renormalizes the weights', () => {
    const result = normalizeSectorBreakdown([
      { name: 'Technology', weight: 0.2 },
      { name: 'Technology', weight: 0.3 },
      { name: 'Financial Services', weight: 0.5 }
    ]);

    expect(result).toHaveLength(2);

    const technology = result.find(({ name }) => name === 'Technology');
    const financialServices = result.find(
      ({ name }) => name === 'Financial Services'
    );

    expect(technology?.weight).toBeCloseTo(0.5);
    expect(financialServices?.weight).toBeCloseTo(0.5);
  });
});
