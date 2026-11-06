// Read-only snapshot. Authentication stays inside the application container.
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const userId = '38398421-7bc1-45fc-aff2-395970dd96e3';
(async () => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: '5m'
  });
  const api = {};
  for (const path of [
    'v1/portfolio/details?range=max',
    'v1/portfolio/holdings?range=max',
    'v1/account',
    ...['TWR', 'MWR', 'ROAI'].map(
      (type) => `v2/portfolio/performance?range=max&calculationType=${type}`
    )
  ]) {
    const response = await fetch(`http://127.0.0.1:3333/api/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    api[path] = { status: response.status, data: await response.json() };
  }
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { SymbolProfile: true },
    orderBy: [{ date: 'asc' }, { id: 'asc' }]
  });
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: { balances: true }
  });
  process.stdout.write(
    JSON.stringify(
      { asOf: new Date().toISOString(), orders, accounts, api },
      null,
      2
    )
  );
})()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
