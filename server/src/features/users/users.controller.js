const svc = require('./users.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');

async function listUsers(req, res) {
  const { page, pageSize, role, isActive } = req.query;
  const data = await svc.listUsers({ page, pageSize, role, isActive });
  return successResponse(res, 'Users fetched', data);
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return badRequestResponse(res, 'name, email, password and role are required');

  const result = await svc.createUser({ name, email, password, role });
  if (result.conflict) return conflictResponse(res, 'Email already exists');
  return createdResponse(res, 'User created', result.user);
}

async function bulkCreateUsers(req, res) {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0) return badRequestResponse(res, 'users array is required');

  const result = await svc.bulkCreateUsers(users);
  return res.status(207).json({
    success: true,
    message: `${result.created.length} created, ${result.failed.length} failed`,
    data: result
  });
}

async function getUserById(req, res) {
  const user = await svc.getUserById(req.params.userId);
  if (!user) return notFoundResponse(res, 'User not found');
  return successResponse(res, 'User fetched', user);
}

async function updateUser(req, res) {
  const { name, role, isActive } = req.body;
  try {
    const user = await svc.updateUser(req.params.userId, { name, role, isActive });
    return successResponse(res, 'User updated', user);
  } catch {
    return notFoundResponse(res, 'User not found');
  }
}

async function softDeleteUser(req, res) {
  const result = await svc.softDeleteUser(req.params.userId, req.user.userId);
  if (result.notFound) return notFoundResponse(res, 'User not found');
  if (result.self) return conflictResponse(res, 'Cannot deactivate your own account');
  if (result.lastAdmin) return conflictResponse(res, 'Cannot deactivate the last active admin');
  return successResponse(res, 'User deactivated');
}

async function reactivateUser(req, res) {
  const user = await svc.reactivateUser(req.params.userId);
  if (!user) return notFoundResponse(res, 'User not found');
  return successResponse(res, 'User reactivated', user);
}

module.exports = { listUsers, createUser, bulkCreateUsers, getUserById, updateUser, softDeleteUser, reactivateUser };
