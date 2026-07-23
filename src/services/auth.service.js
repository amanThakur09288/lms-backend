const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "STUDENT" },
  });

  return buildAuthResponse(user);
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return buildAuthResponse(user);
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  return buildAuthResponse(user);
}

function buildAuthResponse(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

module.exports = { registerUser, loginUser, refreshSession };