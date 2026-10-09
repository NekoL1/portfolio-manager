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

const sector = (name: string, weight: number): CatalogSectorEntry => {
  return { name, weight };
};

const BLACKROCK_ISHARES_SOURCE =
  'BlackRock iShares fund download workbook, holdings as of 2026-07-01 (accessed 2026-07-02)';

// Classify Berkshire and its CDR by the company sector, not its investments.
const BRK_SECTORS: CatalogSectorEntry[] = [sector('Financial Services', 1)];

const ACWV_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.26621585),
  sector('Healthcare', 0.13705029),
  sector('Financial Services', 0.13591029),
  sector('Communication Services', 0.11201715),
  sector('Consumer Staples', 0.09595452),
  sector('Utilities', 0.07519909),
  sector('Industrials', 0.07059935),
  sector('Consumer Cyclical', 0.05086081),
  sector('Energy', 0.03164158),
  sector('Basic Materials', 0.01414629),
  sector('Real Estate', 0.00592017),
  sector('UNKNOWN', 0.00448461)
];

const CGDV_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.237),
  sector('Healthcare', 0.131),
  sector('Financial Services', 0.128),
  sector('Industrials', 0.107),
  sector('Consumer Staples', 0.095),
  sector('Communication Services', 0.093),
  sector('Consumer Cyclical', 0.078),
  sector('Energy', 0.052),
  sector('Utilities', 0.041),
  sector('Basic Materials', 0.025),
  sector('UNKNOWN', 0.009),
  sector('Real Estate', 0.006)
];

const EEMV_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.3927163),
  sector('Financial Services', 0.17996422),
  sector('Communication Services', 0.10659834),
  sector('Consumer Staples', 0.05546981),
  sector('Healthcare', 0.05273424),
  sector('Industrials', 0.0489828),
  sector('Consumer Cyclical', 0.04491849),
  sector('Utilities', 0.04324801),
  sector('Energy', 0.03338543),
  sector('Basic Materials', 0.02491666),
  sector('UNKNOWN', 0.01043704),
  sector('Real Estate', 0.00662866)
];

const FINN_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.4597),
  sector('Communication Services', 0.1768),
  sector('Consumer Cyclical', 0.1069),
  sector('Industrials', 0.0803),
  sector('Healthcare', 0.0499),
  sector('Financial Services', 0.0456),
  sector('Consumer Staples', 0.0365),
  sector('Basic Materials', 0.0327),
  sector('UNKNOWN', 0.0117)
];

const IEFA_SECTORS: CatalogSectorEntry[] = [
  sector('Financial Services', 0.23382843),
  sector('Industrials', 0.19557052),
  sector('Technology', 0.11880693),
  sector('Healthcare', 0.09624357),
  sector('Consumer Cyclical', 0.08647439),
  sector('Basic Materials', 0.06609178),
  sector('Consumer Staples', 0.06484717),
  sector('Communication Services', 0.03758306),
  sector('Utilities', 0.03578369),
  sector('Energy', 0.03253782),
  sector('Real Estate', 0.02726731),
  sector('UNKNOWN', 0.00496534)
];

const IGV_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.96457025),
  sector('Communication Services', 0.03482814),
  sector('UNKNOWN', 0.00060162)
];

const IWM_SECTORS: CatalogSectorEntry[] = [
  sector('Healthcare', 0.20038612),
  sector('Financial Services', 0.18652861),
  sector('Industrials', 0.14777629),
  sector('Technology', 0.14074508),
  sector('Consumer Cyclical', 0.09356586),
  sector('Real Estate', 0.05785643),
  sector('Energy', 0.05667843),
  sector('Basic Materials', 0.04189843),
  sector('Utilities', 0.02678422),
  sector('Communication Services', 0.02444341),
  sector('Consumer Staples', 0.01994541),
  sector('UNKNOWN', 0.0033917)
];

const SKYY_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.87487507),
  sector('Communication Services', 0.06346192),
  sector('Consumer Cyclical', 0.03457925),
  sector('Industrials', 0.0124925),
  sector('Financial Services', 0.00709574),
  sector('Healthcare', 0.00679592),
  sector('UNKNOWN', 0.00069958)
];

const VOO_SECTORS: CatalogSectorEntry[] = [
  sector('Technology', 0.3314),
  sector('Financial Services', 0.12100001),
  sector('Communication Services', 0.1075),
  sector('Consumer Cyclical', 0.1013),
  sector('Healthcare', 0.0986),
  sector('Industrials', 0.0868),
  sector('Consumer Staples', 0.0544),
  sector('Energy', 0.0349),
  sector('Utilities', 0.0249),
  sector('Real Estate', 0.0198),
  sector('Basic Materials', 0.0194)
];

