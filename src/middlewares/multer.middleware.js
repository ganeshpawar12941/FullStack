import multer from "multer";

// For small files (images, avatars) → diskStorage
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // stores locally
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for images
});

// For large files (videos) → memoryStorage (no disk write)
export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 * 1024 }, // 6GB limit
});
