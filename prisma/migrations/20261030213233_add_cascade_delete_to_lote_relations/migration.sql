-- DropForeignKey
ALTER TABLE "ProduccionAnimal" DROP CONSTRAINT "ProduccionAnimal_idLote_fkey";

-- DropForeignKey
ALTER TABLE "ProduccionRodeo" DROP CONSTRAINT "ProduccionRodeo_idLote_fkey";

-- AddForeignKey
ALTER TABLE "ProduccionAnimal" ADD CONSTRAINT "ProduccionAnimal_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE CASCADE ON UPDATE CASCADE;
