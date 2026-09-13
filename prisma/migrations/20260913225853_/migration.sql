/*
  Warnings:

  - You are about to drop the column `idRodeo` on the `LoteProduccion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idRodeo_fkey";

-- AlterTable
ALTER TABLE "LoteProduccion" DROP COLUMN "idRodeo",
ADD COLUMN     "rodeoIdRodeo" TEXT;

-- CreateTable
CREATE TABLE "ProduccionRodeo" (
    "idProduccionRodeo" TEXT NOT NULL,
    "idRodeo" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "raza" "Razas" NOT NULL,
    "cantVacas" INTEGER NOT NULL,

    CONSTRAINT "ProduccionRodeo_pkey" PRIMARY KEY ("idProduccionRodeo")
);

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_rodeoIdRodeo_fkey" FOREIGN KEY ("rodeoIdRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE SET NULL ON UPDATE CASCADE;
