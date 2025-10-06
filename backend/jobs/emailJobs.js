const emailQueue = require('../queues/emailQueue');

const sendWorkspaceInvite = async (inviteData) => {
  const { toEmail, fromName, workspaceName, inviteUrl, role } = inviteData;

  const job = await emailQueue.add('workspace-invite', {
    to: toEmail,
    subject: `You've been invited to join ${workspaceName}`,
    template: 'workspace-invite',
    data: {
      fromName,
      workspaceName,
      inviteUrl,
      role,
      toEmail
    }
  }, {
    delay: 1000, // 1 second delay
    attempts: 3,
    backoff: 'exponential'
  });

  return job;
};

const sendDocumentNotification = async (notificationData) => {
  const { toEmail, documentTitle, action, byUserName, documentUrl } = notificationData;

  const job = await emailQueue.add('document-notification', {
    to: toEmail,
    subject: `Document ${action}: ${documentTitle}`,
    template: 'document-notification',
    data: {
      documentTitle,
      action,
      byUserName,
      documentUrl,
      toEmail
    }
  });

  return job;
};

module.exports = {
  sendWorkspaceInvite,
  sendDocumentNotification
};