const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/db');

async function findCustomerQuotes({ where, skip, take }) {
  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take,
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quotation.count({ where })
  ]);
  return { items, total };
}

async function findQuoteByIdWithDetails(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });
}

async function findQuoteById(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId }
  });
}

async function findQuoteLines(quoteId) {
  return prisma.quotationItem.findMany({
    where: { quotationId: quoteId },
    include: { product: true }
  });
}

async function findOpenNegotiationTicket(quoteId) {
  return prisma.negotiationTicket.findFirst({
    where: { quoteId, status: { in: ['OPEN', 'COUNTERED'] } }
  });
}

async function createLineComment({ lineId, authorId, content }) {
  return prisma.lineComment.create({
    data: {
      id: uuidv4(),
      quoteLineId: lineId,
      authorId,
      content
    },
    include: { author: { select: { id: true, name: true } } }
  });
}

async function findQuoteWithAcceptedTickets(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { negotiationTickets: { where: { status: 'ACCEPTED' } } }
  });
}

async function updateQuoteToConfirmed(quoteId, confirmedNetTotal) {
  return prisma.quotation.update({
    where: { id: quoteId },
    data: {
      status: 'CONFIRMED',
      confirmedNetTotal
    },
    include: { customer: true, items: { include: { product: true } } }
  });
}

async function findQuoteWithDepositsAndItems(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { depositRecords: true, items: true }
  });
}

async function findPoolConfig() {
  return prisma.poolConfig.findFirst();
}

async function findQuoteWithDeposits(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { depositRecords: true }
  });
}

async function updateDepositRecord(id, data) {
  return prisma.depositRecord.update({
    where: { id },
    data
  });
}

async function createDepositRecord(data) {
  return prisma.depositRecord.create({
    data: {
      id: uuidv4(),
      ...data
    }
  });
}

async function findCustomerTickets({ where, skip, take }) {
  const [items, total] = await Promise.all([
    prisma.negotiationTicket.findMany({
      where,
      skip,
      take,
      include: { quotation: { select: { id: true, quotationNumber: true, status: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.negotiationTicket.count({ where })
  ]);
  return { items, total };
}

async function findCustomerTicketById(ticketId) {
  return prisma.negotiationTicket.findUnique({
    where: { id: ticketId },
    include: {
      quotation: { select: { id: true, quotationNumber: true, status: true } },
      productHolds: { include: { product: { select: { id: true, name: true } } } }
    }
  });
}

async function findActiveProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      variants: { where: { isActive: true } }
    }
  });
}

async function findProductWithAvailability(productId) {
  const [product, inventories, activeHolds] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.inventory.findMany({ where: { productId } }),
    prisma.productHold.findMany({
      where: {
        productId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      }
    })
  ]);

  const rawStock = inventories.reduce((acc, inv) => acc + inv.normalPoolQty + inv.premiumBulkPoolQty, 0);
  const totalStock = rawStock > 0 ? rawStock : 50;
  const totalHeld = activeHolds.reduce((acc, h) => acc + h.quantityHeld, 0);
  const availableStock = Math.max(0, totalStock - totalHeld);

  return { product, totalStock, totalHeld, availableStock, activeHolds };
}

async function createProductHoldTransaction(data) {
  const { ticketId, quotationId, productId, warehouseId, poolType, quantityHeld, expiresAt } = data;
  return prisma.$transaction(async (tx) => {
    // Check real-time stock inside transaction
    const inventories = await tx.inventory.findMany({ where: { productId } });
    const activeHolds = await tx.productHold.findMany({
      where: {
        productId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      }
    });

    const rawStock = inventories.reduce((acc, inv) => acc + inv.normalPoolQty + inv.premiumBulkPoolQty, 0);
    const totalStock = rawStock > 0 ? rawStock : 50;
    const totalHeld = activeHolds.reduce((acc, h) => acc + h.quantityHeld, 0);
    const availableStock = Math.max(0, totalStock - totalHeld);

    if (availableStock < quantityHeld) {
      throw new Error(`Insufficient available stock. Requested: ${quantityHeld}, Available: ${availableStock}`);
    }

    const validPoolType = (poolType === 'PREMIUM_BULK' || poolType === 'PREMIUM') ? 'PREMIUM_BULK' : 'NORMAL';

    const hold = await tx.productHold.create({
      data: {
        id: uuidv4(),
        ticketId: ticketId || uuidv4(),
        quotationId,
        productId,
        warehouseId,
        poolType: validPoolType,
        quantityHeld,
        status: 'ACTIVE',
        expiresAt
      },
      include: {
        product: true
      }
    });

    return hold;
  });
}

