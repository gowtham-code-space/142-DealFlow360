const { PoolType } = require('../constants');

// Haversine formula to compute great-circle distance in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

const allocateHardwareInventory = ({
  requestedQuantity,
  poolType = PoolType.NORMAL,
  customerLocation = { lat: 0, lng: 0 },
  warehousesWithStock = [],
  baseShippingRatePerKm = 0.5
}) => {
  let remainingQty = requestedQuantity;
  const allocations = [];
  let backorderQty = 0;

  // Sort warehouses by distance from customer
  const sortedWarehouses = warehousesWithStock
    .map((wh) => {
      const distanceKm = calculateDistanceKm(
        customerLocation.lat,
        customerLocation.lng,
        wh.location_lat || wh.locationLat,
        wh.location_lng || wh.locationLng
      );
      const availableInPool =
        poolType === PoolType.PREMIUM_BULK
          ? Number(wh.inventory?.available_premium_bulk ?? wh.availablePremiumBulk ?? 0)
          : Number(wh.inventory?.available_normal ?? wh.availableNormal ?? 0);

      return {
        ...wh,
        distanceKm,
        availableInPool
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Allocate from closest warehouses first
  for (const wh of sortedWarehouses) {
    if (remainingQty <= 0) break;
    if (wh.availableInPool <= 0) continue;

    const allocQty = Math.min(remainingQty, wh.availableInPool);
    const shippingFactor = Number(wh.shipping_cost_factor || wh.shippingCostFactor || 1.0);
    const shippingCost = Number((wh.distanceKm * baseShippingRatePerKm * shippingFactor).toFixed(2));

    allocations.push({
      warehouseId: wh.id,
      warehouseCode: wh.code,
      warehouseName: wh.name,
      quantity: allocQty,
      poolType,
      distanceKm: wh.distanceKm,
      shippingCost
    });

    remainingQty -= allocQty;
  }

  if (remainingQty > 0) {
    backorderQty = remainingQty;
  }

  const totalShippingCost = allocations.reduce((sum, a) => sum + a.shippingCost, 0);

  return {
    isFullyAllocated: backorderQty === 0,
    requestedQuantity,
    allocatedQuantity: requestedQuantity - backorderQty,
    backorderQty,
    allocations,
    totalShippingCost: Number(totalShippingCost.toFixed(2))
  };
};

module.exports = {
  calculateDistanceKm,
  allocateHardwareInventory
};
