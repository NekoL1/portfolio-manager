# Ghostfolio Development Guide

## Development Environment

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/en/download) (version `>=22.18.0`)
- Create a local copy of this Git repository (clone)
- Copy the file `.env.dev` to `.env` and populate it with your data (`cp .env.dev .env`)

### Setup

1. Run `npm install`
1. Run `docker compose -f docker/docker-compose.dev.yml up -d` to start [PostgreSQL](https://www.postgresql.org) and [Redis](https://redis.io)
1. Run `npm run database:setup` to initialize the database schema
1. Start the [server](#start-server) and the [client](#start-client)
1. Open https://localhost:4200/en in your browser
1. Create a new user via _Get Started_ (this first user will get the role `ADMIN`)

### Start Server

#### Debug

Run `npm run watch:server` and click _Debug API_ in [Visual Studio Code](https://code.visualstudio.com)

#### Serve

Run `npm run start:server`

### Start Client

#### English (Default)

Run `npm run start:client` and open https://localhost:4200/en in your browser.

#### Other Languages

To start the client in a different language, such as German (`de`), adapt the `start:client` script in the `package.json` file by changing `--configuration=development-en` to `--configuration=development-de`. Then, run `npm run start:client` and open https://localhost:4200/de in your browser.

### Start _Storybook_

Run `npm run start:storybook`

### Migrate Database

With the following command you can keep your database schema in sync:

```bash
npm run database:push
```

## Testing

Run `npm test`

## Sector Classification

Sector profiles resolve in this order: valid manual overrides, the curated
catalog in `apps/api/src/services/symbol-profile/sector-catalog.ts`, then stored
provider data. Berkshire Hathaway (`BRK-B`) and its Canadian Depositary Receipt
(`BRK.NE`) are classified entirely as **Financial Services**, using the company's
sector rather than a breakdown of its businesses or investment portfolio.

Portfolio allocations (both the sector chart and ranked table) and holding
details consume these resolved profiles. The portfolio details API reads them
on each request, so catalog changes take effect after rebuilding/restarting the
API and reloading the page; no database migration or snapshot cache purge is
required. Provider refreshes retain the catalog classification, while explicit
manual sector overrides continue to take priority.

## Experimental Features

New functionality can be enabled using a feature flag switch from the user settings.

### Backend

Remove permission in `UserService` using `without()`

### Frontend

Use `@if (user?.settings?.isExperimentalFeatures) {}` in HTML template

## Component Library (_Storybook_)

https://ghostfol.io/development/storybook

## Git

### Rebase

`git rebase -i --autosquash main`

## Dependencies

### Angular

#### Upgrade (minor versions)

1. Run `npx npm-check-updates --upgrade --target "minor" --filter "/@angular.*/"`

### Nx

#### Upgrade

1. Run `npx nx migrate latest`
1. Make sure `package.json` changes make sense and then run `npm install`
1. Run `npx nx migrate --run-migrations`

### Prisma

#### Access database via GUI

Run `npm run database:gui`

https://www.prisma.io/studio

#### Synchronize schema with database for prototyping

Run `npm run database:push`

https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push

#### Create schema migration

Run `npm run prisma migrate dev --name added_job_title`

https://www.prisma.io/docs/concepts/components/prisma-migrate#getting-started-with-prisma-migrate

## SSL

Generate `localhost.cert` and `localhost.pem` files.

```
openssl req -x509 -newkey rsa:2048 -nodes -keyout apps/client/localhost.pem -out apps/client/localhost.cert -days 365 \
  -subj "/C=CH/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
```

## Portfolio cash and performance accounting

Portfolio value is the value of securities plus cash reconstructed from the
activity history. Purchases consume cash; sales, dividends and interest retain
cash. Fees reduce value once. Total gain is closing value minus opening value
minus net external funding. Realized gains therefore remain in the portfolio
when a position is sold, including after complete liquidation.

The cash ledger keeps native-currency balances per account, values foreign cash
at the valuation-date FX rate, and values funding at the flow-date rate. It
spends available cash in the trade's currency first. Because the existing data
model has no explicit deposit, withdrawal or currency-exchange activities,
remaining cash in other currencies in the same account is converted at the
historical rate before an unfunded purchase is inferred to require a deposit.
Cash in a different account is never silently spent.

An account balance entry is an authoritative **end-of-day cash checkpoint** for
that account, in its account currency. The difference from the reconstructed
cash is recorded as a deposit or withdrawal; subsequent trades continue from
that checkpoint. Do not enter total securities value as an account cash balance.
Missing historical transfers or incorrect checkpoints can change reconstructed
contributions, so exact broker reconciliation requires complete, accurate data.
Historical FX gaps remain subject to the exchange-rate provider's conventions.

Trade creation, editing, deletion and importing replay the same ledger. The
legacy `updateAccountBalance` creation flag is accepted for compatibility but
no longer writes an additional checkpoint. Portfolio cache invalidation runs
immediately after activity changes. Snapshot cache version v4 prevents old
cash-excluding snapshots from being reused after the upgrade.

TWR uses daily closing valuations and an end-of-period flow convention; the
first funded day uses its funding as the denominator so fees are retained.
Daily valuations cannot resolve exact intraday return timing. MWR is cumulative
for the selected period; its existing Modified Dietz fallback applies if no IRR
root can be bracketed. The overview's market value and cash use the same dated
snapshot, including when a historical range is selected.

### Cash from trading and ongoing contributions

Without a manually verified cash balance, cash starts at zero. Each sale adds
its proceeds (less fees) to the account's available cash. Subsequent purchases
spend that cash first; only the shortfall is counted as additional external
funding. Earlier purchases never consume later sale proceeds, and a small
unspent remainder is retained instead of being rounded or forced to zero.
Dividends and interest add cash; they are income, not external funding.

Do not save a sale's proceeds as the account's total cash balance. The activity
ledger already retains that money. A manual balance is only for an independently
verified end-of-day cash total; changing it can imply a deposit or withdrawal.
The existing automatic activity-to-balance option remains disabled.

Portfolio performance values include securities plus cash. Across ROAI, TWR,
and MWR, the dollar gain including currency effects is closing value minus opening
value minus net external funding in the selected period. ROAI preserves its
separate currency attribution. Percentage-return methods keep their respective
denominators. Generated cash holdings carry a matching base-currency value and
basis so cash principal is not displayed as unrealized profit.