export const SECTOR_CATALOG: Record<string, SectorCatalogEntry> = {
  'YAHOO:ACWV': {
    asOf: '2026-07-01',
    sectors: ACWV_SECTORS,
    source: BLACKROCK_ISHARES_SOURCE
  },
  'YAHOO:AVGO.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Technology', 1)],
    source:
      'Canadian Depositary Receipt wrapper for Broadcom Inc., treated as Broadcom technology sector exposure'
  },
  'YAHOO:BRK-B': {
    asOf: '2026-09-19',
    sectors: BRK_SECTORS,
    source:
      'Berkshire Hathaway company sector: Financial Services (Insurance - Diversified), https://finance.yahoo.com/quote/BRK-B/profile/'
  },
  'YAHOO:BRK.NE': {
    asOf: '2026-09-19',
    sectors: BRK_SECTORS,
    source:
      'Canadian Depositary Receipt wrapper for Berkshire Hathaway Inc., treated as Berkshire financial services sector exposure'
  },
  'YAHOO:BTCX-B.NE': {
    asOf: '2026-07-02',
    sectors: [sector('Bitcoin', 1)],
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX-B.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Bitcoin', 1)],
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Bitcoin', 1)],
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:BTCX.B': {
    asOf: '2026-07-02',
    sectors: [sector('Bitcoin', 1)],
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:CGDV': {
    asOf: '2026-05-31',
    sectors: CGDV_SECTORS,
    source:
      'Capital Group Dividend Value ETF official portfolio characteristics by sector as of 2026-05-31'
  },
  'YAHOO:CRM.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Technology', 1)],
    source:
      'Canadian Depositary Receipt wrapper for Salesforce, Inc., treated as Salesforce technology sector exposure'
  },
  'YAHOO:EEMV': {
    asOf: '2026-07-01',
    sectors: EEMV_SECTORS,
    source: BLACKROCK_ISHARES_SOURCE
  },
  'YAHOO:ETHA': {
    asOf: '2026-07-02',
    sectors: [sector('Ethereum', 1)],
    source: 'Curated catalog: spot Ethereum ETF classified as Ethereum exposure'
  },
  'YAHOO:FINN.NE': {
    asOf: '2026-06-30',
    sectors: FINN_SECTORS,
    source:
      'Fidelity Global Innovators ETF official portfolio allocation by sector as of 2026-06-30'
  },
  'YAHOO:IAT': {
    asOf: '2026-07-02',
    sectors: [sector('Financial Services', 1)],
    source:
      'iShares U.S. Regional Banks ETF objective: U.S.-based regional banking equities'
  },
  'YAHOO:IBIT': {
    asOf: '2026-07-02',
    sectors: [sector('Bitcoin', 1)],
    source: 'Curated catalog: spot bitcoin ETF classified as bitcoin exposure'
  },
  'YAHOO:IEFA': {
    asOf: '2026-07-01',
    sectors: IEFA_SECTORS,
    source: BLACKROCK_ISHARES_SOURCE
  },
  'YAHOO:IGV': {
    asOf: '2026-07-01',
    sectors: IGV_SECTORS,
    source: BLACKROCK_ISHARES_SOURCE
  },
  'YAHOO:IWM': {
    asOf: '2026-07-01',
    sectors: IWM_SECTORS,
    source: BLACKROCK_ISHARES_SOURCE
  },
  'YAHOO:PANW.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Technology', 1)],
    source:
      'Canadian Depositary Receipt wrapper for Palo Alto Networks, Inc., treated as Palo Alto Networks technology sector exposure'
  },
  'YAHOO:PSA.TO': {
    asOf: '2026-07-02',
    sectors: [sector('UNKNOWN', 1)],
    source:
      'Purpose High Interest Savings Fund treated as cash-like exposure rather than equity sector exposure'
  },
  'YAHOO:PYPL.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Financial Services', 1)],
    source:
      'Canadian Depositary Receipt wrapper for PayPal Holdings, Inc., treated as PayPal financial services sector exposure'
  },
  'YAHOO:SKYY': {
    asOf: '2026-07-01',
    sectors: SKYY_SECTORS,
    source:
      'First Trust SKYY official holdings classifications as of 2026-07-01 mapped to app sectors'
  },
  'YAHOO:UNH.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Healthcare', 1)],
    source:
      'Canadian Depositary Receipt wrapper for UnitedHealth Group Incorporated, treated as UnitedHealth healthcare sector exposure'
  },
  'YAHOO:VFV.TO': {
    asOf: '2026-07-02',
    sectors: VOO_SECTORS,
    source:
      'Vanguard Canada VFV provides S&P 500 exposure through VOO; mirrored to VOO sector exposure'
  },
  'YAHOO:VOO': {
    asOf: '2026-07-02',
    sectors: VOO_SECTORS,
    source: 'Vanguard S&P 500 ETF sector exposure from provider data'
  },
  'YAHOO:XLV': {
    asOf: '2026-07-02',
    sectors: [sector('Healthcare', 1)],
    source:
      'Health Care Select Sector SPDR Fund, treated as U.S. healthcare sector exposure'
  },
  'YAHOO:XSU.TO': {
    asOf: '2026-07-01',
    sectors: IWM_SECTORS,
    source:
      'XSU tracks Russell 2000 exposure; mirrored to BlackRock iShares IWM sector exposure'
  },
  'YAHOO:ZXLV.TO': {
    asOf: '2026-07-02',
    sectors: [sector('Healthcare', 1)],
    source: 'ZXLV holds the same U.S. health care exposure as XLV'
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
