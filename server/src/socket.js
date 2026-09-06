const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/env');
const negotiationService = require('./features/negotiation/negotiation.service');
const quotationModel = require('./features/quotations/quotations.model');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    }
  });

  // ─── Authentication Middleware ───────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // JWT payload: { userId, roleId }
      if (!decoded.userId || !decoded.roleId) {
        return next(new Error('Authentication error: Invalid token payload'));
      }
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] authenticated userId=${socket.user.userId}`);
    console.log(`[Socket] roleId=${socket.user.roleId}`);

    // ─── Join negotiation room ──────────────────────────────────────────────
    socket.on('negotiation:join', async (payload) => {
      try {
        const quoteId = payload && payload.quoteId;

        if (!quoteId) {
          socket.emit('negotiation:error', { message: 'quoteId is required to join a room' });
          return;
        }

        console.log(`[Socket] join quoteId=${quoteId}`);

        // Validate the quote actually exists in DB using UUID or quoteNumber
        const quote = await quotationModel.findQuotationById(quoteId);
        if (!quote) {
          console.log(`[Socket] Quote not found: quoteId=${quoteId}`);
          socket.emit('negotiation:error', { message: `Quote not found: ${quoteId}` });
          return;
        }

        const resolvedQuoteId = quote.id;
        const roomId = `quote_${resolvedQuoteId}`;
        socket.join(roomId);
        console.log(`[Socket] User ${socket.user.userId} joined room=${roomId}`);
        socket.emit('negotiation:joined', { quoteId: resolvedQuoteId, roomId });
      } catch (err) {
        console.error('[Socket] Join error:', err);
        socket.emit('negotiation:error', { message: 'Failed to join negotiation room' });
      }
    });

    // ─── Send negotiation message ──────────────────────────────────────────
    socket.on('negotiation:message', async (data) => {
      try {
        const { quoteId, message, proposedDiscount } = data || {};

        // ── Validate payload ──
        if (!quoteId) {
          socket.emit('negotiation:error', { message: 'quoteId is required' });
          return;
        }
        if (!message || !message.trim()) {
          socket.emit('negotiation:error', { message: 'message cannot be empty' });
          return;
        }

        const senderId = socket.user.userId;
        const senderRole = socket.user.roleId;

        if (!senderId) {
          socket.emit('negotiation:error', { message: 'Authentication failed: no userId in token' });
          return;
        }

        console.log(`[Socket] authenticated userId=${senderId}`);
        console.log(`[Socket] roleId=${senderRole}`);
        console.log(`[Socket] incoming message=${message.trim()}`);

        // ── Validate quote exists in DB ──
        const quote = await quotationModel.findQuotationById(quoteId);
        if (!quote) {
          socket.emit('negotiation:error', { message: `Quote not found: ${quoteId}` });
          return;
        }

        const resolvedQuoteId = quote.id;

        // ── Persist to DB via existing service ──
        const persistedMessage = await negotiationService.createNegotiationMessage(
          resolvedQuoteId,
          {
            senderId,
            senderRole,
            message: message.trim(),
            proposedDiscount: (proposedDiscount !== undefined && proposedDiscount !== null) ? Number(proposedDiscount) : null
          }
        );

        console.log(`[Socket] persisted message id=${persistedMessage.id}`);

        // ── Broadcast to the room ──
        const roomId = `quote_${resolvedQuoteId}`;
        io.to(roomId).emit('negotiation:message:new', persistedMessage);
        console.log(`[Socket] broadcast quoteId=${resolvedQuoteId} room=${roomId}`);

      } catch (err) {
        console.error('[Socket] Message error:', err.message);
        socket.emit('negotiation:error', { message: err.message || 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.userId}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };
