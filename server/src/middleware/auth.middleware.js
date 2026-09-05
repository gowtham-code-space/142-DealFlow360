const { verifyAccessToken } = require('../utils/jwt');
const { unauthorizedResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse(res, 'Authentication required. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      ...decoded,
      role: decoded.role || decoded.roleId
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired. Please refresh your session.');
    }
    return unauthorizedResponse(res, 'Invalid authentication token.');
  }
};

module.exports = authMiddleware;
