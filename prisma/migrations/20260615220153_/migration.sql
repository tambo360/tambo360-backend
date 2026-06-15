/*
  Warnings:

  - Added the required column `cantAnimales` to the `LoteProduccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoteProduccion" ADD COLUMN     "cantAnimales" INTEGER NOT NULL;
