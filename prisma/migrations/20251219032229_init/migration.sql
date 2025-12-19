-- CreateTable
CREATE TABLE "FormSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "FormSession_formId_idx" ON "FormSession"("formId");
