const { PrismaClient } = require('../generated/client_v3');
const prisma = new PrismaClient();
module.exports = prisma;
