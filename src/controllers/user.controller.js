const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
});

module.exports = { getMe, updateMe };