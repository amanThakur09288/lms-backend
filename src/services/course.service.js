const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

// Shared "include" shape so list/detail responses are consistent
const FULL_CURRICULUM_INCLUDE = {
  sections: {
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          video: true,
          quiz: { include: { questions: { include: { options: true }, orderBy: { order: "asc" } } } },
          assignment: true,
        },
      },
    },
  },
};

async function createCourse({ title, subtitle, description, thumbnailUrl }) {
  return prisma.course.create({
    data: { title, subtitle, description, thumbnailUrl, status: "draft" },
  });
}

async function listCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sections: true, enrollments: true } },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    thumbnailUrl: c.thumbnailUrl,
    status: c.status,
    sectionCount: c._count.sections,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

async function getCourseById(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: FULL_CURRICULUM_INCLUDE,
  });

  if (!course) throw new AppError("Course not found", 404);
  return course;
}

async function updateCourse(id, data) {
  await ensureCourseExists(id);

  const allowedFields = ["title", "subtitle", "description", "thumbnailUrl", "status"];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  return prisma.course.update({ where: { id }, data: updateData });
}

async function deleteCourse(id) {
  await ensureCourseExists(id);
  // Cascade delete (configured in schema.prisma) handles sections/items/videos/quizzes automatically
  await prisma.course.delete({ where: { id } });
}

async function ensureCourseExists(id) {
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!course) throw new AppError("Course not found", 404);
  return course;
}

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  ensureCourseExists,
};