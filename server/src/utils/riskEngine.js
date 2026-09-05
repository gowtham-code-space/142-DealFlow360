const calculateQuoteRisk = ({
  customer,
  lineItems = [],
  approvalRules = null
}) => {
  const customerBaseRisk = Number(customer?.risk_score || customer?.riskScore || 20);
  const creditLimit = customer?.credit_limit !== undefined && customer?.credit_limit !== null
    ? Number(customer.credit_limit)
    : customer?.creditLimit !== undefined && customer?.creditLimit !== null
      ? Number(customer.creditLimit)
      : null;

  let totalNet = 0;
  let totalCogs = 0;
  let maxOverLimitPct = 0;
  let hasOverLimitLines = false;
  let reasons = [];

  for (const item of lineItems) {
    totalNet += Number(item.netTotal || item.net_total || 0);
    totalCogs += Number(item.lineCogs || item.cogs || 0);

    const overLimitPct = Number(item.governance?.overLimitPct || item.over_limit_pct || 0);
    if (overLimitPct > 0) {
      hasOverLimitLines = true;
      if (overLimitPct > maxOverLimitPct) {
        maxOverLimitPct = overLimitPct;
      }
    }
  }

  const grossProfit = totalNet - totalCogs;
  const overallMarginPct = totalNet > 0 ? Number(((grossProfit / totalNet) * 100).toFixed(2)) : 0;

  // Blended Risk Score calculation
  // Base risk (30%) + Max Discount Over-Ceiling (40%) + Low Margin Risk (30%)
  const marginPenalty = overallMarginPct < 15 ? (15 - overallMarginPct) * 2 : 0;
  const blendedRiskScore = Math.min(
    100,
    Number((customerBaseRisk * 0.3 + maxOverLimitPct * 2.5 + marginPenalty).toFixed(2))
  );

  // Credit Limit check
  let creditLimitExceeded = false;
  if (creditLimit !== null && totalNet > creditLimit) {
    creditLimitExceeded = true;
    reasons.push(`Quote total ($${totalNet}) exceeds customer credit limit ($${creditLimit}).`);
  }

  // Governance Routing
  const repMaxOverPct = approvalRules?.sales_rep_only_max_over_ceiling_pct || 5.0;
  const financeOverPct = approvalRules?.finance_threshold_over_ceiling_pct || 15.0;

  let requiresApproval = false;
  let approvalLevel = null;

  if (hasOverLimitLines || overallMarginPct < 15 || creditLimitExceeded) {
    requiresApproval = true;

    if (maxOverLimitPct > financeOverPct || creditLimitExceeded || overallMarginPct < 5) {
      approvalLevel = 3; // Finance Ops
      reasons.push(`Exceeds Finance threshold (> ${financeOverPct}% discount or credit limit breach).`);
    } else if (maxOverLimitPct > repMaxOverPct || overallMarginPct < 15) {
      approvalLevel = 2; // Sales Manager
      reasons.push(`Exceeds Sales Rep discount ceiling (> ${repMaxOverPct}% over limit or low margin).`);
    } else {
      approvalLevel = 1; // Sales Rep
      reasons.push('Discount requires standard Sales Rep verification.');
    }
  }

  return {
    blendedRiskScore,
    overallMarginPct,
    requiresApproval,
    approvalLevel,
    reasons,
    approvalReason: reasons.join(' ')
  };
};

module.exports = {
  calculateQuoteRisk
};
