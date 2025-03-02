-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "skill_level" TEXT NOT NULL DEFAULT 'BEGINNER_2_0',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "ownerId" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "address" TEXT
);
INSERT INTO "new_User" ("address", "bio", "email", "emailVerified", "id", "image", "name", "ownerId", "password", "phone", "role", "skill_level", "username") SELECT "address", "bio", "email", "emailVerified", "id", "image", "name", "ownerId", "password", "phone", "role", "skill_level", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
