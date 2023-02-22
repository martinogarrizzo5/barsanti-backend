/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `news` table. All the data in the column will be lost.
  - Added the required column `imageName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageName` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `imageUrl`,
    ADD COLUMN `imageName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `imageUrl`,
    ADD COLUMN `imageName` VARCHAR(191) NOT NULL;
