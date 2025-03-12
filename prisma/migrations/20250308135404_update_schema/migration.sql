-- CreateTable
CREATE TABLE "PlayerListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeSlot" TEXT NOT NULL,
    "minSkill" TEXT,
    "maxSkill" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PlayerListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerResponse_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PlayerListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
