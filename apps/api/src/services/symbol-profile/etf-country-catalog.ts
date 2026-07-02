import { OTHER_KEY } from '@ghostfolio/common/config';
import { CountryBreakdownSource } from '@ghostfolio/common/types';

import { DataSource } from '@prisma/client';

interface CatalogCountryEntry {
  code: string;
  source?: CountryBreakdownSource;
  weight: number;
}

export interface EtfCountryCatalogEntry {
  asOf: string;
  classification?: 'BITCOIN' | 'OTHER';
  countries?: CatalogCountryEntry[];
  preferOverStored?: boolean;
  source: string;
}

const SOURCE_CATALOG: CountryBreakdownSource = 'CATALOG';

const country = (code: string, weight: number): CatalogCountryEntry => {
  return { code, source: SOURCE_CATALOG, weight };
};

const other = (weight: number): CatalogCountryEntry => {
  return country(OTHER_KEY, weight);
};

const ACWV_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.58525326),
  country('JP', 0.09166022),
  country('CN', 0.06195828),
  country('TW', 0.04931192),
  country('IN', 0.04164281),
  country('CH', 0.01744831),
  country('CA', 0.01469738),
  country('FR', 0.01244991),
  country('HK', 0.01229102),
  country('KR', 0.01129768),
  country('SG', 0.01020085),
  country('SA', 0.0091611),
  country('NL', 0.00839198),
  country('DE', 0.00828168),
  country('FI', 0.00784376),
  country('IL', 0.00767242),
  country('GB', 0.00550264),
  country('ES', 0.00526834),
  country('BE', 0.00458915),
  country('AE', 0.00419541),
  country('TH', 0.00350381),
  country('MY', 0.00312561),
  country('IT', 0.00305067),
  country('BR', 0.00258733),
  country('ID', 0.00208514),
  country('KW', 0.0019635),
  country('QA', 0.00187723),
  country('CL', 0.00187179),
  country('MX', 0.00157771),
  country('TR', 0.00138542),
  country('HU', 0.00137055),
  country('PH', 0.00119459),
  country('NZ', 0.00113692),
  country('PE', 0.00105744),
  country('SE', 0.00088947),
  country('GR', 0.00060286),
  country('IE', 0.00059647),
  country('AT', 0.00049171),
  country('PT', 0.00046171),
  other(0.00004128),
  country('DK', 0.00000526),
  country('CZ', 0.00000176),
  country('NO', 0.00000175),
  country('PL', 0.00000167),
  country('AU', 0.00000023)
];

const EEMV_COUNTRIES: CatalogCountryEntry[] = [
  country('TW', 0.22420924),
  country('CN', 0.19259081),
  country('KR', 0.1676274),
  country('IN', 0.15424117),
  country('SA', 0.0645254),
  country('AE', 0.03438449),
  country('MY', 0.02433511),
  country('BR', 0.01800283),
  country('TH', 0.01793264),
  country('KW', 0.01543988),
  country('QA', 0.01512667),
  country('PE', 0.01107794),
  country('TR', 0.01101926),
  country('CL', 0.01091746),
  country('PH', 0.00849583),
  country('GR', 0.00639777),
  country('MX', 0.00585071),
  country('HU', 0.00401891),
  country('CZ', 0.00319798),
  country('US', 0.00310955),
  country('ZA', 0.00268344),
  country('EG', 0.00213973),
  country('PL', 0.00124074),
  country('HK', 0.00091968),
  country('ID', 0.00050995),
  other(0.00000538)
];

const IEFA_COUNTRIES: CatalogCountryEntry[] = [
  country('JP', 0.25813686),
  country('GB', 0.14009019),
  country('FR', 0.08971477),
  country('CH', 0.08775746),
  country('DE', 0.08031943),
  country('AU', 0.07101672),
  country('NL', 0.05425389),
  country('ES', 0.03616329),
  country('SE', 0.0356043),
  country('IT', 0.03226812),
  country('SG', 0.0177164),
  country('HK', 0.01740451),
  country('DK', 0.0170791),
  country('IL', 0.01625686),
  country('BE', 0.01199047),
  country('FI', 0.01179261),
  country('NO', 0.00854354),
  country('AT', 0.00443307),
  country('IE', 0.0036634),
  country('PT', 0.00207417),
  country('NZ', 0.00197673),
  other(0.00152144),
  country('GR', 0.00019602),
  country('US', 0.00002644),
  country('CA', 0.00000021)
];

const IGV_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.99338666),
  country('CA', 0.00661334)
];

const IWM_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.98513203),
  country('CA', 0.00520436),
  country('NO', 0.00218813),
  country('BM', 0.0020915),
  country('GB', 0.00179858),
  country('BR', 0.00149811),
  country('SG', 0.00060837),
  country('PA', 0.00051701),
  country('MC', 0.00035374),
  country('IT', 0.0002352),
  country('IL', 0.00018568),
  country('BE', 0.00012554),
  country('IM', 0.0000403),
  country('JE', 0.00001321),
  country('GI', 0.00000551),
  country('SE', 0.00000273)
];

