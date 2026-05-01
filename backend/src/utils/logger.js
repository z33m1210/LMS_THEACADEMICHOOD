const prisma = require('../utils/prisma');

const logAction = async (userId, action, target, details = null) => {
  try {
    await prisma.actionLog.create({
      data: {
        userId: parseInt(userId),
        action,
        target,
        details: typeof details === 'string' ? details : JSON.stringify(details),
      },
    });
  } catch (err) {
    console.error('Logging error:', err);
  }
};

module.exports = logAction;