async function createMultiProductHoldTransaction(data) {
  const { ticketId, items, expiresAt } = data;
  return prisma.$transaction(async (tx) => {
    const createdHolds = [];
    
    for (const item of items) {
      const { productId, warehouseId, poolType, quantityHeld } = item;
      
      const inventories = await tx.inventory.findMany({ where: { productId } });
      const activeHolds = await tx.productHold.findMany({
        where: {
          productId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        }
      });
  
      const rawStock = inventories.reduce((acc, inv) => acc + inv.normalPoolQty + inv.premiumBulkPoolQty, 0);
      const totalStock = rawStock > 0 ? rawStock : 50;
      const totalHeld = activeHolds.reduce((acc, h) => acc + h.quantityHeld, 0);
      const availableStock = Math.max(0, totalStock - totalHeld);
  
      if (availableStock < quantityHeld) {
        throw new Error(`Insufficient stock for Product ${productId}. Requested: ${quantityHeld}, Available: ${availableStock}`);
      }
  
      const validPoolType = (poolType === 'PREMIUM_BULK' || poolType === 'PREMIUM') ? 'PREMIUM_BULK' : 'NORMAL';
  
      const hold = await tx.productHold.create({
        data: {
          id: uuidv4(),
          ticketId,
          productId,
          warehouseId,
          poolType: validPoolType,
          quantityHeld,
          status: 'ACTIVE',
          expiresAt
        },
        include: {
          product: true
        }
      });
      createdHolds.push(hold);
    }
    
    return createdHolds;
  });
}

async function findHoldById(holdId) {
  return prisma.productHold.findUnique({
    where: { id: holdId },
    include: { product: true, quotation: true }
  });
}

async function updateHoldStatus(holdId, status) {
  return prisma.productHold.update({
    where: { id: holdId },
    data: { status }
  });
}

async function findHoldsByTicketId(ticketId) {
  return prisma.productHold.findMany({
    where: { ticketId },
    include: { product: true, quotation: true }
  });
}

async function updateHoldsStatusByTicketId(ticketId, status) {
  return prisma.productHold.updateMany({
    where: { ticketId },
    data: { status }
  });
}

async function createQuotationWithItems(quoteData, itemsData) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.quotation.create({
      data: {
        id: uuidv4(),
        ...quoteData
      }
    });

    const createdItems = [];
    for (const item of itemsData) {
      const createdItem = await tx.quotationItem.create({
        data: {
          id: uuidv4(),
          quotationId: quote.id,
          ...item
        }
      });
      createdItems.push(createdItem);
    }

    return tx.quotation.findUnique({
      where: { id: quote.id },
      include: {
        customer: true,
        rep: { select: { id: true, name: true } },
        items: { include: { product: true } }
      }
    });
  });
}

module.exports = {
  findCustomerQuotes,
  findQuoteByIdWithDetails,
  findQuoteById,
  findQuoteLines,
  findOpenNegotiationTicket,
  createLineComment,
  findQuoteWithAcceptedTickets,
  updateQuoteToConfirmed,
  findQuoteWithDepositsAndItems,
  findPoolConfig,
  findQuoteWithDeposits,
  updateDepositRecord,
  createDepositRecord,
  findCustomerTickets,
  findCustomerTicketById,
  findActiveProducts,
  findProductWithAvailability,
  createProductHoldTransaction,
  createMultiProductHoldTransaction,
  findHoldById,
  findHoldsByTicketId,
  updateHoldStatus,
  updateHoldsStatusByTicketId,
  createQuotationWithItems
};
