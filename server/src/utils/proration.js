const calculateProration = ({
  currentPlanPrice,
  newPlanPrice = null,
  billingPeriod = 'MONTHLY',
  cycleStartDate,
  cycleEndDate,
  effectiveDate = new Date(),
  prorationType = 'DAILY'
}) => {
  if (prorationType === 'NONE') {
    return {
      unusedDays: 0,
      totalDaysInCycle: 0,
      creditAmount: 0,
      chargeAmount: newPlanPrice !== null ? Number(newPlanPrice) : 0,
      netPayable: newPlanPrice !== null ? Number(newPlanPrice) : 0
    };
  }

  const start = new Date(cycleStartDate);
  const end = new Date(cycleEndDate);
  const effective = new Date(effectiveDate);

  const totalCycleMs = end.getTime() - start.getTime();
  const totalDaysInCycle = Math.max(1, Math.round(totalCycleMs / (1000 * 60 * 60 * 24)));

  const remainingMs = end.getTime() - effective.getTime();
  const unusedDays = Math.max(0, Math.min(totalDaysInCycle, Math.round(remainingMs / (1000 * 60 * 60 * 24))));

  const dailyRateOld = Number(currentPlanPrice) / totalDaysInCycle;
  const creditAmount = Number((dailyRateOld * unusedDays).toFixed(2));

  let chargeAmount = 0;
  if (newPlanPrice !== null) {
    const dailyRateNew = Number(newPlanPrice) / totalDaysInCycle;
    chargeAmount = Number((dailyRateNew * unusedDays).toFixed(2));
  }

  const netPayable = Number((chargeAmount - creditAmount).toFixed(2));

  return {
    unusedDays,
    totalDaysInCycle,
    creditAmount,
    chargeAmount,
    netPayable
  };
};

module.exports = {
  calculateProration
};
