const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { enroll, getMyEnrollments, markComplete, unmarkComplete } = require("../controllers/enrollment.controller");

router.use(authMiddleware);

router.get("/me", getMyEnrollments);
router.post("/:courseId", enroll);
router.post("/:courseId/items/:itemId/complete", markComplete);
router.delete("/:courseId/items/:itemId/complete", unmarkComplete);

module.exports = router;