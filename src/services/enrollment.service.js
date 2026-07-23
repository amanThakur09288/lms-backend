const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

async function enrollInCourse(userId, courseId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "published") {
    throw new AppError("Course not found", 404);
  }

  const existing = await prisma.enrollment.findFirst({ where: { userId, courseId } });
  if (existing) return existing;

  return prisma.enrollment.create({ data: { userId, courseId, progress: 0 } });
}

async function getEnrollment(userId, courseId) {
  return prisma.enrollment.findFirst({ where: { userId, courseId } });
}

async function listMyEnrollments(userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, title: true, subtitle: true, thumbnailUrl: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    progress: e.progress,
    enrolledAt: e.createdAt,
    course: e.course,
  }));
}

async function markItemComplete(userId, courseId, itemId) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId } });
  if (!enrollment) throw new AppError("You must be enrolled in this course first", 403);

  await prisma.itemProgress.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: {},
    create: { userId, itemId },
  });

  return recomputeProgress(userId, courseId, enrollment.id);
}

async function unmarkItemComplete(userId, courseId, itemId) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId } });
  if (!enrollment) throw new AppError("You must be enrolled in this course first", 403);

  await prisma.itemProgress.deleteMany({ where: { userId, itemId } });

  return recomputeProgress(userId, courseId, enrollment.id);
}

async function recomputeProgress(userId, courseId, enrollmentId) {
  const totalItems = await prisma.item.count({ where: { section: { courseId } } });
  const completedItems = await prisma.itemProgress.count({
    where: { userId, item: { section: { courseId } } },
  });

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  await prisma.enrollment.update({ where: { id: enrollmentId }, data: { progress } });

  return { progress, completedItems, totalItems };
}

module.exports = {
  enrollInCourse,
  getEnrollment,
  listMyEnrollments,
  markItemComplete,
  unmarkItemComplete,
};