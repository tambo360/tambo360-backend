/*
  Warnings:

  - Changed the type of `concepto` on the `CostosDirecto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConceptoCosto" AS ENUM ('insumos_basicos', 'leche_cruda', 'cuajo_y_fermentos', 'refrigeracion');

-- AlterTable
ALTER TABLE "CostosDirecto" DROP COLUMN "concepto",
ADD COLUMN     "concepto" "ConceptoCosto" NOT NULL,
ALTER COLUMN "monto" SET DATA TYPE DECIMAL(13,2);
