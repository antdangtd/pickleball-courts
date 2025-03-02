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
    "courtId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "current_players", "end", "id", "is_bookable", "max_players", "max_skill", "min_skill", "notes", "start", "title", "type", "updatedAt", "userId") SELECT "createdAt", "current_players", "end", "id", "is_bookable", "max_players", "max_skill", "min_skill", "notes", "start", "title", "type", "updatedAt", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
