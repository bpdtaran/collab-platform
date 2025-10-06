const express = require('express');
const Document = require('../models/CollabDocument');
const Workspace = require('../models/Workspace');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q, workspaceId, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Build workspace filter
    let workspaceFilter = {};
    if (workspaceId) {
      workspaceFilter = { workspace: workspaceId };
    } else {
      // Get user's workspaces
      const userWorkspaces = await Workspace.find({
        'members.user': req.user._id
      }).select('_id');

      workspaceFilter = {
        workspace: { $in: userWorkspaces.map(w => w._id) }
      };
    }

    // Text search with relevance scoring
    const searchResults = await Document.aggregate([
      {
        $match: {
          ...workspaceFilter,
          $text: { $search: q }
        }
      },
      {
        $addFields: {
          score: { $meta: "textScore" },
          titleMatch: {
            $cond: {
              if: { $regexMatch: { input: "$title", regex: q, options: "i" } },
              then: 2,
              else: 1
            }
          }
        }
      },
      {
        $addFields: {
          relevance: {
            $add: [
              { $multiply: ["$score", 10] },
              "$titleMatch"
            ]
          }
        }
      },
      {
        $sort: { relevance: -1, updatedAt: -1 }
      },
      {
        $skip: parseInt(offset)
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: '$createdBy'
      },
      {
        $project: {
          title: 1,
          content: 1,
          workspace: 1,
          createdAt: 1,
          updatedAt: 1,
          'createdBy.name': 1,
          'createdBy.email': 1,
          'createdBy.avatar': 1,
          relevance: 1,
          highlights: {
            $meta: "textScore"
          }
        }
      }
    ]);

    // Get total count for pagination
    const totalCount = await Document.countDocuments({
      ...workspaceFilter,
      $text: { $search: q }
    });

    res.json({
      results: searchResults,
      totalCount,
      hasMore: (parseInt(offset) + searchResults.length) < totalCount
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Advanced search with filters
router.get('/advanced', authenticateToken, async (req, res) => {
  try {
    const { q, workspaceId, authorId, dateFrom, dateTo, contentOnly } = req.query;

    let filter = {};

    // Workspace filter
    if (workspaceId) {
      filter.workspace = workspaceId;
    } else {
      const userWorkspaces = await Workspace.find({
        'members.user': req.user._id
      }).select('_id');
      filter.workspace = { $in: userWorkspaces.map(w => w._id) };
    }

    // Author filter
    if (authorId) {
      filter.createdBy = authorId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.updatedAt = {};
      if (dateFrom) filter.updatedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.updatedAt.$lte = new Date(dateTo);
    }

    // Text search
    if (q && q.trim().length >= 2) {
      if (contentOnly) {
        filter.content = { $regex: q, $options: 'i' };
      } else {
        filter.$text = { $search: q };
      }
    }

    const documents = await Document.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('workspace', 'name')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(documents);
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;