const express = require("express");
const router = express.Router();

const { protect, isAdmin } = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadmiddleware");
const { uploadPaper } = require("../controllers/adminController");

router.post(
  "/upload-paper",
  protect,
  isAdmin,
  upload.single("questionPaper"),
  uploadPaper,
);
module.exports = router;
