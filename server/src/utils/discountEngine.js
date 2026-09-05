const { DiscountTypeEnum, CustomerTier } = require('../constants');

const calculateLineDiscounts = ({
  product,
  variant = null,
  quantity = 1,
  customer = null,
  discountPolicy = null,
  discountRules = []
}) => {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const baseListPrice = Number(product.listPrice || product.list_price || 0);
  const costPrice = Number(product.cost || product.costPrice || product.unitCostPrice || 0);

  // Variant adjustments
  const variantExtraPrice = variant ? Number(variant.extraPrice || variant.extra_price || 0) : 0;
  const unitListPrice = Math.max(0, baseListPrice + variantExtraPrice);

  // Tier 1: Product base discount %
  const productDiscountPct = Number(product.productDiscountPct || product.product_discount_pct || 0);

  // Tier 2: Bulk volume tier discount %
  let bulkDiscountPct = 0;
  const bulkRules = discountRules.filter((r) => r.type === DiscountTypeEnum.BULK && r.is_active !== false);
  for (const rule of bulkRules) {
    if (qty >= rule.bulk_threshold_qty && rule.bulk_discount_pct > bulkDiscountPct) {
      bulkDiscountPct = Number(rule.bulk_discount_pct);
    }
  }

  // Tier 3: Consistency / loyalty order count discount %
  let consistencyDiscountPct = 0;
  const orderCount = customer ? Number(customer.orderCount || customer.order_count || 0) : 0;
  const consistencyRules = discountRules.filter((r) => r.type === DiscountTypeEnum.CONSISTENCY && r.is_active !== false);
  for (const rule of consistencyRules) {
    if (orderCount >= rule.consistency_order_count && rule.consistency_discount_pct > consistencyDiscountPct) {
      consistencyDiscountPct = Number(rule.consistency_discount_pct);
    }
  }

  // Tier 4: Customer tier / premium discount %
  let premiumDiscountPct = 0;
  const customerTier = (customer?.tier || CustomerTier.STANDARD).toUpperCase();
  const premiumRules = discountRules.filter((r) => r.type === DiscountTypeEnum.PREMIUM && r.is_active !== false);
  if (premiumRules.length > 0) {
    premiumDiscountPct = Number(premiumRules[0].premium_discount_pct || 0);
  } else {
    // Default tier fallbacks
    const tierDiscountMap = {
      [CustomerTier.FREE]: 0,
      [CustomerTier.STANDARD]: 2,
      [CustomerTier.PREMIUM]: 5,
      [CustomerTier.GOLD]: 8,
      [CustomerTier.PLATINUM]: 12
    };
    premiumDiscountPct = tierDiscountMap[customerTier] || 0;
  }

  // Tier 5: Variant adjustment discount %
  const variantDiscountPct = variant ? Number(variant.variantDiscountPct || variant.variant_discount_pct || 0) : 0;

  // Stacking Cumulative Discount %
  const cumulativeDiscountPct = Number(
    (productDiscountPct + bulkDiscountPct + consistencyDiscountPct + premiumDiscountPct + variantDiscountPct).toFixed(2)
  );

  // Governance Ceiling Check
  const ceilingPct = discountPolicy ? Number(discountPolicy.max_discount_pct || discountPolicy.maxDiscountPct || 25) : 25;
  const isOverLimit = cumulativeDiscountPct > ceilingPct;
  const overLimitPct = isOverLimit ? Number((cumulativeDiscountPct - ceilingPct).toFixed(2)) : 0;

  // Financial Calculations
  const lineTotal = Number((unitListPrice * qty).toFixed(2));
  const effectiveDiscountRate = Math.min(100, Math.max(0, cumulativeDiscountPct)) / 100;
  const discountAmount = Number((lineTotal * effectiveDiscountRate).toFixed(2));
  const netTotal = Number((lineTotal - discountAmount).toFixed(2));
  const lineCogs = Number((costPrice * qty).toFixed(2));
  const grossProfit = Number((netTotal - lineCogs).toFixed(2));
  const marginPct = netTotal > 0 ? Number(((grossProfit / netTotal) * 100).toFixed(2)) : 0;

  return {
    quantity: qty,
    unitListPrice,
    costPrice,
    lineTotal,
    discountAmount,
    netTotal,
    lineCogs,
    marginPct,
    discounts: {
      productDiscountPct,
      bulkDiscountPct,
      consistencyDiscountPct,
      premiumDiscountPct,
      variantDiscountPct,
      cumulativeDiscountPct
    },
    governance: {
      ceilingPct,
      isOverLimit,
      overLimitPct
    }
  };
};

module.exports = {
  calculateLineDiscounts
};
