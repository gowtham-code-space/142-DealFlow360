const svc = require('./negotiation.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');

async function listNegotiationTickets(req, res) {
  const { page, pageSize, status, quoteId } = req.query;
  const data = await svc.listNegotiationTickets({ page, pageSize, status, quoteId });
  return successResponse(res, 'Negotiation tickets retrieved', data);
}

async function listQuoteNegotiationTickets(req, res) {
  const data = await svc.listQuoteNegotiationTickets(req.params.quoteId);
  return successResponse(res, 'Quote negotiation tickets retrieved', data);
}

async function getNegotiationTicketById(req, res) {
  const data = await svc.getNegotiationTicketById(req.params.ticketId);
  if (!data) return notFoundResponse(res, 'Negotiation ticket not found');
  return successResponse(res, 'Negotiation ticket retrieved', data);
}

async function createNegotiationTicket(req, res) {
  const { quoteId, requestedDiscountPct, comments } = req.body;
  if (!quoteId || requestedDiscountPct === undefined) {
    return badRequestResponse(res, 'quoteId and requestedDiscountPct are required');
  }
  const data = await svc.createNegotiationTicket({
    quoteId,
    customerId: req.user?.customerId,
    requestedDiscountPct,
    comments
  });
  if (data?.notFound) return notFoundResponse(res, 'Quotation not found');
  return createdResponse(res, 'Negotiation ticket submitted and inventory held', data);
}

