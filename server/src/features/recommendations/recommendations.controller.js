const svc = require('./recommendations.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse
} = require('../../utils/response');

async function getRecommendations(req, res) {
  const data = await svc.getRecommendations(req.params.quoteId);
  if (data?.notFound) return notFoundResponse(res, 'Quotation not found');
  return successResponse(res, 'Recommendations retrieved', data);
}

async function addRecommendedProduct(req, res) {
  const result = await svc.addRecommendedProduct(req.params.quoteId, req.params.productId);
  if (result?.notFound) return notFoundResponse(res, 'Quotation or product not found');
  if (result?.notEditable) return conflictResponse(res, 'Quote is not in an editable status (DRAFT or RETURNED)');
  return createdResponse(res, 'Recommended product added to quote', result);
}

async function dismissRecommendation(req, res) {
  const result = await svc.dismissRecommendation(req.params.quoteId, req.params.productId);
  return successResponse(res, 'Recommendation dismissed', result);
}

module.exports = {
  getRecommendations, addRecommendedProduct, dismissRecommendation
};
