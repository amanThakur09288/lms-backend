const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleCheck");
const validate = require("../middleware/validate");

const {
  createCourseSchema,
  updateCourseSchema,
  sectionSchema,
  reorderSectionsSchema,
  videoLinkSchema,
} = require("../validators/course.validator");

const courseController = require("../controllers/course.controller");
const sectionController = require("../controllers/section.controller");
const videoController = require("../controllers/videos.controller");
const { videoUpload } = require("../middleware/upload.middleware");

// All routes below require a logged-in admin
router.use(authMiddleware, requireRole("ADMIN"));

// --- Courses ---
router.post("/", validate(createCourseSchema), courseController.createCourse);
router.get("/", courseController.listCourses);
router.get("/:courseId", courseController.getCourse);
router.put("/:courseId", validate(updateCourseSchema), courseController.updateCourse);
router.delete("/:courseId", courseController.deleteCourse);

// --- Sections (nested under course) ---
router.post("/:courseId/sections", validate(sectionSchema), sectionController.addSection);
router.put("/:courseId/sections/reorder", validate(reorderSectionsSchema), sectionController.reorderSections);
router.put("/sections/:sectionId", validate(sectionSchema), sectionController.updateSection);
router.delete("/sections/:sectionId", sectionController.deleteSection);

// --- Videos (nested under section) — two ways to add one ---
router.post("/sections/:sectionId/videos/upload", videoUpload.single("video"), videoController.uploadVideo);
router.post("/sections/:sectionId/videos/link", validate(videoLinkSchema), videoController.addVideoLink);
router.delete("/items/:itemId/video", videoController.deleteVideo);

module.exports = router;