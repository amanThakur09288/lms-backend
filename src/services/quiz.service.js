const { PrismaClient } = require("@prisma/client");
const { ensureSectionExists } = require("./section.service");

const prisma = new PrismaClient();

async function getNextItemOrder(sectionId) {
  const lastItem = await prisma.item.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
  return lastItem ? lastItem.order + 1 : 0;
}

async function addQuiz(sectionId, { title, passPercentage, timeLimitMin, questions }) {
  await ensureSectionExists(sectionId);
  const order = await getNextItemOrder(sectionId);

  return prisma.item.create({
    data: {
      sectionId,
      type: "QUIZ",
      title,
      order,
      quiz: {
        create: {
          passPercentage,
          timeLimitMin: timeLimitMin ?? null,
          questions: {
            create: questions.map((q, qIndex) => ({
              text: q.text,
              type: q.type,
              points: q.points,
              order: qIndex,
              options: {
                create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
              },
            })),
          },
        },
      },
    },
    include: {
      quiz: { include: { questions: { include: { options: true } } } },
    },
  });
}

module.exports = { addQuiz };