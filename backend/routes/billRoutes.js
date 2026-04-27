const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse");

const router = express.Router();


// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


// ✅ File filter (only allow PDFs)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
});


// 🔥 Upload + Extract
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // ❗ check file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    // ❗ read file safely
    const dataBuffer = fs.readFileSync(filePath);

    // ❗ extract text
    const pdfData = await pdfParse(dataBuffer);

    console.log("✅ Extracted Text:\n", pdfData.text);

    res.json({
      message: "File uploaded & extracted",
      extractedText: pdfData.text,
      fileName: req.file.filename,
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);

    res.status(500).json({
      message: "Extraction failed",
      error: err.message,
    });
  }
});

module.exports = router;