const SKYY_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.9327),
  country('CA', 0.0245),
  country('AU', 0.0154),
  country('DE', 0.0115),
  country('IL', 0.0098),
  country('NL', 0.0062)
];

const XLV_COUNTRIES: CatalogCountryEntry[] = [country('US', 1)];

const XEQT_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.45418465),
  country('CA', 0.24899537),
  country('JP', 0.06319624),
  country('GB', 0.0345563),
  country('FR', 0.02200936),
  country('CH', 0.0214574),
  country('DE', 0.01967449),
  country('AU', 0.01742544),
  country('TW', 0.01405676),
  country('NL', 0.01327331),
  country('KR', 0.01081217),
  country('CN', 0.00893094),
  country('ES', 0.00884766),
  country('SE', 0.00872899),
  country('IT', 0.00791078),
  country('IN', 0.00610149),
  country('SG', 0.00436216),
  country('HK', 0.00434164),
  country('DK', 0.0041465),
  country('IL', 0.00399463),
  country('BE', 0.00292481),
  country('FI', 0.00289602),
  country('NO', 0.0021001),
  country('BR', 0.0018619),
  country('BM', 0.00177528),
  country('ZA', 0.00150157),
  country('SA', 0.00125829),
  country('AT', 0.00108265),
  country('IE', 0.00092712),
  country('MX', 0.00081575),
  country('AE', 0.00056998),
  country('MY', 0.00055735),
  country('PL', 0.00054593),
  country('TH', 0.00054065),
  country('NZ', 0.00049913),
  country('PT', 0.00047664),
  other(0.00033246),
  country('GR', 0.00031966),
  country('ID', 0.00028828),
  country('TR', 0.00027921),
  country('KW', 0.00027638),
  country('QA', 0.00025143),
  country('CL', 0.00024231),
  country('PH', 0.00017312),
  country('PE', 0.00016954),
  country('HU', 0.00015785),
  country('CO', 0.00007874),
  country('CZ', 0.00005185),
  country('EG', 0.00003969)
];

export const ETF_COUNTRY_CATALOG: Record<string, EtfCountryCatalogEntry> = {
  'COINGECKO:bitcoin': {
    asOf: '2026-04-22',
    classification: 'BITCOIN',
    source: 'Curated catalog: direct bitcoin exposure'
  },
  'YAHOO:ACWV': {
    asOf: '2026-06-23',
    countries: ACWV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares ACWV fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
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
    asOf: '2026-06-23',
    countries: IEFA_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IEFA fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
  },
  'YAHOO:EEMV': {
    asOf: '2026-06-23',
    countries: EEMV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares EEMV fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
  },
  'YAHOO:FINN.NE': {
    asOf: '2026-04-24',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.7786 },
      { code: 'TW', source: SOURCE_CATALOG, weight: 0.0473 },
      { code: 'CA', source: SOURCE_CATALOG, weight: 0.046 },
      { code: 'DE', source: SOURCE_CATALOG, weight: 0.0204 },
      { code: 'CN', source: SOURCE_CATALOG, weight: 0.02 },
      { code: 'IT', source: SOURCE_CATALOG, weight: 0.0156 },
      { code: 'GB', source: SOURCE_CATALOG, weight: 0.014 },
      { code: 'JP', source: SOURCE_CATALOG, weight: 0.0134 },
      { code: 'NL', source: SOURCE_CATALOG, weight: 0.0106 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0341 }
    ],
    source:
      'Fidelity Global Innovators ETF (FINN) ETF facts geographic mix as of 2025-06-30, published by Fidelity Investments Canada and accessed 2026-04-24'
  },
  'YAHOO:IGV': {
    asOf: '2026-06-23',
    countries: IGV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IGV fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
  },
  'YAHOO:IWM': {
    asOf: '2026-06-23',
    countries: IWM_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IWM fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
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
  'YAHOO:SKYY': {
    asOf: '2026-06-23',
    countries: SKYY_COUNTRIES,
    preferOverStored: true,
    source:
      'First Trust SKYY official holdings as of 2026-06-23 with issuer-domicile country mapping (accessed 2026-06-24)'
  },
  'YAHOO:XSU.TO': {
    asOf: '2026-06-23',
    countries: IWM_COUNTRIES,
    preferOverStored: true,
    source:
      'XSU tracks the Russell 2000 exposure; mirrored to BlackRock iShares IWM fund download workbook, holdings as of 2026-06-23 (accessed 2026-06-24)'
  },
  'YAHOO:XLV': {
    asOf: '2026-06-24',
    countries: XLV_COUNTRIES,
    preferOverStored: true,
    source:
      'Health Care Select Sector SPDR Fund (XLV), treated as U.S. equity exposure'
  },
  'YAHOO:XEQT.TO': {
    asOf: '2026-06-24',
    countries: XEQT_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock Canada XEQT holdings CSV aggregate underlying holdings country look-through (accessed 2026-06-24)'
  },
  'YAHOO:ZXLV.TO': {
    asOf: '2026-06-24',
    countries: XLV_COUNTRIES,
    preferOverStored: true,
    source:
      'ZXLV holds the same U.S. health care exposure as XLV; mirrored to XLV country exposure'
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
