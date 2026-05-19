/*
  Warnings:

  - You are about to drop the column `concepto` on the `CostosDirecto` table. All the data in the column will be lost.
  - Added the required column `tipoCosto` to the `CostosDirecto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoCosto" AS ENUM ('ALIMENTACION', 'SANIDAD', 'MANO_OBRA', 'ENERGIA', 'MANTENIMIENTO', 'LOGISTICA', 'OTRO');

-- AlterTable
ALTER TABLE "CostosDirecto" DROP COLUMN "concepto",
ADD COLUMN     "moneda" "Moneda" NOT NULL DEFAULT 'ARS',
ADD COLUMN     "tipoCosto" "TipoCosto" NOT NULL;

-- DropEnum
DROP TYPE "ConceptoCosto";

-- CreateIndex
CREATE INDEX "CostosDirecto_idLote_idx" ON "CostosDirecto"("idLote");
