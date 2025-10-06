const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Access token required' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (e) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (e) {
    next(new Error('Authentication error'));
  }
};

// Optional: fine-grained RBAC within workspace
const ROLE_ORDER = { owner: 4, editor: 3, commenter: 2, reader: 1 };
const requireWorkspaceRole = (minRole) => async (req, res, next) => {
  try {
    const wsId = req.params.workspaceId || req.params.id || req.body.workspaceId;
    if (!wsId) return res.status(400).json({ message: 'Workspace id required' });
    const ws = await Workspace.findById(wsId).lean();
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });

    if (String(ws.owner) === String(req.user._id)) return next();
    const member = ws.members?.find((m) => String(m.user) === String(req.user._id));
    if (!member || ROLE_ORDER[member.role] < ROLE_ORDER[minRole]) {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = { authenticateToken, authenticateSocket, requireWorkspaceRole };