-- CreateTable
CREATE TABLE "author" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookToauthor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BookToauthor_A_fkey" FOREIGN KEY ("A") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookToauthor_B_fkey" FOREIGN KEY ("B") REFERENCES "author" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookToauthor_AB_unique" ON "_BookToauthor"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToauthor_B_index" ON "_BookToauthor"("B");
