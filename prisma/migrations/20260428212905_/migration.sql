/*
  Warnings:

  - Added the required column `tipo` to the `Invitacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoInvitacion" AS ENUM ('ORGANIZACION', 'ESTABLECIMIENTO');

-- AlterTable
ALTER TABLE "Invitacion" ADD COLUMN     "tipo" "TipoInvitacion" NOT NULL;
