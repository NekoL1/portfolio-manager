import { OTHER_KEY } from '@ghostfolio/common/config';
import { CountryBreakdownSource } from '@ghostfolio/common/types';

import { DataSource } from '@prisma/client';

type CatalogCountryEntry = {
  code: string;
  source?: CountryBreakdownSource;
  weight: number;
};

export interface EtfCountryCatalogEntry {
  asOf: string;
  classification?: 'BITCOIN' | 'OTHER';
  countries?: CatalogCountryEntry[];
  source: string;
}

const SOURCE_CATALOG: CountryBreakdownSource = 'CATALOG';

export const ETF_COUNTRY_CATALOG: Record<string, EtfCountryCatalogEntry> = {
  'COINGECKO:bitcoin': {
    asOf: '2026-04-22',
    classification: 'BITCOIN',
    source: 'Curated catalog: direct bitcoin exposure'
  },
  'YAHOO:ACWV': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.5856 },
      { code: 'JP', source: SOURCE_CATALOG, weight: 0.102 },
      { code: 'CN', source: SOURCE_CATALOG, weight: 0.0644 },
      { code: 'IN', source: SOURCE_CATALOG, weight: 0.042 },
      { code: 'TW', source: SOURCE_CATALOG, weight: 0.0391 },
      { code: 'CH', source: SOURCE_CATALOG, weight: 0.0183 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.0152 },
      { code: 'HK', source: SOURCE_CATALOG, weight: 0.0134 },
      { code: 'FR', source: SOURCE_CATALOG, weight: 0.0114 },
      { code: 'SG', source: SOURCE_CATALOG, weight: 0.0112 },
      { code: 'NL', source: SOURCE_CATALOG, weight: 0.0105 },
      { code: 'GB', source: SOURCE_CATALOG, weight: 0.009 },
      { code: 'DE', source: SOURCE_CATALOG, weight: 0.0085 },
      { code: 'KR', source: SOURCE_CATALOG, weight: 0.0082 },
      { code: 'AU', source: SOURCE_CATALOG, weight: 0.0078 },
      { code: 'IL', source: SOURCE_CATALOG, weight: 0.0065 },
      { code: 'SE', source: SOURCE_CATALOG, weight: 0.0055 },
      { code: 'DK', source: SOURCE_CATALOG, weight: 0.0048 },
      { code: 'ES', source: SOURCE_CATALOG, weight: 0.0042 },
      { code: 'NO', source: SOURCE_CATALOG, weight: 0.0038 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0386 }
    ],
    source:
      'iShares ACWV Exposure Breakdowns (official issuer page, accessed 2026-04-22)'
  },
  'YAHOO:CGDV': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.835 },
      { code: 'IE', source: SOURCE_CATALOG, weight: 0.0417 },
      { code: 'GB', source: SOURCE_CATALOG, weight: 0.0336 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.0303 }
    ],
    source:
      'Trackinsight CGDV exposure data (accessed 2026-04-22); unavailable residue omitted and remaining weights normalized'
  },
  'YAHOO:CLS.NE': {
    asOf: '2026-04-22',
    countries: [{ code: 'CA', source: SOURCE_CATALOG, weight: 1 }],
    source:
      'Celestica Inc. investor relations identifies the issuer as a Canadian company (accessed 2026-04-22)'
  },
  'YAHOO:BTCX-B.NE': {
    asOf: '2026-04-22',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX.B': {
    asOf: '2026-04-22',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:IBIT': {
    asOf: '2026-04-22',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:IAT': {
    asOf: '2026-04-22',
    countries: [{ code: 'US', source: SOURCE_CATALOG, weight: 1 }],
    source:
      'iShares IAT official objective: index composed of U.S.-based regional banking equities (accessed 2026-04-22)'
  },
  'YAHOO:IEFA': {
    asOf: '2026-04-22',
    countries: [
      { code: 'JP', source: SOURCE_CATALOG, weight: 0.2498 },
      { code: 'GB', source: SOURCE_CATALOG, weight: 0.1405 },
      { code: 'CH', source: SOURCE_CATALOG, weight: 0.088 },
      { code: 'FR', source: SOURCE_CATALOG, weight: 0.086 },
      { code: 'DE', source: SOURCE_CATALOG, weight: 0.0841 },
      { code: 'AU', source: SOURCE_CATALOG, weight: 0.0715 },
      { code: 'NL', source: SOURCE_CATALOG, weight: 0.058 },
      { code: 'SE', source: SOURCE_CATALOG, weight: 0.0353 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.1822 }
    ],
    source:
      'Trackinsight IEFA exposure data (accessed 2026-04-22); unavailable residue omitted and remaining weights normalized'
  },
  'YAHOO:EEMV': {
    asOf: '2026-04-22',
    countries: [
      { code: 'CN', source: SOURCE_CATALOG, weight: 0.2062 },
      { code: 'IN', source: SOURCE_CATALOG, weight: 0.1757 },
      { code: 'TW', source: SOURCE_CATALOG, weight: 0.1711 },
      { code: 'KR', source: SOURCE_CATALOG, weight: 0.1074 },
      { code: 'SA', source: SOURCE_CATALOG, weight: 0.0664 },
      { code: 'AE', source: SOURCE_CATALOG, weight: 0.043 },
      { code: 'MY', source: SOURCE_CATALOG, weight: 0.0377 },
      { code: 'BR', source: SOURCE_CATALOG, weight: 0.0312 },
      { code: 'TH', source: SOURCE_CATALOG, weight: 0.0206 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.1515 }
    ],
    source: 'Trackinsight EEMV exposure data (accessed 2026-04-22)'
  },
  'YAHOO:IGV': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9917 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0083 }
    ],
    source: 'Trackinsight IGV exposure data (accessed 2026-04-22)'
  },
  'YAHOO:IWM': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9246 },
      { code: 'KY', source: SOURCE_CATALOG, weight: 0.0214 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.014 },
      { code: 'BM', source: SOURCE_CATALOG, weight: 0.0128 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0203 }
    ],
    source:
      'Trackinsight IWM exposure data (accessed 2026-04-22); unavailable residue omitted and remaining weights normalized'
  },
  'YAHOO:QCN.TO': {
    asOf: '2026-04-22',
    countries: [{ code: 'CA', source: SOURCE_CATALOG, weight: 0.9995 }],
    source: 'Trackinsight QCN exposure data (accessed 2026-04-22)'
  },
  'YAHOO:QQC.TO': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9635 },
      { code: 'IE', source: SOURCE_CATALOG, weight: 0.0172 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.0107 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0086 }
    ],
    source:
      'Trackinsight QQQ vs QQQM geographic exposure data used as the fallback look-through for QQC because QQC holds QQQM (accessed 2026-04-22)'
  },
  'YAHOO:PYPL.TO': {
    asOf: '2026-04-22',
    countries: [{ code: 'US', source: SOURCE_CATALOG, weight: 1 }],
    source:
      'CIBC Canadian Depositary Receipt wrapper for PayPal Holdings, Inc., treated as U.S. issuer exposure (accessed 2026-04-22)'
  },
  'YAHOO:CRM.TO': {
    asOf: '2026-04-22',
    countries: [{ code: 'US', source: SOURCE_CATALOG, weight: 1 }],
    source:
      'CIBC Canadian Depositary Receipt wrapper for Salesforce, Inc., treated as U.S. issuer exposure (accessed 2026-04-22)'
  },
  'YAHOO:VOO': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9649 },
      { code: 'IE', source: SOURCE_CATALOG, weight: 0.0211 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0068 }
    ],
    source:
      'Trackinsight VOO exposure data (accessed 2026-04-22); unavailable residue omitted and remaining weights normalized'
  },
  'YAHOO:XSU.TO': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9246 },
      { code: 'KY', source: SOURCE_CATALOG, weight: 0.0214 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.014 },
      { code: 'BM', source: SOURCE_CATALOG, weight: 0.0128 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0203 }
    ],
    source:
      'XSU official fact sheet shows the fund is primarily invested in iShares Russell 2000 ETF; mirrored to the Russell 2000 geographic mix using Trackinsight IWM exposure data (accessed 2026-04-22)'
  },
  'YAHOO:XEQT.TO': {
    asOf: '2026-04-22',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.4396 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.2436 },
      { code: 'JP', source: SOURCE_CATALOG, weight: 0.0603 },
      { code: 'GB', source: SOURCE_CATALOG, weight: 0.0353 },
      { code: 'CH', source: SOURCE_CATALOG, weight: 0.0225 },
      { code: 'FR', source: SOURCE_CATALOG, weight: 0.0221 },
      { code: 'DE', source: SOURCE_CATALOG, weight: 0.0205 },
      { code: 'AU', source: SOURCE_CATALOG, weight: 0.0193 },
      { code: 'CN', source: SOURCE_CATALOG, weight: 0.0132 },
      { code: 'NL', source: SOURCE_CATALOG, weight: 0.0131 },
      { code: 'TW', source: SOURCE_CATALOG, weight: 0.0124 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0978 }
    ],
    source:
      'BlackRock Canada XEQT Exposure Breakdowns (official issuer page, accessed 2026-04-22)'
  }
};

export const getEtfCountryCatalogEntry = ({
  dataSource,
  isin,
  symbol
}: {
  dataSource: DataSource;
  isin?: string;
  symbol: string;
}) => {
  if (isin && ETF_COUNTRY_CATALOG[isin]) {
    return ETF_COUNTRY_CATALOG[isin];
  }

  return ETF_COUNTRY_CATALOG[`${dataSource}:${symbol}`];
};
