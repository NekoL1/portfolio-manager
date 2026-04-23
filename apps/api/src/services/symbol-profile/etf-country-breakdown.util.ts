import { BITCOIN_KEY, OTHER_KEY } from '@ghostfolio/common/config';
import { Country } from '@ghostfolio/common/interfaces/country.interface';
import {
  CountryBreakdownSource,
  GeographicAllocationKind
} from '@ghostfolio/common/types';

import { AssetSubClass, DataSource } from '@prisma/client';
import { countries } from 'countries-list';

import {
  EtfCountryCatalogEntry,
  getEtfCountryCatalogEntry
} from './etf-country-catalog';

type CountryWithOptionalSource = Pick<Country, 'code' | 'weight'> & {
  source?: CountryBreakdownSource;
};

const MAX_ACCEPTED_COUNTRY_WEIGHT_SUM = 1.5;
const MIN_ACCEPTED_COUNTRY_WEIGHT_SUM = 0.5;
const VALID_COUNTRY_CODES = new Set(Object.keys(countries));

export interface ResolvedCountryBreakdown {
  countries: CountryWithOptionalSource[];
  countryBreakdownSource: CountryBreakdownSource;
  geographicAllocationKind: GeographicAllocationKind;
}

export const getCountryBreakdownSourceFromRawCountries = (
  rawCountries: CountryWithOptionalSource[] = [],
  fallback: CountryBreakdownSource = 'PROVIDER'
) => {
  return (
    rawCountries.find(({ source }) => {
      return !!source;
    })?.source ?? fallback
  );
};

export const normalizeCountryBreakdown = (
  rawCountries: CountryWithOptionalSource[] = []
) => {
  const mergedCountries = new Map<string, CountryWithOptionalSource>();

  for (const country of rawCountries ?? []) {
    const code = country?.code?.toUpperCase?.();
    const weight = Number(country?.weight);

    if (
      !code ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !(
        code === BITCOIN_KEY ||
        code === OTHER_KEY ||
        VALID_COUNTRY_CODES.has(code)
      )
    ) {
      continue;
    }

    const existingCountry = mergedCountries.get(code);

    mergedCountries.set(code, {
      code,
      source: existingCountry?.source ?? country.source,
      weight: (existingCountry?.weight ?? 0) + weight
    });
  }

  const normalizedCountries = [...mergedCountries.values()];
  const totalWeight = normalizedCountries.reduce((sum, { weight }) => {
    return sum + weight;
  }, 0);

  if (
    normalizedCountries.length <= 0 ||
    totalWeight < MIN_ACCEPTED_COUNTRY_WEIGHT_SUM ||
    totalWeight > MAX_ACCEPTED_COUNTRY_WEIGHT_SUM
  ) {
    return [];
  }

  return normalizedCountries.map((country) => ({
    ...country,
    weight: country.weight / totalWeight
  }));
};

export const resolveStoredCountryBreakdown = ({
  assetSubClass,
  dataSource,
  isin,
  overrideCountries = [],
  storedCountries = [],
  symbol
}: {
  assetSubClass?: AssetSubClass;
  dataSource: DataSource;
  isin?: string;
  overrideCountries?: CountryWithOptionalSource[];
  storedCountries?: CountryWithOptionalSource[];
  symbol: string;
}): ResolvedCountryBreakdown => {
  const normalizedOverrideCountries =
    normalizeCountryBreakdown(overrideCountries);

  if (normalizedOverrideCountries.length > 0) {
    return {
      countries: normalizedOverrideCountries,
      countryBreakdownSource: 'OVERRIDE',
      geographicAllocationKind: getGeographicAllocationKind({
        countries: normalizedOverrideCountries
      })
    };
  }

  const normalizedStoredCountries = normalizeCountryBreakdown(storedCountries);

  if (normalizedStoredCountries.length > 0) {
    return {
      countries: normalizedStoredCountries,
      countryBreakdownSource:
        getCountryBreakdownSourceFromRawCountries(storedCountries),
      geographicAllocationKind: getGeographicAllocationKind({
        countries: normalizedStoredCountries
      })
    };
  }

  const catalogEntry = getEtfCountryCatalogEntry({ dataSource, isin, symbol });

  if (catalogEntry) {
    return resolveCatalogCountryBreakdown(catalogEntry);
  }

  if (assetSubClass === AssetSubClass.CRYPTOCURRENCY) {
    return {
      countries: [{ code: OTHER_KEY, weight: 1 }],
      countryBreakdownSource: 'NONE',
      geographicAllocationKind: 'OTHER'
    };
  }

  return {
    countries: [],
    countryBreakdownSource: 'NONE',
    geographicAllocationKind: 'UNKNOWN'
  };
};

export const resolveCatalogCountryBreakdown = (
  catalogEntry: EtfCountryCatalogEntry
): ResolvedCountryBreakdown => {
  if (catalogEntry.classification === 'OTHER') {
    return {
      countries: [{ code: OTHER_KEY, source: 'CATALOG', weight: 1 }],
      countryBreakdownSource: 'CATALOG',
      geographicAllocationKind: 'OTHER'
    };
  }

  if (catalogEntry.classification === 'BITCOIN') {
    return {
      countries: [{ code: BITCOIN_KEY, source: 'CATALOG', weight: 1 }],
      countryBreakdownSource: 'CATALOG',
      geographicAllocationKind: 'BITCOIN'
    };
  }

  const normalizedCatalogCountries = normalizeCountryBreakdown(
    catalogEntry.countries
  );

  if (normalizedCatalogCountries.length > 0) {
    return {
      countries: normalizedCatalogCountries,
      countryBreakdownSource: 'CATALOG',
      geographicAllocationKind: getGeographicAllocationKind({
        countries: normalizedCatalogCountries
      })
    };
  }

  return {
    countries: [],
    countryBreakdownSource: 'NONE',
    geographicAllocationKind: 'UNKNOWN'
  };
};

const getGeographicAllocationKind = ({
  countries
}: {
  countries: CountryWithOptionalSource[];
}): GeographicAllocationKind => {
  if (
    countries.length === 1 &&
    countries[0]?.code === BITCOIN_KEY &&
    countries[0]?.weight > 0
  ) {
    return 'BITCOIN';
  }

  if (
    countries.length === 1 &&
    countries[0]?.code === OTHER_KEY &&
    countries[0]?.weight > 0
  ) {
    return 'OTHER';
  }

  if (countries.length > 0) {
    return 'COUNTRIES';
  }

  return 'UNKNOWN';
};
