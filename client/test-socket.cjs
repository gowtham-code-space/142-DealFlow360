const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Generate a valid fake token for a Sales Rep
const token = jwt.sign({
  userId: 'bf8feed3-e2e0-4403-a199-323236699a1a',
  roleId: 'SALES_REP'
}, 'dealflow_super_secret_jwt_key_2026', { expiresIn: '1h' });

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected! Socket ID:', socket.id);
  
  const quoteId = 'Q-2026-002';
  
  socket.emit('negotiation:join', { quoteId });
  
  socket.on('negotiation:error', (err) => {
    console.error('Socket Error:', err);
  });

  socket.on('negotiation:message:new', (msg) => {
    console.log('Received new message:', msg);
    process.exit(0);
  });

  setTimeout(() => {
    console.log('Sending message...');
    socket.emit('negotiation:message', {
      quoteId,
      message: 'Test message from multi-client script'
    });
  }, 1000);
});
