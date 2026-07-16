// src/controllers/auth.controller.js
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

// const REFRESH_COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict",
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// };

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // required when sameSite is "none" — both your domains are HTTPS anyway, so this is fine
  sameSite: "none", // required for cross-site cookies (Vercel frontend → Render backend)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
}

const signup = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ success: true, data: { user, accessToken } });
});

// Called silently by the frontend's axios interceptor when the access token expires
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(refreshToken);
  setRefreshCookie(res, newRefreshToken); // rotate refresh token on each use
  res.status(200).json({ success: true, data: { user, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: null });
});

module.exports = { signup, login, refresh, logout };