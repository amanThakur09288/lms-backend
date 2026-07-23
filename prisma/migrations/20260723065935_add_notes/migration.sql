-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_itemId_key" ON "Note"("itemId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
