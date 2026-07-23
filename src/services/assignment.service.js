const { PrismaClient } = require("@prisma/client");
const { ensureSectionExists } = require("./section.service");

const prisma = new PrismaClient();

async function getNextItemOrder(sectionId) {
  const lastItem = await prisma.item.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
  return lastItem ? lastItem.order + 1 : 0;
}

async function addAssignment(sectionId, { title, instructions, submissionType, graded }) {
  await ensureSectionExists(sectionId);
  const order = await getNextItemOrder(sectionId);

  return prisma.item.create({
    data: {
      sectionId,
      type: "ASSIGNMENT",
      title,
      order,
      assignment: {
        create: { instructions, submissionType, graded: graded ?? true },
      },
    },
    include: { assignment: true },
  });
}

module.exports = { addAssignment };