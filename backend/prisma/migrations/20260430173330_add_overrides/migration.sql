-- CreateTable
CREATE TABLE "BatchLesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,
    CONSTRAINT "BatchLesson_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BatchLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BatchAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "weight" REAL,
    "exerciseFileUrl" TEXT,
    CONSTRAINT "BatchAssignment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BatchAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchLesson_batchId_lessonId_key" ON "BatchLesson"("batchId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchAssignment_batchId_assignmentId_key" ON "BatchAssignment"("batchId", "assignmentId");
