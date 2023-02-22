-- CreateIndex
CREATE FULLTEXT INDEX `News_description_idx` ON `News`(`description`);

-- CreateIndex
CREATE FULLTEXT INDEX `News_title_description_idx` ON `News`(`title`, `description`);
