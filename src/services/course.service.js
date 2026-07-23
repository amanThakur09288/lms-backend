// const { PrismaClient } = require("@prisma/client");
// const AppError = require("../utils/AppError");

// const prisma = new PrismaClient();

// const FULL_CURRICULUM_INCLUDE = {
//   sections: {
//     orderBy: { order: "asc" },
//     include: {
//       items: {
//         orderBy: { order: "asc" },
//         include: {
//           video: true,
//           quiz: {
//             include: {
//               questions: {
//                 include: { options: true },
//                 orderBy: { order: "asc" },
//               },
//             },
//           },
//           assignment: true,
//           note: true,
//         },
//       },
//     },
//   },
// };

// async function createCourse({ title, subtitle, description, thumbnailUrl }) {
//   return prisma.course.create({
//     data: { title, subtitle, description, thumbnailUrl, status: "draft" },
//   });
// }

// async function listCourses() {
//   const courses = await prisma.course.findMany({
//     orderBy: { createdAt: "desc" },
//     include: { _count: { select: { sections: true, enrollments: true } } },
//   });
//   return courses.map(formatListItem);
// }

// async function listPublishedCourses() {
//   const courses = await prisma.course.findMany({
//     where: { status: "published" },
//     orderBy: { createdAt: "desc" },
//     include: { _count: { select: { sections: true, enrollments: true } } },
//   });
//   return courses.map(formatListItem);
// }

// function formatListItem(c) {
//   return {
//     id: c.id,
//     title: c.title,
//     subtitle: c.subtitle,
//     thumbnailUrl: c.thumbnailUrl,
//     status: c.status,
//     sectionCount: c._count.sections,
//     enrollmentCount: c._count.enrollments,
//     createdAt: c.createdAt,
//     updatedAt: c.updatedAt,
//   };
// }

// async function getCourseById(id) {
//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: FULL_CURRICULUM_INCLUDE,
//   });
//   if (!course) throw new AppError("Course not found", 404);
//   return course;
// }

// /**
//  * Student-facing course detail with content gating AND completion tracking.
//  * - 404s if the course isn't published.
//  * - Locked items (not enrolled, not free preview) have their video URL stripped.
//  * - Each item gets a `completed` flag based on that user's ItemProgress rows.
//  */
// async function getPublishedCourseById(id, userId) {
//   const course = await prisma.course.findUnique({
//     where: { id },
//     include: FULL_CURRICULUM_INCLUDE,
//   });
//   if (!course || course.status !== "published")
//     throw new AppError("Course not found", 404);

//   const enrollment = userId
//     ? await prisma.enrollment.findFirst({ where: { userId, courseId: id } })
//     : null;
//   const isEnrolled = Boolean(enrollment);

//   // Build a Set of item IDs this user has completed, so lookup below is O(1) per item
//   const completedItemIds = userId
//     ? new Set(
//         (
//           await prisma.itemProgress.findMany({
//             where: { userId, item: { section: { courseId: id } } },
//             select: { itemId: true },
//           })
//         ).map((p) => p.itemId),
//       )
//     : new Set();

//   const sections = course.sections.map((section) => ({
//     ...section,
//     items: section.items.map((item) => {
//       const isFreePreview = item.video?.isPreview === true;
//       const locked = !isEnrolled && !isFreePreview;

//       return {
//         ...item,
//         locked,
//         completed: completedItemIds.has(item.id),
//         video:
//           item.video && !locked
//             ? item.video
//             : item.video
//               ? { ...item.video, videoUrl: null }
//               : null,
//         quiz: locked ? null : item.quiz,
//         assignment: locked ? null : item.assignment,
//         note: locked ? null : item.note,
//       };
//     }),
//   }));

//   return {
//     ...course,
//     sections,
//     isEnrolled,
//     progress: enrollment?.progress ?? 0,
//   };
// }

// async function updateCourse(id, data) {
//   await ensureCourseExists(id);
//   const allowedFields = [
//     "title",
//     "subtitle",
//     "description",
//     "thumbnailUrl",
//     "status",
//   ];
//   const updateData = {};
//   for (const field of allowedFields) {
//     if (data[field] !== undefined) updateData[field] = data[field];
//   }
//   return prisma.course.update({ where: { id }, data: updateData });
// }

// async function deleteCourse(id) {
//   await ensureCourseExists(id);
//   await prisma.course.delete({ where: { id } });
// }

// async function ensureCourseExists(id) {
//   const course = await prisma.course.findUnique({
//     where: { id },
//     select: { id: true },
//   });
//   if (!course) throw new AppError("Course not found", 404);
//   return course;
// }

// module.exports = {
//   createCourse,
//   listCourses,
//   listPublishedCourses,
//   getCourseById,
//   getPublishedCourseById,
//   updateCourse,
//   deleteCourse,
//   ensureCourseExists,
// };

