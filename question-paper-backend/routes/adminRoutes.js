const express = require("express");
const router = express.Router();

const { protect, isAdmin } = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadmiddleware");
const { uploadPaper, distributePaper, verifyHash } = require("../controllers/adminController");

router.post(
  "/upload-paper",
  protect,
  isAdmin,
  upload.single("questionPaper"),
  uploadPaper,
);

router.post(
  "/distribute-paper",
  protect,
  isAdmin,
  upload.single("questionPaper"),
  distributePaper,
);

router.post(
  "/verify-hash",
  protect,
  isAdmin,
  verifyHash
);

module.exports = router;
