-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FRONT_DESK', 'NIGHT_AUDIT', 'HOUSEKEEPING_SUPERVISOR', 'GENERAL_MANAGER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
