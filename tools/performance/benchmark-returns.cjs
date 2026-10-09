// A deterministic CPU benchmark, with no database, network or portfolio data.
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const filename = path.resolve(
  'apps/api/src/app/portfolio/calculator/performance-calculation.helper.ts'
);
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const helper = new Module(filename, module);
helper.filename = filename;
helper.paths = module.paths;
helper._compile(compiled, filename);

const { calculateMoneyWeightedReturn } = helper.exports;
const startDate = new Date('2020-01-01T00:00:00Z');
const cashFlows = Array.from({ length: 250 }, (_, index) => ({
  amount: 100 + index,
  date: new Date(startDate.getTime() + index * 86400000).toISOString()
}));
const run = () => {
  let checksum = 0;
  for (let day = 1; day <= 250; day++) {
    checksum += calculateMoneyWeightedReturn({
      cashFlows: cashFlows.slice(0, day),
      endDate: new Date(startDate.getTime() + day * 86400000),
      endValue: 10000 + day * 300,
      startDate,
      startValue: 10000
    });
  }
  return checksum;
};
const started = performance.now();
const checksum = run();
const duration = performance.now() - started;
console.log(
  JSON.stringify(
    {
      benchmark: '250-point money-weighted return chart',
      durationMs: Math.round(duration),
      budgetMs: 1000,
      checksum
    },
    null,
    2
  )
);
if (duration > 1000 || !Number.isFinite(checksum)) process.exitCode = 1;
