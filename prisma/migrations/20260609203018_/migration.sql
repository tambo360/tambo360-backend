/*
  Warnings:

  - You are about to drop the column `cantRazas` on the `LoteProduccion` table. All the data in the column will be lost.
  - You are about to drop the column `idRaza` on the `LoteProduccion` table. All the data in the column will be lost.
  - You are about to drop the `EstablecimientoRaza` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Raza` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idRodeo` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoRodeo" AS ENUM ('ALTA_PRODUCCION', 'BAJA_PRODUCCION', 'VACAS_SECAS');

-- DropForeignKey
ALTER TABLE "EstablecimientoRaza" DROP CONSTRAINT "EstablecimientoRaza_idEstablecimiento_fkey";

-- DropForeignKey
ALTER TABLE "EstablecimientoRaza" DROP CONSTRAINT "EstablecimientoRaza_idRaza_fkey";

-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idRaza_fkey";

-- DropForeignKey
ALTER TABLE "Raza" DROP CONSTRAINT "Raza_idOrganizacion_fkey";

-- AlterTable
ALTER TABLE "LoteProduccion" DROP COLUMN "cantRazas",
DROP COLUMN "idRaza",
ADD COLUMN     "idRodeo" TEXT NOT NULL;

-- DropTable
DROP TABLE "EstablecimientoRaza";

-- DropTable
DROP TABLE "Raza";

-- CreateTable
CREATE TABLE "Rodeo" (
    "idRodeo" TEXT NOT NULL,
    "idConfiguracion" TEXT NOT NULL,
    "tipoRodeo" "TipoRodeo" NOT NULL,
    "cantVacas" INTEGER NOT NULL,
    "costoRacion" DECIMAL(13,2) NOT NULL,

    CONSTRAINT "Rodeo_pkey" PRIMARY KEY ("idRodeo")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rodeo_idConfiguracion_tipoRodeo_key" ON "Rodeo"("idConfiguracion", "tipoRodeo");

-- AddForeignKey
ALTER TABLE "Rodeo" ADD CONSTRAINT "Rodeo_idConfiguracion_fkey" FOREIGN KEY ("idConfiguracion") REFERENCES "configuracion"("idConfiguracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE RESTRICT ON UPDATE CASCADE;
