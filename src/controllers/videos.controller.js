const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function uploadVideo(req, res) {
  try {
    const { sectionId } = req.params;
    const { title, isPreview } = req.body;

    if (!req.file) return res.status(400).json({ error: "No video file uploaded" });
    if (!title) return res.status(400).json({ error: "Title is required" });

    const videoUrl = req.file.location;

    const lastItem = await prisma.item.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
    const nextOrder = lastItem ? lastItem.order + 1 : 0;

    const item = await prisma.item.create({
      data: {
        sectionId,
        type: "VIDEO",
        title,
        order: nextOrder,
        video: { create: { videoUrl, isPreview: isPreview === "true" } },
      },
      include: { video: true },
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error("Video upload failed:", err);
    return res.status(500).json({ error: "Video upload failed" });
  }
}

module.exports = { uploadVideo };