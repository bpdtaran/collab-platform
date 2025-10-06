// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connects to the socket server with the provided auth token.
   * @param {string} token - The JWT access token.
   */
  connect(token) {
    if (this.socket && this.socket.connected) {
      return;
    }
    // Use REACT_APP_* for Create React App
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'], // Prefer websocket for performance
    });

    console.log('Attempting to connect to socket server...');
  }

  /**
   * Disconnects from the socket server.
   */
  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (e) {
        console.error('Error disconnecting socket:', e);
      }
      this.socket = null;
    }
  }

  /**
   * Checks if the socket is currently connected.
   * @returns {boolean}
   */
  isConnected() {
    return !!this.socket && this.socket.connected;
  }

  /**
   * Subscribes to a socket event.
   * @param {string} event - The event name.
   * @param {function} handler - The callback function.
   */
  on(event, handler) {
    this.socket?.on(event, handler);
  }

  /**
   * Unsubscribes from a socket event.
   * @param {string} event - The event name.
   * @param {function} handler - The callback function.
   */
  off(event, handler) {
    this.socket?.off(event, handler);
  }

  // --- Document-Specific Actions ---

  joinDocument(documentId) {
    this.socket?.emit('join-document', documentId);
  }

  leaveDocument(documentId) {
    this.socket?.emit('leave-document', documentId);
  }

  updateCursor(documentId, position) {
    this.socket?.emit('cursor-update', { documentId, position });
  }

  /**
   * Sends a minimal change (delta) to the server.
   * @param {string} documentId - The ID of the document.
   * @param {object} ops - The Quill delta operations array.
   * @param {number} baseVersion - The client's current document version.
   * @param {string} html - The full HTML snapshot of the document content.
   */
  sendDelta(documentId, ops, baseVersion, html) {
    if (!this.isConnected()) return;
    this.socket?.emit('doc:delta', {
      documentId,
      delta: { ops },
      baseVersion,
      html, // Server saves this snapshot, broadcasts the delta to others
    });
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;