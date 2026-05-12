/*
  Warnings:

  - The primary key for the `EstablecimientoRaza` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idEstablecimientoRaza` on the `EstablecimientoRaza` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idEstablecimiento,idRaza]` on the table `EstablecimientoRaza` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombreNormalizado,idOrganizacion]` on the table `Raza` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `EstablecimientoRaza` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `nombreNormalizado` to the `Raza` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EstablecimientoRaza" DROP CONSTRAINT "EstablecimientoRaza_pkey",
DROP COLUMN "idEstablecimientoRaza",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "EstablecimientoRaza_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Raza" ADD COLUMN     "esSistema" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "idOrganizacion" TEXT,
ADD COLUMN     "nombreNormalizado" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EstablecimientoRaza_idEstablecimiento_idRaza_key" ON "EstablecimientoRaza"("idEstablecimiento", "idRaza");

-- CreateIndex
CREATE UNIQUE INDEX "Raza_nombreNormalizado_idOrganizacion_key" ON "Raza"("nombreNormalizado", "idOrganizacion");

-- AddForeignKey
ALTER TABLE "Raza" ADD CONSTRAINT "Raza_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;
