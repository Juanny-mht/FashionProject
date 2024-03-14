/*
  Warnings:

  - Added the required column `categoryId` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Stock" (
    "articleId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    CONSTRAINT "Stock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("id") SELECT "id" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_categoryId_key" ON "Article"("categoryId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_articleId_key" ON "Stock"("articleId");
