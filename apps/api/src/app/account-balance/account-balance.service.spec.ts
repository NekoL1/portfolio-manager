import { AccountBalanceService } from './account-balance.service';

describe('AccountBalanceService cash ledger inputs', () => {
  it('preserves each account and native-currency checkpoint for replay', async () => {
    const service = new AccountBalanceService(null, null, null);
    jest.spyOn(service, 'getAccountBalances').mockResolvedValue({
      balances: [
        {
          accountId: 'a',
          currency: 'USD',
          date: new Date('2026-10-14T12:00:00Z'),
          value: 100,
          valueInBaseCurrency: 140
        },
        {
          accountId: 'b',
          currency: 'CAD',
          date: new Date('2026-10-14T12:00:00Z'),
          value: 200,
          valueInBaseCurrency: 200
        }
      ]
    } as any);
    expect(
      await service.getAccountBalanceItems({
        userId: 'user',
        userCurrency: 'CAD'
      })
    ).toEqual([
      {
        accountId: 'a',
        balance: 100,
        currency: 'USD',
        date: '2026-10-14',
        value: 140
      },
      {
        accountId: 'b',
        balance: 200,
        currency: 'CAD',
        date: '2026-10-14',
        value: 200
      }
    ]);
  });

  it('selects every requested account and excludes future checkpoints', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new AccountBalanceService(null, null, {
      accountBalance: { findMany }
    } as any);
    await service.getAccountBalances({
      userId: 'user',
      userCurrency: 'CAD',
      filters: [
        { type: 'ACCOUNT', id: 'a' },
        { type: 'ACCOUNT', id: 'b' }
      ]
    });
    expect(findMany.mock.calls[0][0].where).toMatchObject({
      accountId: { in: ['a', 'b'] },
      date: { lte: expect.any(Date) }
    });
  });
});
