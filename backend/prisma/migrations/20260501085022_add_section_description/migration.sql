-- AlterTable
ALTER TABLE "Section" ADD COLUMN "description" TEXT;

-- CreateTable
CREATE TABLE "BatchSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BatchSection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BatchSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchSection_batchId_sectionId_key" ON "BatchSection"("batchId", "sectionId");
