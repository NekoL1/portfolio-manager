import { Big } from 'big.js';
import { endOfDay, format, parseISO } from 'date-fns';

export interface LedgerActivity {
  accountId?: string;
  currency: string;
  date: string;
  fee: number;
  quantity: number;
  type: string;
  unitPrice: number;
}

export interface LedgerBalance {
  accountId?: string;
  currency: string;
  date: string;
  value: number;
}

/**
 * Reconstruct cash from trades and end-of-day account balance checkpoints.
 *
 * A buy first spends cash in its transaction currency, then other positive cash
 * balances in the same account at that day's FX rate. This currency conversion
 * is inferred because historical activity imports contain no FX transactions.
 * Only the remaining buy shortfall is inferred to be new external funding.
 *
 * A balance checkpoint represents all cash in its account, expressed in the
 * checkpoint currency. It replaces that account's currency buckets after all
 * activities on its date; the difference is an external deposit or withdrawal.
 */
export function calculatePortfolioCashLedger({
  activities,
  balances,
  dates,
  exchangeRates,
  targetCurrency
}: {
  activities: LedgerActivity[];
  balances: LedgerBalance[];
  dates: string[];
  exchangeRates: Record<string, Record<string, number>>;
  targetCurrency: string;
}): {
  cashBalances: {
    accountId?: string;
    balance: number;
    balanceInBaseCurrency: number;
    currency: string;
  }[];
  cashByDate: Record<string, Big>;
  cashFlows: { amount: number; date: string }[];
  contributionsByDate: Record<string, Big>;
} {
  const cashByDate: Record<string, Big> = {};
  const contributionsByDate: Record<string, Big> = {};
  const cashFlows: { amount: number; date: string }[] = [];
  const accounts = new Map<string, Map<string, Big>>();
  const activitiesByDate = new Map<string, LedgerActivity[]>();
  const balancesByDate = new Map<string, LedgerBalance[]>();
  const ratesByDate = new Map<string, Big>();
  let contributions = new Big(0);

  const getDate = (date: string) => format(parseISO(date), 'yyyy-MM-dd');
  const sortedRateDates = new Map<string, string[]>();
  const accountKey = (accountId?: string) => accountId ?? '__default__';
  const getAccount = (accountId?: string) => {
    const key = accountKey(accountId);

    if (!accounts.has(key)) {
      accounts.set(key, new Map());
    }

    return accounts.get(key);
  };

  const findRate = (pair: string, date: string) => {
    const historicalRates = exchangeRates[pair];

    if (!historicalRates) {
      return undefined;
    }

    // Carry the last known rate over market holidays, never a future rate.
    if (historicalRates[date] !== undefined) {
      return historicalRates[date];
    }

    if (!sortedRateDates.has(pair)) {
      sortedRateDates.set(pair, Object.keys(historicalRates).sort());
    }

    const rateDates = sortedRateDates.get(pair);
    let left = 0;
    let right = rateDates.length - 1;
    let latest = -1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);

      if (rateDates[middle] <= date) {
        latest = middle;
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    return latest < 0 ? undefined : historicalRates[rateDates[latest]];
  };

  const getRate = (currency: string, date: string): Big => {
    if (currency === targetCurrency) {
      return new Big(1);
    }

    const key = `${currency}:${date}`;
    const cached = ratesByDate.get(key);

    if (cached) {
      return cached;
    }

    const direct = findRate(`${currency}${targetCurrency}`, date);
    const inverse =
      direct === undefined
        ? findRate(`${targetCurrency}${currency}`, date)
        : undefined;
    const value = direct ?? inverse;

    if (value === undefined || !Number.isFinite(value) || value <= 0) {
      throw new Error(
        `Missing or invalid exchange rate for ${currency}/${targetCurrency} on ${date}`
      );
    }

    const rate = direct === undefined ? new Big(1).div(value) : new Big(value);
    ratesByDate.set(key, rate);

    return rate;
  };

  const convertToBase = (amount: Big, currency: string, date: string) =>
    amount.eq(0) ? new Big(0) : amount.mul(getRate(currency, date));

  const addFlow = (amount: Big, currency: string, date: string) => {
    if (amount.eq(0)) {
      return;
    }

    const value = convertToBase(amount, currency, getDate(date));
    contributions = contributions.plus(value);
    cashFlows.push({ amount: value.toNumber(), date });
  };

  for (const activity of [...activities].sort(
    (left, right) =>
      parseISO(left.date).getTime() - parseISO(right.date).getTime()
  )) {
    const date = getDate(activity.date);
    const datedActivities = activitiesByDate.get(date) ?? [];
    datedActivities.push(activity);
    activitiesByDate.set(date, datedActivities);
  }

  for (const balance of balances) {
    const date = getDate(balance.date);
    const datedBalances = balancesByDate.get(date) ?? [];
    datedBalances.push(balance);
    balancesByDate.set(date, datedBalances);
  }

  const valuationDates = Array.from(
    new Set([
      ...dates.map(getDate),
      ...activitiesByDate.keys(),
      ...balancesByDate.keys()
    ])
  ).sort();

  for (const date of valuationDates) {
    for (const activity of activitiesByDate.get(date) ?? []) {
      if (
        !['BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'FEE'].includes(activity.type)
      ) {
        continue;
      }

      const account = getAccount(activity.accountId);
      const currency = activity.currency;
      const gross = new Big(activity.quantity).mul(activity.unitPrice);
      const fee = new Big(activity.fee);
      let cash = account.get(currency) ?? new Big(0);

      if (activity.type === 'BUY') {
        const cost = gross.plus(fee);
        let shortfall = cost.minus(cash);

        if (shortfall.gt(0)) {
          for (const [otherCurrency, otherCash] of account) {
            if (otherCurrency === currency || otherCash.lte(0)) {
              continue;
            }

            const rate = getRate(otherCurrency, date).div(
              getRate(currency, date)
            );
            const available = otherCash.mul(rate);
            const transferred = available.lt(shortfall) ? available : shortfall;
            const spent = available.lt(shortfall)
              ? otherCash
              : transferred.div(rate);

            account.set(otherCurrency, otherCash.minus(spent));
            cash = cash.plus(transferred);
            shortfall = shortfall.minus(transferred);

            if (shortfall.eq(0)) {
              break;
            }
          }
        }

        if (shortfall.gt(0)) {
          addFlow(shortfall, currency, parseISO(activity.date).toISOString());
          cash = cash.plus(shortfall);
        }

        account.set(currency, cash.minus(cost));
      } else {
        // Fee activities use their fee field; quantity/price can be placeholders.
        const change = activity.type === 'FEE' ? fee.neg() : gross.minus(fee);
        account.set(currency, cash.plus(change));
      }
    }

    for (const balance of balancesByDate.get(date) ?? []) {
      const account = getAccount(balance.accountId);
      let cashInBaseCurrency = new Big(0);

      for (const [currency, amount] of account) {
        cashInBaseCurrency = cashInBaseCurrency.plus(
          convertToBase(amount, currency, date)
        );
      }

      const statedBalance = new Big(balance.value);
      const differenceInBaseCurrency = convertToBase(
        statedBalance,
        balance.currency,
        date
      ).minus(cashInBaseCurrency);

      addFlow(
        differenceInBaseCurrency,
        targetCurrency,
        endOfDay(parseISO(date)).toISOString()
      );
      accounts.set(
        accountKey(balance.accountId),
        new Map([[balance.currency, statedBalance]])
      );
    }

    let totalCash = new Big(0);

    for (const account of accounts.values()) {
      for (const [currency, amount] of account) {
        totalCash = totalCash.plus(convertToBase(amount, currency, date));
      }
    }

    cashByDate[date] = totalCash;
    contributionsByDate[date] = contributions;
  }

  const cashBalances = Array.from(accounts).flatMap(([accountId, account]) =>
    Array.from(account).map(([currency, amount]) => ({
      accountId: accountId === '__default__' ? undefined : accountId,
      balance: amount.toNumber(),
      balanceInBaseCurrency: convertToBase(
        amount,
        currency,
        valuationDates.at(-1)
      ).toNumber(),
      currency
    }))
  );

  return { cashBalances, cashByDate, cashFlows, contributionsByDate };
}
