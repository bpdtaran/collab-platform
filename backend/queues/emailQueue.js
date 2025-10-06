const Queue = require('bull');
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

const emailQueue = new Queue('email', { redis: redisConfig });

// Process email jobs
emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;

  console.log(`Processing email job: ${subject} to ${to}`);

  // Simulate email sending
  // In production, integrate with SendGrid, Mailgun, etc.
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(`Email sent: ${subject} to ${to}`);

  return { success: true, messageId: `mock-${Date.now()}` };
});

// Handle completed jobs
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

// Handle failed jobs
emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err);
});

module.exports = emailQueue;