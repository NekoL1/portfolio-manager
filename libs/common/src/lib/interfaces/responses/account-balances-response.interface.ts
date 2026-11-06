import { AccountBalance } from '@prisma/client';

export interface AccountBalancesResponse {
  balances: (Pick<AccountBalance, 'accountId' | 'date' | 'id' | 'value'> & {
    currency?: string;
    valueInBaseCurrency: number;
  })[];
}