async function acceptNegotiationTicket(req, res) {
  const { purchaseDeadlineDays, comments } = req.body;
  const result = await svc.acceptNegotiationTicket(req.params.ticketId, { purchaseDeadlineDays, comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be accepted from current status ${result.currentStatus}`);
  return successResponse(res, 'Negotiation ticket accepted. Deadline set.', result);
}

async function rejectNegotiationTicket(req, res) {
  const { comments } = req.body;
  if (!comments) return badRequestResponse(res, 'Rejection comments are required');
  const result = await svc.rejectNegotiationTicket(req.params.ticketId, { comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be rejected from current status ${result.currentStatus}`);
  return successResponse(res, 'Negotiation ticket rejected and product holds released', result);
}

async function counterNegotiationTicket(req, res) {
  const { counterDiscountPct, comments } = req.body;
  if (counterDiscountPct === undefined || isNaN(Number(counterDiscountPct))) {
    return badRequestResponse(res, 'counterDiscountPct is required');
  }
  const result = await svc.counterNegotiationTicket(req.params.ticketId, { counterDiscountPct, comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be countered from status ${result.currentStatus}`);
  return successResponse(res, 'Counter-offer discount sent to customer', result);
}

async function escalateNegotiationTicket(req, res) {
  const { comments } = req.body;
  const result = await svc.escalateNegotiationTicket(req.params.ticketId, { comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be escalated from status ${result.currentStatus}`);
  return successResponse(res, 'Negotiation ticket escalated to manager', result);
}

const PDFDocument = require('pdfkit');
const negModel = require('./negotiation.model');

async function exportNegotiationSummaryPdf(req, res) {
  const quoteId = req.params.id;
  const context = await negModel.findQuotationContextForExport(quoteId);
  if (!context) return notFoundResponse(res, 'Quotation not found');

  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=DealFlow360-Negotiation-Summary-${context.quotationNumber}.pdf`);
  
  doc.pipe(res);
  
  // Header
  doc.fontSize(20).text('DEALFLOW360', { align: 'center' });
  doc.fontSize(14).text('Negotiation Summary', { align: 'center' });
  doc.moveDown();
  
  // Quotation Info
  doc.fontSize(12).font('Helvetica-Bold').text('Quotation:');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Quote Number: ${context.quotationNumber}`);
  doc.text(`Status: ${context.status}`);
  doc.text(`Created Date: ${context.createdAt.toISOString().slice(0, 10)}`);
  doc.moveDown();
  
  // Customer Info
  doc.fontSize(12).font('Helvetica-Bold').text('Customer:');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Name: ${context.customer?.name || 'N/A'}`);
  doc.text(`Company: ${context.customer?.companyName || 'N/A'}`);
  doc.text(`Email: ${context.customer?.email || 'N/A'}`);
  doc.moveDown();
  
  // Sales Rep Info
  doc.fontSize(12).font('Helvetica-Bold').text('Sales Representative:');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Name: ${context.rep?.name || 'N/A'}`);
  doc.text(`Email: ${context.rep?.email || 'N/A'}`);
  doc.moveDown();
  
  // Commercial Summary
  doc.fontSize(12).font('Helvetica-Bold').text('Commercial Summary:');
  doc.font('Helvetica').fontSize(10);
  context.items.forEach(item => {
    doc.text(`- ${item.product.name} (Qty: ${item.quantity}) - Price: $${Number(item.unitPrice).toFixed(2)} - Discount: ${Number(item.discountPercent || 0)}%`);
  });
  doc.moveDown();
  doc.font('Helvetica-Bold').text(`Subtotal: $${Number(context.subtotal).toFixed(2)}`);
  doc.text(`Total Discount: $${Number(context.discountTotal).toFixed(2)}`);
  doc.text(`Estimated Net Total: $${Number(context.estimatedNetTotal).toFixed(2)}`);
  doc.moveDown();
  
  // Negotiation Info
  doc.fontSize(12).font('Helvetica-Bold').text('Negotiation Status & Approvals:');
  doc.font('Helvetica').fontSize(10);
  const activeTicket = context.negotiationTickets?.[0];
  if (activeTicket) {
    doc.text(`Ticket Status: ${activeTicket.status}`);
    doc.text(`Requested Discount: ${Number(activeTicket.requestedDiscountPct)}%`);
    if (activeTicket.counterDiscountPct) {
      doc.text(`Counter Discount: ${Number(activeTicket.counterDiscountPct)}%`);
    }
  } else {
    doc.text(`No active negotiation tickets.`);
  }
  doc.moveDown();
  
  if (context.approvals && context.approvals.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Approvals:');
    doc.font('Helvetica').fontSize(10);
    context.approvals.forEach(app => {
      doc.text(`- ${app.stage} (${app.status}) by ${app.approver?.name || 'System'} on ${app.createdAt.toISOString().slice(0, 10)}`);
    });
    doc.moveDown();
  }
  
  // Chat History
  doc.fontSize(12).font('Helvetica-Bold').text('Negotiation History:');
  doc.font('Helvetica').fontSize(10);
  if (context.negotiations && context.negotiations.length > 0) {
    context.negotiations.forEach(msg => {
      doc.text(`[${msg.createdAt.toISOString().slice(0, 10)}] ${msg.senderRole} (${msg.sender?.name || 'Customer'}): ${msg.message}`);
    });
  } else {
    doc.text('No messages in history.');
  }
  
  doc.end();
}

async function getTicketHoldStatus(req, res) {
  const data = await svc.getTicketHoldStatus(req.params.ticketId);
  return successResponse(res, 'Product hold status retrieved', data);
}

async function listNegotiations(req, res) {
  const data = await svc.listNegotiations(req.params.id);
  return successResponse(res, 'Negotiation messages retrieved', data);
}

async function createNegotiationMessage(req, res) {
  const { message, proposedDiscount, senderRole } = req.body;
  if (!message) return badRequestResponse(res, 'Message text is required');
  const data = await svc.createNegotiationMessage(req.params.id, {
    senderId: req.user?.userId || req.user?.id,
    senderRole: senderRole === 'REP' ? 'SALES_REP' : (senderRole || (req.user?.roleId === 'CUSTOMER' ? 'CUSTOMER' : 'SALES_REP')),
    message,
    proposedDiscount
  });
  return createdResponse(res, 'Negotiation message sent', data);
}

module.exports = {
  listNegotiationTickets, listQuoteNegotiationTickets, getNegotiationTicketById,
  createNegotiationTicket, acceptNegotiationTicket, rejectNegotiationTicket, counterNegotiationTicket,
  escalateNegotiationTicket, exportNegotiationSummaryPdf,
  getTicketHoldStatus, listNegotiations, createNegotiationMessage
};
