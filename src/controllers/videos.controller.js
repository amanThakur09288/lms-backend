const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const videoService = require("../services/video.service");

// POST /api/admin/sections/:sectionId/videos/upload  (multipart/form-data, file field = "video")
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No video file uploaded", 400);

  const item = await videoService.addUploadedVideo(req.params.sectionId, {
    title: req.body.title,
    isPreview: req.body.isPreview === "true",
    videoUrl: req.file.location, // set by multer-s3
  });

  res.status(201).json({ success: true, data: item });
});

// POST /api/admin/sections/:sectionId/videos/link  (application/json)
const addVideoLink = asyncHandler(async (req, res) => {
  const item = await videoService.addLinkedVideo(req.params.sectionId, req.body);
  res.status(201).json({ success: true, data: item });
});

const deleteVideo = asyncHandler(async (req, res) => {
  await videoService.deleteVideoItem(req.params.itemId);
  res.status(200).json({ success: true, data: null });
});

module.exports = { uploadVideo, addVideoLink, deleteVideo };