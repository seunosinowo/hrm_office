-- CreateEnum
CREATE TYPE "AppraisalType" AS ENUM ('SELF', 'ASSESSOR');

-- CreateTable
CREATE TABLE "PerformanceAppraisalQuestion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "howToMeasure" TEXT,
    "goodIndicator" TEXT,
    "redFlag" TEXT,
    "ratingCriteria" TEXT,
    "order" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceAppraisalQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAppraisal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "AppraisalType" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'PENDING',
    "employeeId" TEXT NOT NULL,
    "assessorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PerformanceAppraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAppraisalResponse" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "employeeRating" INTEGER,
    "employeeComment" TEXT,
    "assessorRating" INTEGER,
    "assessorComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceAppraisalResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceAppraisalQuestion_organizationId_key_key" ON "PerformanceAppraisalQuestion"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceAppraisalResponse_appraisalId_questionId_key" ON "PerformanceAppraisalResponse"("appraisalId", "questionId");

-- AddForeignKey
ALTER TABLE "PerformanceAppraisalQuestion" ADD CONSTRAINT "PerformanceAppraisalQuestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisal" ADD CONSTRAINT "PerformanceAppraisal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisal" ADD CONSTRAINT "PerformanceAppraisal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisal" ADD CONSTRAINT "PerformanceAppraisal_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisalResponse" ADD CONSTRAINT "PerformanceAppraisalResponse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisalResponse" ADD CONSTRAINT "PerformanceAppraisalResponse_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "PerformanceAppraisal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAppraisalResponse" ADD CONSTRAINT "PerformanceAppraisalResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PerformanceAppraisalQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
