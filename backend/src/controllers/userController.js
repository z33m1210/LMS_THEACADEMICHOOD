const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const logAction = require('../utils/logger');

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, email: true, name: true, role: true, phoneNumber: true, studentId: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, phoneNumber, studentId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role, phoneNumber, studentId }
    });

    await logAction(req.user.userId, 'CREATE_USER', `User: ${user.email}`, { role: user.role });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data
    });

    await logAction(req.user.userId, 'UPDATE_USER', `User: ${user.email}`);

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    await logAction(req.user.userId, 'SOFT_DELETE_USER', `User: ${user.email}`);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { studentId: true, name: true, email: true, role: true, phoneNumber: true }
    });

    const fields = ['studentId', 'name', 'email', 'role', 'phoneNumber'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);

    res.header('Content-Type', 'text/csv');
    res.attachment('users_export.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error exporting users' });
  }
};
