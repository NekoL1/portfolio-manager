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

  describe.each(['BRK-B', 'BRK.NE'])('%s', (symbol) => {
    it.each([
      { label: 'missing', storedSectors: [] },
      {
        label: 'provider single-sector',
        storedSectors: [{ name: 'Financial Services', weight: 1 }]
      },
      {
        label: 'legacy look-through',
        storedSectors: [
          { name: 'Financial Services', weight: 0.5 },
          { name: 'Industrials', weight: 0.3 },
          { name: 'Technology', weight: 0.15 },
          { name: 'UNKNOWN', weight: 0.05 }
        ]
      }
    ])(
      'classifies the entire holding as Financial Services with $label stored data',
      ({ storedSectors }) => {
        expect(
          resolveStoredSectorBreakdown({
            dataSource: DataSource.YAHOO,
            storedSectors,
            symbol
          })
        ).toEqual([{ name: 'Financial Services', weight: 1 }]);
      }
    );
  });

  it('uses the current iShares catalog for IWM instead of stale provider sectors', () => {
    const result = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      storedSectors: [{ name: 'Industrials', weight: 1 }],
      symbol: 'IWM'
    });

    const healthcare = result.find(({ name }) => name === 'Healthcare');
    const industrials = result.find(({ name }) => name === 'Industrials');

    expect(healthcare?.weight).toBeGreaterThan(0.19);
    expect(industrials?.weight).toBeLessThan(0.16);
  });

  it('mirrors XSU.TO to the same sector exposure as IWM', () => {
    const iwmResult = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      symbol: 'IWM'
    });
    const xsuResult = resolveStoredSectorBreakdown({
      dataSource: DataSource.YAHOO,
      symbol: 'XSU.TO'
    });

    expect(xsuResult).toEqual(iwmResult);
  });

  it('uses catalog sectors for CDR wrappers and crypto ETFs', () => {
    expect(
      resolveStoredSectorBreakdown({
        dataSource: DataSource.YAHOO,
        symbol: 'AVGO.TO'
      })
    ).toEqual([{ name: 'Technology', weight: 1 }]);
    expect(
      resolveStoredSectorBreakdown({
        dataSource: DataSource.YAHOO,
        symbol: 'IBIT'
      })
    ).toEqual([{ name: 'Bitcoin', weight: 1 }]);
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
