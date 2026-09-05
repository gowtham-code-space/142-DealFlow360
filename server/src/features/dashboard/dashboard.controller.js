const svc = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

async function getSummary(req, res) {
  const { periodDays } = req.query;
  const data = await svc.getSummary({ periodDays });
  return successResponse(res, 'Dashboard summary retrieved', data);
}

async function getStalledDeals(req, res) {
  const { stallDays } = req.query;
  const data = await svc.getStalledDeals({ stallDays });
  return successResponse(res, 'Stalled deals retrieved', data);
}

async function getDiscountAnomalies(req, res) {
  const data = await svc.getDiscountAnomalies();
  return successResponse(res, 'Discount anomaly alerts retrieved', data);
}

async function getDeliverySlippage(req, res) {
  const data = await svc.getDeliverySlippage();
  return successResponse(res, 'Delivery promise slippage alerts retrieved', data);
}

async function getDealHealth(req, res) {
  const data = await svc.getDealHealth();
  return successResponse(res, 'Combined deal health alerts retrieved', data);
}

async function getPipeline(req, res) {
  const data = await svc.getPipeline();
  return successResponse(res, 'Kanban pipeline data retrieved', data);
}

async function getRegionDemand(req, res) {
  const { region, periodDays } = req.query;
  const data = await svc.getRegionDemand({ region, periodDays });
  return successResponse(res, 'Region demand metrics retrieved', data);
}

async function getPoolHealth(req, res) {
  const data = await svc.getPoolHealth();
  return successResponse(res, 'Pool health metrics retrieved', data);
}

module.exports = {
  getSummary, getStalledDeals, getDiscountAnomalies, getDeliverySlippage,
  getDealHealth, getPipeline, getRegionDemand, getPoolHealth
};
