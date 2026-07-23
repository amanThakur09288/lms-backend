const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");
const { ensureSectionExists } = require("./section.service");

const prisma = new PrismaClient();

async function getNextItemOrder(sectionId) {
  const lastItem = await prisma.item.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
  return lastItem ? lastItem.order + 1 : 0;
}

async function addUploadedVideo(sectionId, { title, isPreview, videoUrl }) {
  await ensureSectionExists(sectionId);
  const order = await getNextItemOrder(sectionId);

  return prisma.item.create({
    data: {
      sectionId,
      type: "VIDEO",
      title,
      order,
      video: {
        create: { videoUrl, sourceType: "UPLOAD", isPreview: Boolean(isPreview) },
      },
    },
    include: { video: true },
  });
}

async function addLinkedVideo(sectionId, { title, videoUrl, sourceType, isPreview }) {
  await ensureSectionExists(sectionId);
  const order = await getNextItemOrder(sectionId);

  const normalizedSource = detectSourceType(videoUrl, sourceType);

  return prisma.item.create({
    data: {
      sectionId,
      type: "VIDEO",
      title,
      order,
      video: {
        create: { videoUrl, sourceType: normalizedSource, isPreview: Boolean(isPreview) },
      },
    },
    include: { video: true },
  });
}

function detectSourceType(url, providedType) {
  if (providedType) return providedType.toUpperCase();
  if (/youtube\.com|youtu\.be/.test(url)) return "YOUTUBE";
  if (/drive\.google\.com/.test(url)) return "DRIVE";
  return "EXTERNAL";
}

async function deleteVideoItem(itemId) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError("Video item not found", 404);
  await prisma.item.delete({ where: { id: itemId } });
}

module.exports = { addUploadedVideo, addLinkedVideo, deleteVideoItem };