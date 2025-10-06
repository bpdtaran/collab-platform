// backend/routes/workspaces.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const User = require('../models/User'); // Ensure User model is imported for invites
const { authenticateToken } = require('../middleware/auth');
// For more granular security later, you can use requireWorkspaceRole
// const { requireWorkspaceRole } = require('../middleware/auth');

const router = express.Router();

// Helper to normalize workspace shape for the frontend dashboard list
const normalizeForList = (ws) => ({
  id: String(ws._id),
  name: ws.name,
  description: ws.description || '',
  // The owner is in the members array, so members.length is the total count
  members: ws.members ? ws.members.length : 1,
  documents: ws.documentsCount || 0,
  owner: String(ws.owner),
});

// GET all workspaces for the current user (owner or member)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const list = await Workspace.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ workspaces: list.map(normalizeForList) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workspaces' });
  }
});

// GET a single workspace by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id).lean();
    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isOwner = String(ws.owner) === String(req.user._id);
    const isMember = ws.members?.some((m) => String(m.user) === String(req.user._id));
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For the single workspace page, we can return a slightly more detailed version
    res.json({ workspace: normalizeForList(ws) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workspace' });
  }
});

// POST (create) a new workspace
router.post(
  '/',
  [authenticateToken, body('name').trim().isLength({ min: 1 }).withMessage('Name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description = '' } = req.body;
      const ws = await Workspace.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'owner' }], // The creator is the owner
        settings: { allowInvites: true, defaultPermissions: 'reader' },
        documentsCount: 0,
      });

      res.status(201).json({ workspace: normalizeForList(ws) });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create workspace' });
    }
  }
);

// PUT (update) a workspace's details
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (String(ws.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can update the workspace' });
    }

    const { name, description } = req.body;
    if (name !== undefined) ws.name = name;
    if (description !== undefined) ws.description = description;
    await ws.save();

    res.json({ workspace: normalizeForList(ws) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update workspace' });
  }
});

// DELETE a workspace
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (String(ws.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can delete the workspace' });
    }

    await ws.deleteOne();
    // In a real app, you would also delete associated documents or archive them.
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete workspace' });
  }
});

/* =================================================== */
/* === NEW & UPDATED MEMBER MANAGEMENT ROUTES      === */
/* =================================================== */

// GET members of a workspace
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .lean();

    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if requester is a member
    const isMember = String(ws.owner._id) === String(req.user._id) || ws.members.some(m => String(m.user._id) === String(req.user._id));
    if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const ownerAsMember = {
      user: ws.owner,
      role: 'owner',
      joinedAt: ws.createdAt,
    };

    // Filter out the owner from the members array to avoid duplicates
    const otherMembers = ws.members?.filter((m) => String(m.user._id) !== String(ws.owner._id)) || [];

    res.json({ members: [ownerAsMember, ...otherMembers] });
  } catch (e) {
    console.error("Error fetching members:", e);
    res.status(500).json({ message: 'Server error while fetching members' });
  }
});

// POST an invitation to a workspace
router.post('/:id/invite', authenticateToken, async (req, res) => {
  // Optional: Add fine-grained RBAC check, e.g., requireWorkspaceRole('editor')
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }

  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userToInvite = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToInvite) {
      return res.status(404).json({ message: `User with email ${email} not found. Please ask them to sign up first.` });
    }

    if (String(ws.owner) === String(userToInvite._id) || ws.members.some(m => String(m.user) === String(userToInvite._id))) {
      return res.status(409).json({ message: 'This user is already in the workspace' });
    }

    ws.members.push({ user: userToInvite._id, role });
    await ws.save();

    // Return the new member object populated with user details for the frontend UI
    res.status(201).json({
      message: 'Invitation sent successfully',
      member: { user: userToInvite.toObject(), role, joinedAt: new Date() },
    });
  } catch (e) {
    console.error("Error inviting member:", e);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
});

// DELETE a member from a workspace
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const ws = await Workspace.findById(id);

    if (!ws) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (String(ws.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the workspace owner can remove members.' });
    }
    if (String(ws.owner) === userId) {
      return res.status(400).json({ message: 'The owner cannot be removed from the workspace.' });
    }

    await Workspace.findByIdAndUpdate(id, { $pull: { members: { user: userId } } });
    res.json({ removed: true, message: 'Member removed successfully.' });
  } catch (e) {
    console.error("Error removing member:", e);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

module.exports = router;