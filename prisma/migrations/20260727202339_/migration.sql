-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idRodeo_fkey";

-- AlterTable
ALTER TABLE "LoteProduccion" ALTER COLUMN "idRodeo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE SET NULL ON UPDATE CASCADE;
