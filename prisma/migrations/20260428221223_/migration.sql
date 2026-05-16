/*
  Warnings:

  - You are about to drop the column `rol` on the `Invitacion` table. All the data in the column will be lost.
  - Added the required column `rolOrg` to the `Invitacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invitacion" DROP COLUMN "rol",
ADD COLUMN     "rolEst" "RolEstablecimiento",
ADD COLUMN     "rolOrg" "RolOrganizacion" NOT NULL;
