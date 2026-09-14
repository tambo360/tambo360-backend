/*
  Warnings:

  - The values [usina,fabrica_propia,cooperativa,varios] on the enum `VentaLeche` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `cantBajadas` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EstadoSanitarioAnimal" ADD VALUE 'PREPARTO';

-- AlterEnum
BEGIN;
CREATE TYPE "VentaLeche_new" AS ENUM ('USINA', 'COOPERTIVA', 'ELABORACION_PROPIA', 'VENTA_DIRECTA_MERCADO_LOCAL');
ALTER TABLE "configuracion" ALTER COLUMN "ventaLeche" TYPE "VentaLeche_new" USING ("ventaLeche"::text::"VentaLeche_new");
ALTER TYPE "VentaLeche" RENAME TO "VentaLeche_old";
ALTER TYPE "VentaLeche_new" RENAME TO "VentaLeche";
DROP TYPE "VentaLeche_old";
COMMIT;

-- AlterTable
ALTER TABLE "LoteProduccion" ADD COLUMN     "cantBajadas" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "configuracion" ADD COLUMN     "precioLitro" DECIMAL(13,2);
