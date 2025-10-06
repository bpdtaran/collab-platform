// backend/sockets/documentSockets.js
const Document = require('../models/Document');
const DocumentHistory = require('../models/DocumentHistory');
const Workspace = require('../models/Workspace');

/**
 * Manages active clients within a single document session.
 */
class DocumentSession {
  constructor(documentId) {
    this.documentId = documentId;
    this.clients = new Map();
  }

  addClient(client) {
    this.clients.set(client.id, client);
    client.join(this.documentId);
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  broadcast(excludeClientId, event, data) {
    this.clients.forEach((client, id) => {
      if (id !== excludeClientId) {
        client.emit(event, data);
      }
    });
  }
}

/**
 * Manages all active document sessions on the server.
 */
class DocumentManager {
  constructor() {
    this.sessions = new Map();
  }

  getSession(documentId) {
    if (!this.sessions.has(documentId)) {
      this.sessions.set(documentId, new DocumentSession(documentId));
    }
    return this.sessions.get(documentId);
  }

  removeSessionIfEmpty(documentId) {
    const session = this.sessions.get(documentId);
    if (session && session.clients.size === 0) {
      this.sessions.delete(documentId);
    }
  }
}

const documentManager = new DocumentManager();

/**
 * Sets up all socket event handlers for a new connection.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // --- JOIN DOCUMENT ---
    socket.on('join-document', async (documentId) => {
      try {
        const doc = await Document.findById(documentId);
        if (!doc) {
          return socket.emit('error', { message: 'Document not found' });
        }

        const workspace = await Workspace.findOne({
          _id: doc.workspace,
          $or: [{ owner: socket.userId }, { 'members.user': socket.userId }],
        });

        if (!workspace) {
          return socket.emit('error', { message: 'Access denied to this document' });
        }

        const session = documentManager.getSession(documentId);
        session.addClient(socket);
        socket.documentId = documentId;

        // Send the full document state only to the user who just joined
        socket.emit('document-state', {
          content: doc.content,
          version: doc.version,
          title: doc.title,
        });

        // Notify others in the room about the new collaborator
        session.broadcast(socket.id, 'collaborator-joined', {
          user: { id: socket.userId, name: socket.user.name, avatar: socket.user.avatar },
          cursorPosition: 0,
        });

        // Add user to the document's active collaborators list in the DB
        await Document.findByIdAndUpdate(documentId, {
          $addToSet: {
            collaborators: { user: socket.userId, cursorPosition: 0, lastActive: new Date() },
          },
        });
      } catch (err) {
        console.error('Error in join-document handler:', err);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // --- HANDLE DELTA (TEXT CHANGE) ---
    socket.on('doc:delta', async ({ documentId, delta, baseVersion, html }) => {
      try {
        if (!socket.documentId || socket.documentId !== documentId) return;

        const doc = await Document.findById(documentId);
        if (!doc) return socket.emit('error', { message: 'Document not found' });

        // Version conflict detection
        if (typeof baseVersion === 'number' && baseVersion !== doc.version) {
          return socket.emit('version-conflict', { currentVersion: doc.version });
        }

        // Save the full HTML snapshot sent from the client
        doc.content = typeof html === 'string' ? html : doc.content;
        doc.version += 1;
        doc.updatedBy = socket.userId;
        await doc.save();

        // Save a history record for significant changes
        await DocumentHistory.create({
          document: doc._id,
          version: doc.version,
          content: doc.content, // Store full content for easy rollback
          changes: delta.ops, // Store the delta that caused this version
          createdBy: socket.userId,
        });

        // Acknowledge the change to the original sender with the new version
        socket.emit('doc:ack', { version: doc.version });

        // Broadcast only the minimal delta to other clients
        const session = documentManager.getSession(documentId);
        session.broadcast(socket.id, 'delta-update', {
          delta, // The { ops: [...] } object
          version: doc.version,
          userId: socket.userId,
        });
      } catch (err) {
        console.error('Error in doc:delta handler:', err);
        socket.emit('error', { message: 'Failed to apply changes' });
      }
    });

    // --- CURSOR UPDATE ---
    socket.on('cursor-update', async ({ documentId, position }) => {
      try {
        if (!socket.documentId || socket.documentId !== documentId) return;
        const session = documentManager.getSession(documentId);

        await Document.findOneAndUpdate(
          { _id: documentId, 'collaborators.user': socket.userId },
          { $set: { 'collaborators.$.cursorPosition': position, 'collaborators.$.lastActive': new Date() } }
        );

        session.broadcast(socket.id, 'cursor-update', {
          userId: socket.userId,
          userName: socket.user.name,
          position,
        });
      } catch (err) {
        console.error('Error in cursor-update handler:', err);
      }
    });

    // --- LEAVE DOCUMENT ---
    const handleLeave = async () => {
      if (!socket.documentId) return;

      try {
        const session = documentManager.getSession(socket.documentId);
        session.removeClient(socket.id);

        await Document.findByIdAndUpdate(socket.documentId, {
          $pull: { collaborators: { user: socket.userId } },
        });

        session.broadcast(socket.id, 'collaborator-left', {
          userId: socket.userId,
        });

        if (session.clients.size === 0) {
          documentManager.removeSessionIfEmpty(socket.documentId);
        }

        socket.documentId = null;
      } catch (err) {
        console.error('Error in handleLeave:', err);
      }
    };

    socket.on('leave-document', handleLeave);
    socket.on('disconnect', async () => {
      await handleLeave();

      try {
        await require('../models/User').findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        console.log(`User ${socket.user.name} disconnected`);
      } catch (err) {
        console.error('Error on disconnect:', err);
      }
    });
  });
};

module.exports = { setupSocketHandlers };