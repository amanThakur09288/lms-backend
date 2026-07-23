const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

// Works for ANY item type — Video, Quiz, Assignment, or Note — since
// the schema's onDelete: Cascade removes the type-specific row automatically.
async function deleteItem(itemId) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError("Item not found", 404);
  await prisma.item.delete({ where: { id: itemId } });
}

module.exports = { deleteItem };