const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

const FULL_CURRICULUM_INCLUDE = {
  sections: {
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          video: true,
          quiz: {
            include: {
              questions: {
                include: { options: true },
                orderBy: { order: "asc" },
              },
            },
          },
          assignment: true,
          note: true,
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
    include: { _count: { select: { sections: true, enrollments: true } } },
  });
  return courses.map(formatListItem);
}

async function listPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sections: true, enrollments: true } } },
  });
  return courses.map(formatListItem);
}

function formatListItem(c) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    thumbnailUrl: c.thumbnailUrl,
    status: c.status,
    sectionCount: c._count.sections,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

async function getCourseById(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: FULL_CURRICULUM_INCLUDE,
  });
  if (!course) throw new AppError("Course not found", 404);
  return course;
}

/**
 * Student-facing course detail with content gating AND completion tracking.
 * - 404s if the course isn't published.
 * - Locked items (not enrolled, not free preview) have their video URL stripped.
 * - Each item gets a `completed` flag based on that user's ItemProgress rows.
 */
async function getPublishedCourseById(id, userId) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: FULL_CURRICULUM_INCLUDE,
  });
  if (!course || course.status !== "published")
    throw new AppError("Course not found", 404);

  const enrollment = userId
    ? await prisma.enrollment.findFirst({ where: { userId, courseId: id } })
    : null;
  const isEnrolled = Boolean(enrollment);

  // Build a Set of item IDs this user has completed, so lookup below is O(1) per item
  const completedItemIds = userId
    ? new Set(
        (
          await prisma.itemProgress.findMany({
            where: { userId, item: { section: { courseId: id } } },
            select: { itemId: true },
          })
        ).map((p) => p.itemId),
      )
    : new Set();

  const sections = course.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const isFreePreview = item.video?.isPreview === true;
      const locked = !isEnrolled && !isFreePreview;

      return {
        ...item,
        locked,
        completed: completedItemIds.has(item.id),
        video:
          item.video && !locked
            ? item.video
            : item.video
              ? { ...item.video, videoUrl: null }
              : null,
        quiz: locked ? null : item.quiz,
        assignment: locked ? null : item.assignment,
        note: locked ? null : item.note,
      };
    }),
  }));

  return {
    ...course,
    sections,
    isEnrolled,
    progress: enrollment?.progress ?? 0,
  };
}

async function updateCourse(id, data) {
  await ensureCourseExists(id);
  const allowedFields = [
    "title",
    "subtitle",
    "description",
    "thumbnailUrl",
    "status",
  ];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  return prisma.course.update({ where: { id }, data: updateData });
}

async function deleteCourse(id) {
  await ensureCourseExists(id);
  await prisma.course.delete({ where: { id } });
}

async function ensureCourseExists(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!course) throw new AppError("Course not found", 404);
  return course;
}

module.exports = {
  createCourse,
  listCourses,
  listPublishedCourses,
  getCourseById,
  getPublishedCourseById,
  updateCourse,
  deleteCourse,
  ensureCourseExists,
};
