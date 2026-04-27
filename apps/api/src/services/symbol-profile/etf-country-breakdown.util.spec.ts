import { DataSource } from '@prisma/client';

import {
  normalizeCountryBreakdown,
  resolveStoredCountryBreakdown
} from './etf-country-breakdown.util';

describe('ETF country breakdown resolver', () => {
  it('prefers manual override countries over stored and catalog data', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      overrideCountries: [{ code: 'CA', weight: 1 }],
      storedCountries: [{ code: 'US', weight: 1 }],
      symbol: 'ACWV'
    });

    expect(result.countryBreakdownSource).toEqual('OVERRIDE');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([{ code: 'CA', weight: 1 }]);
  });

  it('keeps valid stored countries and labels them as provider data', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      storedCountries: [
        { code: 'US', weight: 0.7 },
        { code: 'JP', weight: 0.3 }
      ],
      symbol: 'ACWV'
    });

    expect(result.countryBreakdownSource).toEqual('PROVIDER');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([
      { code: 'US', weight: 0.7 },
      { code: 'JP', weight: 0.3 }
    ]);
  });

  it('falls back to the curated catalog for XEQT when countries are missing', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'XEQT.TO'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'US')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'CA')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'OTHER')).toBe(true);
  });

  it('uses the curated catalog for IEFA with developed-market countries', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'IEFA'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'JP')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'GB')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'OTHER')).toBe(true);
  });

  it('uses the curated catalog for FINN.NE when provider countries are missing', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'FINN.NE'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'US')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'TW')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'CA')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'OTHER')).toBe(true);
  });

  it('uses the curated catalog for XSU.TO instead of leaving it unknown', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'XSU.TO'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'US')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'KY')).toBe(true);
  });

  it('uses the curated catalog for IAT as a U.S.-only ETF', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'IAT'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([
      { code: 'US', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('uses the curated catalog for QQC.TO as a mostly U.S. Nasdaq allocation', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'QQC.TO'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'US')).toBe(true);
    expect(result.countries.some(({ code }) => code === 'IE')).toBe(true);
  });

  it('uses the curated catalog for U.S. CDR wrappers like PYPL.TO', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'PYPL.TO'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([
      { code: 'US', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('uses the curated catalog for U.S. CDR wrappers like CRM.TO', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'CRM.TO'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([
      { code: 'US', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('uses the curated catalog for Canadian listings like CLS.NE', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'STOCK',
      dataSource: DataSource.YAHOO,
      symbol: 'CLS.NE'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries).toEqual([
      { code: 'CA', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('classifies crypto-linked ETFs as BITCOIN via the curated catalog', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'IBIT'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('BITCOIN');
    expect(result.countries).toEqual([
      { code: 'BITCOIN', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('classifies direct bitcoin as BITCOIN via the curated catalog', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'CRYPTOCURRENCY',
      dataSource: DataSource.COINGECKO,
      symbol: 'bitcoin'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('BITCOIN');
    expect(result.countries).toEqual([
      { code: 'BITCOIN', source: 'CATALOG', weight: 1 }
    ]);
  });

  it('uses OTHER for direct crypto assets when no country data exists', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'CRYPTOCURRENCY',
      dataSource: DataSource.COINGECKO,
      symbol: 'ethereum'
    });

    expect(result.countryBreakdownSource).toEqual('NONE');
    expect(result.geographicAllocationKind).toEqual('OTHER');
    expect(result.countries).toEqual([{ code: 'OTHER', weight: 1 }]);
  });

  it('rejects invalid country sets and falls back to the catalog', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      storedCountries: [{ code: 'INVALID', weight: 1 }],
      symbol: 'ACWV'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    expect(result.countries.some(({ code }) => code === 'US')).toBe(true);
  });

  it('uses the fuller ACWV catalog breakdown including UK and a much smaller residual other bucket', () => {
    const result = resolveStoredCountryBreakdown({
      assetSubClass: 'ETF',
      dataSource: DataSource.YAHOO,
      symbol: 'ACWV'
    });

    expect(result.countryBreakdownSource).toEqual('CATALOG');
    expect(result.geographicAllocationKind).toEqual('COUNTRIES');
    const gb = result.countries.find(({ code }) => code === 'GB');
    const other = result.countries.find(({ code }) => code === 'OTHER');

    expect(gb).toBeDefined();
    expect(gb!.weight).toBeGreaterThan(0.0085);
    expect(gb!.weight).toBeLessThan(0.0095);
    expect(other).toBeDefined();
    expect(other!.weight).toBeGreaterThan(0.038);
    expect(other!.weight).toBeLessThan(0.039);
  });
});

describe('normalizeCountryBreakdown', () => {
  it('merges duplicate countries and renormalizes the weights', () => {
    const result = normalizeCountryBreakdown([
      { code: 'US', weight: 0.4 },
      { code: 'US', weight: 0.2 },
      { code: 'JP', weight: 0.2 }
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].code).toEqual('US');
    expect(result[0].weight).toBeCloseTo(0.75);
    expect(result[1].code).toEqual('JP');
    expect(result[1].weight).toBeCloseTo(0.25);
  });
});
