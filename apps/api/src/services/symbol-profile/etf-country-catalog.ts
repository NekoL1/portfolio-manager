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
  country('US', 0.59292524),
  country('JP', 0.09119033),
  country('CN', 0.05994325),
  country('TW', 0.04853717),
  country('IN', 0.0408154),
  country('CH', 0.01724187),
  country('CA', 0.01436736),
  country('HK', 0.01203344),
  country('FR', 0.01181926),
  country('KR', 0.01119909),
  country('SG', 0.01015894),
  country('SA', 0.00895024),
  country('NL', 0.00830471),
  country('DE', 0.00786436),
  country('IL', 0.00762243),
  country('FI', 0.0075699),
  country('GB', 0.00557189),
  country('ES', 0.00512785),
  country('BE', 0.00443768),
  country('AE', 0.00406234),
  country('TH', 0.00358295),
  country('MY', 0.00306583),
  country('IT', 0.00282249),
  country('BR', 0.00261021),
  country('KW', 0.00191934),
  country('ID', 0.00189038),
  country('CL', 0.0018771),
  country('QA', 0.00182927),
  country('MX', 0.00154959),
  country('HU', 0.00137984),
  country('TR', 0.00129337),
  country('NZ', 0.00114719),
  country('PH', 0.00111354),
  country('PE', 0.00098573),
  country('SE', 0.00081109),
  country('IE', 0.00060819),
  country('GR', 0.00059311),
  country('AT', 0.00048578),
  country('PT', 0.00043745),
  other(0.00024434),
  country('DK', 0.00000519),
  country('PL', 0.0000017),
  country('NO', 0.0000017),
  country('CZ', 0.0000017),
  country('AU', 0.0000002)
];

const EEMV_COUNTRIES: CatalogCountryEntry[] = [
  country('TW', 0.22404618),
  country('CN', 0.19320279),
  country('KR', 0.1707859),
  country('IN', 0.15182038),
  country('SA', 0.0641324),
  country('AE', 0.03367111),
  country('MY', 0.02413092),
  country('BR', 0.01819436),
  country('TH', 0.01806223),
  country('KW', 0.01530346),
  country('QA', 0.01493613),
  country('PE', 0.01120502),
  country('CL', 0.01087172),
  country('TR', 0.01037216),
  country('PH', 0.0082422),
  country('GR', 0.00647193),
  country('MX', 0.00575562),
  country('HU', 0.00406193),
  country('US', 0.00376136),
  country('CZ', 0.00313741),
  country('ZA', 0.00269539),
  country('EG', 0.00209296),
  country('PL', 0.00123848),
  country('HK', 0.00116775),
  country('ID', 0.00046067),
  other(0.00017955)
];

const IEFA_COUNTRIES: CatalogCountryEntry[] = [
  country('JP', 0.25701234),
  country('GB', 0.14095451),
  country('FR', 0.08951587),
  country('CH', 0.08873402),
  country('DE', 0.08057702),
  country('AU', 0.0699229),
  country('NL', 0.05532006),
  country('ES', 0.03603817),
  country('SE', 0.03601807),
  country('IT', 0.03196607),
  country('SG', 0.01769561),
  country('DK', 0.01760301),
  country('HK', 0.01716885),
  country('IL', 0.01636151),
  country('BE', 0.01191923),
  country('FI', 0.01159965),
  country('NO', 0.0081838),
  country('AT', 0.00434248),
  country('IE', 0.00363523),
  country('PT', 0.00206965),
  country('NZ', 0.00198466),
  other(0.00111032),
  country('GR', 0.00019319),
  country('US', 0.00007359),
  country('CA', 0.0000002)
];

const IGV_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.9926961),
  country('CA', 0.0073039)
];

const IWM_COUNTRIES: CatalogCountryEntry[] = [
  country('US', 0.98204109),
  country('CA', 0.0074686),
  country('BM', 0.0032631),
  country('NO', 0.0022595),
  country('BR', 0.0014843),
  country('GB', 0.0006872),
  country('SG', 0.0006357),
  country('PA', 0.0005856),
  country('IL', 0.0005764),
  country('MC', 0.0003616),
  country('CN', 0.0002409),
  country('IT', 0.0001912),
  country('BE', 0.0001504),
  country('IM', 0.0000453),
  country('GI', 0.0000091)
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
    asOf: '2026-07-01',
    countries: ACWV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares ACWV fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
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
    asOf: '2026-07-02',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX-B.TO': {
    asOf: '2026-07-02',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX.TO': {
    asOf: '2026-07-02',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX.B': {
    asOf: '2026-07-02',
    classification: 'BITCOIN',
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:IBIT': {
    asOf: '2026-07-02',
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
    asOf: '2026-07-01',
    countries: IEFA_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IEFA fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
  },
  'YAHOO:EEMV': {
    asOf: '2026-07-01',
    countries: EEMV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares EEMV fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
  },
  'YAHOO:ETHA': {
    asOf: '2026-07-02',
    classification: 'OTHER',
    source:
      'Curated catalog: spot Ethereum ETF classified as other crypto exposure'
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
    asOf: '2026-07-01',
    countries: IGV_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IGV fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
  },
  'YAHOO:IWM': {
    asOf: '2026-07-01',
    countries: IWM_COUNTRIES,
    preferOverStored: true,
    source:
      'BlackRock iShares IWM fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
  },
  'YAHOO:PSA.TO': {
    asOf: '2026-07-02',
    countries: [country('CA', 1)],
    preferOverStored: true,
    source:
      'Purpose High Interest Savings Fund treated as Canadian cash exposure'
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
  'YAHOO:AVGO.TO': {
    asOf: '2026-07-02',
    countries: [country('US', 1)],
    preferOverStored: true,
    source:
      'Canadian Depositary Receipt wrapper for Broadcom Inc., treated as U.S. issuer exposure'
  },
  'YAHOO:PANW.TO': {
    asOf: '2026-07-02',
    countries: [country('US', 1)],
    preferOverStored: true,
    source:
      'Canadian Depositary Receipt wrapper for Palo Alto Networks, Inc., treated as U.S. issuer exposure'
  },
  'YAHOO:UNH.TO': {
    asOf: '2026-07-02',
    countries: [country('US', 1)],
    preferOverStored: true,
    source:
      'Canadian Depositary Receipt wrapper for UnitedHealth Group Incorporated, treated as U.S. issuer exposure'
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
  'YAHOO:VFV.TO': {
    asOf: '2026-07-02',
    countries: [
      { code: 'US', source: SOURCE_CATALOG, weight: 0.9649 },
      { code: 'IE', source: SOURCE_CATALOG, weight: 0.0211 },
      { code: OTHER_KEY, source: SOURCE_CATALOG, weight: 0.0068 }
    ],
    preferOverStored: true,
    source:
      'Vanguard Canada VFV provides S&P 500 exposure through VOO; mirrored to VOO country exposure'
  },
  'YAHOO:SKYY': {
    asOf: '2026-06-23',
    countries: SKYY_COUNTRIES,
    preferOverStored: true,
    source:
      'First Trust SKYY official holdings as of 2026-06-23 with issuer-domicile country mapping (accessed 2026-06-24)'
  },
  'YAHOO:XSU.TO': {
    asOf: '2026-07-01',
    countries: IWM_COUNTRIES,
    preferOverStored: true,
    source:
      'XSU tracks the Russell 2000 exposure; mirrored to BlackRock iShares IWM fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)'
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
