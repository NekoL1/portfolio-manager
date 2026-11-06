import { PortfolioChangedEvent } from '@ghostfolio/api/events/portfolio-changed.event';
import { LogPerformance } from '@ghostfolio/api/interceptors/performance-logging/performance-logging.interceptor';
import { ExchangeRateDataService } from '@ghostfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import { CreateAccountBalanceDto } from '@ghostfolio/common/dtos';
import { DATE_FORMAT, resetHours } from '@ghostfolio/common/helper';
import {
  AccountBalancesResponse,
  Filter,
  HistoricalDataItem
} from '@ghostfolio/common/interfaces';

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountBalance, Prisma } from '@prisma/client';
import { endOfDay, format, parseISO } from 'date-fns';

export interface AccountBalanceItem extends HistoricalDataItem {
  accountId?: string;
  balance?: number;
  currency?: string;
}

@Injectable()
export class AccountBalanceService {
  public constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeRateDataService: ExchangeRateDataService,
    private readonly prismaService: PrismaService
  ) {}

  public async accountBalance(
    accountBalanceWhereInput: Prisma.AccountBalanceWhereInput
  ): Promise<AccountBalance | null> {
    return this.prismaService.accountBalance.findFirst({
      include: {
        account: true
      },
      where: accountBalanceWhereInput
    });
  }

  public async createOrUpdateAccountBalance({
    accountId,
    balance,
    date,
    userId
  }: CreateAccountBalanceDto & {
    userId: string;
  }): Promise<AccountBalance> {
    const accountBalance = await this.prismaService.accountBalance.upsert({
      create: {
        account: {
          connect: {
            id_userId: {
              userId,
              id: accountId
            }
          }
        },
        date: resetHours(parseISO(date)),
        value: balance
      },
      update: {
        value: balance
      },
      where: {
        accountId_date: {
          accountId,
          date: resetHours(parseISO(date))
        }
      }
    });

    await this.eventEmitter.emitAsync(
      PortfolioChangedEvent.getName(),
      new PortfolioChangedEvent({
        userId
      })
    );

    return accountBalance;
  }

  public async deleteAccountBalance(
    where: Prisma.AccountBalanceWhereUniqueInput
  ): Promise<AccountBalance> {
    const accountBalance = await this.prismaService.accountBalance.delete({
      where
    });

    await this.eventEmitter.emitAsync(
      PortfolioChangedEvent.getName(),
      new PortfolioChangedEvent({
        userId: where.userId as string
      })
    );

    return accountBalance;
  }

  public async getAccountBalanceItems({
    filters,
    userCurrency,
    userId
  }: {
    filters?: Filter[];
    userCurrency: string;
    userId: string;
  }): Promise<AccountBalanceItem[]> {
    const { balances } = await this.getAccountBalances({
      filters,
      userCurrency,
      userId,
      withExcludedAccounts: false // TODO
    });
    // Keep native cash and account identity: aggregating checkpoints before
    // replay loses which account changed and prevents correct FX valuation.
    return balances.map(
      ({ currency, accountId, date, value, valueInBaseCurrency }) => ({
        accountId,
        balance: value,
        currency: currency ?? userCurrency,
        date: format(date, DATE_FORMAT),
        value: valueInBaseCurrency
      })
    );
  }

  @LogPerformance
  public async getAccountBalances({
    filters,
    userCurrency,
    userId,
    withExcludedAccounts
  }: {
    filters?: Filter[];
    userCurrency: string;
    userId: string;
    withExcludedAccounts?: boolean;
  }): Promise<AccountBalancesResponse> {
    const where: Prisma.AccountBalanceWhereInput = {
      userId,
      date: { lte: endOfDay(new Date()) }
    };

    const accountFilters = filters?.filter(({ type }) => {
      return type === 'ACCOUNT';
    });

    if (accountFilters?.length) {
      where.accountId = { in: accountFilters.map(({ id }) => id) };
    }

    if (withExcludedAccounts === false) {
      where.account = { isExcluded: false };
    }

    const balances = await this.prismaService.accountBalance.findMany({
      where,
      orderBy: {
        date: 'asc'
      },
      select: {
        account: true,
        date: true,
        id: true,
        value: true
      }
    });

    return {
      balances: balances.map((balance) => {
        return {
          ...balance,
          accountId: balance.account.id,
          currency: balance.account.currency,
          valueInBaseCurrency: this.exchangeRateDataService.toCurrency(
            balance.value,
            balance.account.currency,
            userCurrency
          )
        };
      })
    };
  }
}
