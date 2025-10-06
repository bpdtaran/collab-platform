const mongoose = require('mongoose');

const documentHistorySchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  version: { type: Number, required: true },
  content: { type: String, required: true },
  changes: [
    {
      type: { type: String, enum: ['insert', 'delete', 'format'], required: true },
      position: { type: Number, required: true },
      text: String,
      length: Number,
      attributes: mongoose.Schema.Types.Mixed,
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

documentHistorySchema.index({ document: 1, version: -1 });

module.exports = mongoose.model('DocumentHistory', documentHistorySchema);