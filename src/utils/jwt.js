const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };