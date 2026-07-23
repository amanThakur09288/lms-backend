const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, bio: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function updateProfile(userId, data) {
  const allowedFields = ["name", "bio", "avatarUrl"];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, bio: true, avatarUrl: true, role: true, createdAt: true },
  });
}

module.exports = { getProfile, updateProfile };