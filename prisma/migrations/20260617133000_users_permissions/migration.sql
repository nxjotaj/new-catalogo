-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REPRESENTANTE', 'CLIENTE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Produto"
ADD COLUMN "preco" DECIMAL(12,2),
ADD COLUMN "estoque" INTEGER,
ADD COLUMN "condicaoComercial" TEXT,
ADD COLUMN "prazoEntrega" TEXT,
ADD COLUMN "fichaTecnica" TEXT,
ADD COLUMN "manualPdf" TEXT,
ADD COLUMN "observacaoComercial" TEXT,
ADD COLUMN "margem" DECIMAL(8,2);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFieldPermission" (
    "id" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "visibleToVisitor" BOOLEAN NOT NULL DEFAULT false,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "visibleToRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "visibleToAdmin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFieldPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFieldPermission_fieldKey_key" ON "ProductFieldPermission"("fieldKey");
