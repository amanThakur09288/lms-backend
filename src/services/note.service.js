const { PrismaClient } = require("@prisma/client");
const { ensureSectionExists } = require("./section.service");

const prisma = new PrismaClient();

async function getNextItemOrder(sectionId) {
  const lastItem = await prisma.item.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
  return lastItem ? lastItem.order + 1 : 0;
}

async function addNote(sectionId, { title, content, attachmentUrl }) {
  await ensureSectionExists(sectionId);
  const order = await getNextItemOrder(sectionId);

  return prisma.item.create({
    data: {
      sectionId,
      type: "NOTE",
      title,
      order,
      note: {
        create: { content, attachmentUrl: attachmentUrl || null },
      },
    },
    include: { note: true },
  });
}

module.exports = { addNote };