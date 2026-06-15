/*
  Warnings:

  - Added the required column `destino` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tempTanque` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDestino" AS ENUM ('TANQUE_FRIO', 'VENTA', 'FABRICA_QUESOS');

-- AlterTable
ALTER TABLE "LoteProduccion" ADD COLUMN     "destino" "TipoDestino" NOT NULL,
ADD COLUMN     "tempTanque" DECIMAL(13,2) NOT NULL;
