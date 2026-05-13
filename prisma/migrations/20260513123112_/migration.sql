-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idProducto_fkey";

-- DropForeignKey
ALTER TABLE "LoteProduccion" DROP CONSTRAINT "LoteProduccion_idRaza_fkey";

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "Raza"("idRaza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;
