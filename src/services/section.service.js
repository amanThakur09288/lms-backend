const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");
const { ensureCourseExists } = require("./course.service");

const prisma = new PrismaClient();

async function addSection(courseId, { title }) {
  await ensureCourseExists(courseId);

  const lastSection = await prisma.section.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  const nextOrder = lastSection ? lastSection.order + 1 : 0;

  return prisma.section.create({
    data: { courseId, title, order: nextOrder },
  });
}

async function updateSection(sectionId, { title }) {
  await ensureSectionExists(sectionId);
  return prisma.section.update({ where: { id: sectionId }, data: { title } });
}

async function deleteSection(sectionId) {
  await ensureSectionExists(sectionId);
  await prisma.section.delete({ where: { id: sectionId } }); // cascades to items/video/quiz
}

async function reorderSections(courseId, orderedSectionIds) {
  await ensureCourseExists(courseId);

  await prisma.$transaction(
    orderedSectionIds.map((sectionId, index) =>
      prisma.section.update({ where: { id: sectionId }, data: { order: index } })
    )
  );
}

async function ensureSectionExists(sectionId) {
  const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { id: true } });
  if (!section) throw new AppError("Section not found", 404);
  return section;
}

module.exports = { addSection, updateSection, deleteSection, reorderSections, ensureSectionExists };