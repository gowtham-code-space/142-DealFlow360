const svc = require('./reports.service');
const { successResponse, badRequestResponse } = require('../../utils/response');

async function getQuotationReport(req, res) {
  const { dateFrom, dateTo, salesRepId, status, productId, customerTier, productType, page, pageSize } = req.query;
  const data = await svc.getQuotationReport({ dateFrom, dateTo, salesRepId, status, productId, customerTier, productType, page, pageSize });
  return successResponse(res, 'Quotation report data retrieved', data);
}

async function exportQuotationReport(req, res) {
  const { format, dateFrom, dateTo } = req.query;
  if (!format || !['pdf', 'xls', 'csv'].includes(format.toLowerCase())) {
    return badRequestResponse(res, 'format must be one of pdf, xls, csv');
  }

  const report = await svc.getQuotationReport({ dateFrom, dateTo, pageSize: 1000 });
  const csvHeaders = 'QuotationNumber,Customer,Rep,Status,Subtotal,DiscountTotal,EstimatedNetTotal,ConfirmedNetTotal,CreatedAt\n';
  const csvRows = report.items.map(q =>
    `"${q.quotationNumber}","${q.customer?.name || ''}","${q.rep?.name || ''}","${q.status}",${q.subtotal},${q.discountTotal},${q.estimatedNetTotal},${q.confirmedNetTotal || ''},"${q.createdAt.toISOString()}"`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=quotation_report_${new Date().toISOString().slice(0,10)}.${format === 'xls' ? 'csv' : format}`);
  return res.send(csvHeaders + csvRows);
}

async function getSalesPerformanceReport(req, res) {
  const { dateFrom, dateTo, salesRepId } = req.query;
  const data = await svc.getSalesPerformanceReport({ dateFrom, dateTo, salesRepId });
  return successResponse(res, 'Sales performance report retrieved', data);
}

async function getProductAnalysisReport(req, res) {
  const { productType, dateFrom, dateTo } = req.query;
  const data = await svc.getProductAnalysisReport({ productType, dateFrom, dateTo });
  return successResponse(res, 'Product analysis report retrieved', data);
}

async function getDiscountSummaryReport(req, res) {
  const { groupBy, dateFrom, dateTo } = req.query;
  const data = await svc.getDiscountSummaryReport({ groupBy, dateFrom, dateTo });
  return successResponse(res, 'Discount summary report retrieved', data);
}

async function getPoolUtilizationReport(req, res) {
  const { dateFrom, dateTo } = req.query;
  const data = await svc.getPoolUtilizationReport({ dateFrom, dateTo });
  return successResponse(res, 'Pool utilization report retrieved', data);
}

async function getNegotiationOutcomesReport(req, res) {
  const { dateFrom, dateTo } = req.query;
  const data = await svc.getNegotiationOutcomesReport({ dateFrom, dateTo });
  return successResponse(res, 'Negotiation outcomes report retrieved', data);
}

module.exports = {
  getQuotationReport, exportQuotationReport, getSalesPerformanceReport,
  getProductAnalysisReport, getDiscountSummaryReport, getPoolUtilizationReport, getNegotiationOutcomesReport
};