// src/services/course.service.js

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
                orderBy: { order: "asc" },
                include: {
                  options: true,
                },
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

async function createCourse({
  title,
  subtitle,
  description,
  thumbnailUrl,
}) {
  return prisma.course.create({
    data: {
      title,
      subtitle,
      description,
      thumbnailUrl,
      status: "draft",
    },
  });
}

async function listCourses() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          sections: true,
          enrollments: true,
        },
      },
    },
  });

  return courses.map(formatListItem);
}

async function listPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "published",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          sections: true,
          enrollments: true,
        },
      },
    },
  });

  return courses.map(formatListItem);
}

function formatListItem(course) {
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    thumbnailUrl: course.thumbnailUrl,
    status: course.status,

    sectionCount: course._count.sections,
    enrollmentCount: course._count.enrollments,

    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

async function getCourseById(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: FULL_CURRICULUM_INCLUDE,
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
}

/**
 * Student-facing course detail.
 *
 * Handles:
 * - published course validation
 * - enrollment
 * - locked content
 * - free preview videos
 * - item completion
 * - course progress
 * - safe quiz data
 */
async function getPublishedCourseById(id, userId) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: FULL_CURRICULUM_INCLUDE,
  });

  if (!course || course.status !== "published") {
    throw new AppError("Course not found", 404);
  }

  // ---------------------------------------
  // Enrollment
  // ---------------------------------------

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId: id,
    },
  });

  const isEnrolled = Boolean(enrollment);

  // ---------------------------------------
  // Completed items
  // ---------------------------------------

  const completedRows = await prisma.itemProgress.findMany({
    where: {
      userId,
      item: {
        section: {
          courseId: id,
        },
      },
    },
    select: {
      itemId: true,
    },
  });

  const completedItemIds = new Set(
    completedRows.map((row) => row.itemId),
  );

  // ---------------------------------------
  // Build safe student curriculum
  // ---------------------------------------

  const sections = course.sections.map((section) => {
    return {
      id: section.id,
      courseId: section.courseId,
      title: section.title,
      order: section.order,

      items: section.items.map((item) => {
        const isPreviewVideo =
          item.type === "VIDEO" &&
          item.video?.isPreview === true;

        const locked =
          !isEnrolled &&
          !isPreviewVideo;

        // ---------------------------------------
        // VIDEO
        // ---------------------------------------

        let video = null;

        if (item.video) {
          video = {
            id: item.video.id,
            itemId: item.video.itemId,
            sourceType: item.video.sourceType,
            duration: item.video.duration,
            isPreview: item.video.isPreview,

            // Never expose protected video URL.
            videoUrl: locked
              ? null
              : item.video.videoUrl,
          };
        }

        // ---------------------------------------
        // QUIZ
        // ---------------------------------------

        let quiz = null;

        if (item.quiz && !locked) {
          quiz = {
            id: item.quiz.id,
            itemId: item.quiz.itemId,
            passPercentage: item.quiz.passPercentage,
            timeLimitMin: item.quiz.timeLimitMin,

            questions: item.quiz.questions.map((question) => ({
              id: question.id,
              quizId: question.quizId,
              text: question.text,
              type: question.type,
              points: question.points,
              order: question.order,

              // IMPORTANT:
              // isCorrect is deliberately NOT returned.
              options: question.options.map((option) => ({
                id: option.id,
                questionId: option.questionId,
                text: option.text,
              })),
            })),
          };
        }

        // ---------------------------------------
        // ASSIGNMENT
        // ---------------------------------------

        const assignment =
          item.assignment && !locked
            ? {
                id: item.assignment.id,
                itemId: item.assignment.itemId,
                instructions: item.assignment.instructions,
                submissionType:
                  item.assignment.submissionType,
                graded: item.assignment.graded,
              }
            : null;

        // ---------------------------------------
        // NOTE
        // ---------------------------------------

        const note =
          item.note && !locked
            ? {
                id: item.note.id,
                itemId: item.note.itemId,
                content: item.note.content,
                attachmentUrl: item.note.attachmentUrl,
              }
            : null;

        return {
          id: item.id,
          sectionId: item.sectionId,
          type: item.type,
          title: item.title,
          order: item.order,

          locked,
          completed: completedItemIds.has(item.id),

          video,
          quiz,
          assignment,
          note,
        };
      }),
    };
  });

  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    status: course.status,

    isEnrolled,

    progress:
      enrollment?.progress ?? 0,

    sections,
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
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  return prisma.course.update({
    where: { id },
    data: updateData,
  });
}

async function deleteCourse(id) {
  await ensureCourseExists(id);

  await prisma.course.delete({
    where: { id },
  });
}

async function ensureCourseExists(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

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