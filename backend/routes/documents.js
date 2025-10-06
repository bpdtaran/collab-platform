const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const DocumentHistory = require('../models/DocumentHistory');
const Workspace = require('../models/Workspace');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const ws = await Workspace.findOne({
      _id: workspaceId,
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });

    if (!ws) return res.status(403).json({ message: 'Access denied' });

    const docs = await Document.find({ workspace: workspaceId, isArchived: false })
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      documents: docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        workspaceId: String(d.workspace),
        updatedAt: d.updatedAt,
        createdBy: { name: d.createdBy?.name || 'Unknown', email: d.createdBy?.email },
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:documentId', authenticateToken, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId)
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const ws = await Workspace.findOne({
      _id: doc.workspace,
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });
    if (!ws) return res.status(403).json({ message: 'Access denied' });

    res.json({
      document: {
        id: String(doc._id),
        title: doc.title,
        content: doc.content,
        version: doc.version,
        workspaceId: String(doc.workspace),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  [
    authenticateToken,
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('workspaceId').isMongoId().withMessage('Valid workspace ID required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, workspaceId } = req.body;
      const content = req.body.content || ' ';

      console.log(`Received 'content' from request: [${req.body.content}], Using 'content' for creation: [${content}]`);

      const ws = await Workspace.findOne({
        _id: workspaceId,
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      });
      if (!ws) return res.status(403).json({ message: 'Access denied' });

      const doc = await Document.create({
        title: title.trim(),
        content,
        workspace: workspaceId,
        createdBy: req.user._id,
        updatedBy: req.user._id,
        version: 0,
      });

      await DocumentHistory.create({
        document: doc._id,
        version: 0,
        content,
        changes: [],
        createdBy: req.user._id,
      });

      res.status(201).json({
        document: {
          id: String(doc._id),
          title: doc.title,
          workspaceId: String(doc.workspace),
          content: doc.content,
          version: doc.version,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// --- UPDATED THIS ENTIRE ROUTE ---
router.put('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, content, version } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const ws = await Workspace.findOne({
      _id: doc.workspace,
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });
    if (!ws) {
      return res.status(403).json({ message: 'Edit access denied' });
    }

    if (version !== undefined && doc.version !== version) {
      return res.status(409).json({ message: 'Version conflict. Please refresh.', currentVersion: doc.version });
    }

    const newVersion = doc.version + 1;

    // Update the main document
    doc.title = title !== undefined ? title : doc.title;
    doc.content = content !== undefined ? content : doc.content;
    doc.updatedBy = req.user._id;
    doc.version = newVersion;

    await doc.save();

    // Create a new history record (this was the missing part)
    await DocumentHistory.create({
      document: doc._id,
      version: newVersion,
      content: doc.content,
      changes: [], // For a full save, changes can be empty
      createdBy: req.user._id,
    });

    // Send back the fully updated document
    res.json({
      document: {
        id: String(doc._id),
        title: doc.title,
        content: doc.content,
        version: doc.version
      },
    });

  } catch (e) {
    console.error("Error in PUT /documents/:documentId:", e);
    res.status(500).json({ message: 'Server error while saving' });
  }
});

router.delete('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: you are not the owner' });
    }

    await Document.findByIdAndDelete(documentId);
    await DocumentHistory.deleteMany({ document: documentId });

    res.json({ message: 'Document and its history have been deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:documentId/history', authenticateToken, async (req, res) => {
  try {
    const history = await DocumentHistory.find({ document: req.params.documentId })
      .populate('createdBy', 'name email avatar')
      .sort({ version: -1 })
      .limit(50);
  res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;