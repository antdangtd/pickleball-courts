/*
  Warnings:

  - You are about to drop the column `courtId` on the `Event` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CourtsOnEvents" (
    "courtId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    PRIMARY KEY ("courtId", "eventId"),
    CONSTRAINT "CourtsOnEvents_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourtsOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "min_skill" TEXT,
    "max_skill" TEXT,
    "max_players" INTEGER NOT NULL DEFAULT 4,
    "current_players" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_bookable" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "current_players", "end", "id", "is_bookable", "max_players", "max_skill", "min_skill", "notes", "start", "title", "type", "updatedAt", "userId") SELECT "createdAt", "current_players", "end", "id", "is_bookable", "max_players", "max_skill", "min_skill", "notes", "start", "title", "type", "updatedAt", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
