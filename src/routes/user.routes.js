const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { updateProfileSchema } = require("../validators/user.validator");
const { getMe, updateMe } = require("../controllers/user.controller");

router.use(authMiddleware);

router.get("/me", getMe);
router.put("/me", validate(updateProfileSchema), updateMe);

module.exports = router;