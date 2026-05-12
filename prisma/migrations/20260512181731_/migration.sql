/*
  Warnings:

  - A unique constraint covering the columns `[idEstablecimiento,numeroLote]` on the table `LoteProduccion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cantRazas` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idRaza` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idProducto_fkey";

-- AlterTable
ALTER TABLE "LoteProduccion" ADD COLUMN     "cantRazas" INTEGER NOT NULL,
ADD COLUMN     "idRaza" TEXT NOT NULL,
ALTER COLUMN "numeroLote" DROP DEFAULT;
DROP SEQUENCE "LoteProduccion_numeroLote_seq";

-- CreateTable
CREATE TABLE "EstablecimientoProducto" (
    "id" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,

    CONSTRAINT "EstablecimientoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstablecimientoProducto_idEstablecimiento_idProducto_key" ON "EstablecimientoProducto"("idEstablecimiento", "idProducto");

-- CreateIndex
CREATE UNIQUE INDEX "LoteProduccion_idEstablecimiento_numeroLote_key" ON "LoteProduccion"("idEstablecimiento", "numeroLote");

-- AddForeignKey
ALTER TABLE "EstablecimientoProducto" ADD CONSTRAINT "EstablecimientoProducto_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoProducto" ADD CONSTRAINT "EstablecimientoProducto_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "EstablecimientoRaza"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "EstablecimientoProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
