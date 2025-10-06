// backend/models/CollabDocument.js
const mongoose = require('mongoose');

const collabDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cursorPosition: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }],
  permissions: {
    public: {
      type: Boolean,
      default: false
    },
    allowedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['editor', 'commenter', 'reader']
      }
    }]
  }
}, {
  timestamps: true
});

// Text index for search
collabDocumentSchema.index({ title: 'text', content: 'text' });
collabDocumentSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('CollabDocument', collabDocumentSchema);