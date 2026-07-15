const express = require("express");
const router = express.Router();
const { videoUpload } = require("../middleware/upload.middleware");
const { uploadVideo } = require("../controllers/videos.controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleCheck");

router.post(
  "/sections/:sectionId/videos",
  authMiddleware,
  requireRole("ADMIN"),
  videoUpload.single("video"),
  uploadVideo
);

module.exports = router;