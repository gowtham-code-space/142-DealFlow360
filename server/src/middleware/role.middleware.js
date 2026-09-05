const { unauthorizedResponse, forbiddenResponse } = require('../utils/response');

const roleMiddleware = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    console.log("ROLE MIDDLEWARE REQ USER:", req.user);
    const userRole = req.user.role || req.user.roleId || req.user.role_id;
    if (!req.user || (userRole === undefined || userRole === null)) {
      return unauthorizedResponse(res, 'Access denied. Unauthorized.');
    }

    if (roles.length > 0 && !roles.includes(userRole)) {
      return forbiddenResponse(
        res,
        `Access denied. Role '${userRole}' is not authorized for this resource.`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
