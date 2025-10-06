const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'editor', 'commenter', 'reader'], default: 'reader' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    settings: {
      allowInvites: { type: Boolean, default: true },
      defaultPermissions: { type: String, enum: ['editor', 'commenter', 'reader'], default: 'reader' },
    },
  },
  { timestamps: true }
);

workspaceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Workspace', workspaceSchema);