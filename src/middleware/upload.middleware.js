const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const videoUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => cb(null, `videos/${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only MP4, WebM, or MOV files are allowed"));
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
});

module.exports = { videoUpload };