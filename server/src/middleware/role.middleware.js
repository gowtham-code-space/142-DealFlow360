const { unauthorizedResponse, forbiddenResponse } = require('../utils/response');

const roleMiddleware = (allowedRoles = []) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return unauthorizedResponse(res, 'Access denied. Unauthorized.');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return forbiddenResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
