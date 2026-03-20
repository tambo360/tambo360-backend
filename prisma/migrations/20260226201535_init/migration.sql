/*
  Warnings:

  - Added the required column `estado` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoteProduccion" ADD COLUMN     "estado" BOOLEAN NOT NULL;
