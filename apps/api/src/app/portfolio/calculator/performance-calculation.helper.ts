import { differenceInMilliseconds, parseISO } from 'date-fns';

export interface DateValuePoint {
  date: string;
  value: number;
}

export interface DatedCashFlow {
  amount: number;
  date: string;
}

const MIN_RETURN = -0.999999999;
const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-10;

function getRemainingPeriodFraction({
  date,
  endDate,
  totalDurationInMilliseconds
}: {
  date: string;
  endDate: Date;
  totalDurationInMilliseconds: number;
}) {
  if (totalDurationInMilliseconds <= 0) {
    return 0;
  }

  const remainingDurationInMilliseconds = differenceInMilliseconds(
    endDate,
    parseISO(date)
  );

  return Math.max(
    0,
    Math.min(1, remainingDurationInMilliseconds / totalDurationInMilliseconds)
  );
}

export function calculateModifiedDietzReturn({
  cashFlows,
  endDate,
  endValue,
  startDate,
  startValue
}: {
  cashFlows: DatedCashFlow[];
  endDate: Date;
  endValue: number;
  startDate: Date;
  startValue: number;
}) {
  const totalDurationInMilliseconds = Math.max(
    differenceInMilliseconds(endDate, startDate),
    1
  );

  const weightedCashFlows = cashFlows.reduce((total, cashFlow) => {
    return (
      total +
      cashFlow.amount *
        getRemainingPeriodFraction({
          date: cashFlow.date,
          endDate,
          totalDurationInMilliseconds
        })
    );
  }, 0);

  const denominator = startValue + weightedCashFlows;

  if (Math.abs(denominator) < TOLERANCE) {
    return 0;
  }

  return (
    getNetPerformance({
      cashFlows,
      endValue,
      startValue
    }) / denominator
  );
}

export function calculateMoneyWeightedReturn({
  cashFlows,
  endDate,
  endValue,
  startDate,
  startValue
}: {
  cashFlows: DatedCashFlow[];
  endDate: Date;
  endValue: number;
  startDate: Date;
  startValue: number;
}) {
  const totalDurationInMilliseconds = Math.max(
    differenceInMilliseconds(endDate, startDate),
    1
  );

  const evaluate = (rate: number) => {
    const growthFactor = 1 + rate;

    if (growthFactor <= 0) {
      return Number.POSITIVE_INFINITY;
    }

    let futureValue = startValue * growthFactor;

    for (const cashFlow of cashFlows) {
      futureValue +=
        cashFlow.amount *
        growthFactor **
          getRemainingPeriodFraction({
            date: cashFlow.date,
            endDate,
            totalDurationInMilliseconds
          });
    }

    return futureValue - endValue;
  };

  const baseline = evaluate(0);

  if (Math.abs(baseline) < TOLERANCE) {
    return 0;
  }

  let lowerBound = MIN_RETURN;
  let upperBound = 1;
  let lowerValue = evaluate(lowerBound);
  let upperValue = evaluate(upperBound);

  while (lowerValue * upperValue > 0 && upperBound < 1024) {
    upperBound *= 2;
    upperValue = evaluate(upperBound);
  }

  if (lowerValue * upperValue > 0) {
    return calculateModifiedDietzReturn({
      cashFlows,
      endDate,
      endValue,
      startDate,
      startValue
    });
  }

  for (let index = 0; index < MAX_ITERATIONS; index++) {
    const midpoint = (lowerBound + upperBound) / 2;
    const midpointValue = evaluate(midpoint);

    if (Math.abs(midpointValue) < TOLERANCE) {
      return midpoint;
    }

    if (lowerValue * midpointValue <= 0) {
      upperBound = midpoint;
      upperValue = midpointValue;
    } else {
      lowerBound = midpoint;
      lowerValue = midpointValue;
    }
  }

  return (lowerBound + upperBound) / 2;
}

export function calculateTimeWeightedReturn({
  cashFlowsByDate,
  points
}: {
  cashFlowsByDate: Record<string, number>;
  points: DateValuePoint[];
}) {
  if (points.length <= 1) {
    return 0;
  }

  let cumulativeReturn = 1;
  let previousValue = points[0].value;

  for (let index = 1; index < points.length; index++) {
    const { date, value } = points[index];
    const cashFlow = cashFlowsByDate[date] ?? 0;

    if (Math.abs(previousValue) < Number.EPSILON) {
      previousValue = value;
      continue;
    }

    cumulativeReturn *= 1 + (value - previousValue - cashFlow) / previousValue;
    previousValue = value;
  }

  return cumulativeReturn - 1;
}

export function getNetPerformance({
  cashFlows,
  endValue,
  startValue
}: {
  cashFlows: DatedCashFlow[];
  endValue: number;
  startValue: number;
}) {
  const netCashFlows = cashFlows.reduce((total, { amount }) => {
    return total + amount;
  }, 0);

  return endValue - startValue - netCashFlows;
}
