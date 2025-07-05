/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "contentPublicId" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "thumbnailPublicId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profileProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
