-- CreateEnum
CREATE TYPE "CausaMovimientoAnimal" AS ENUM ('MASTITIS', 'PROBLEMA_PODAL', 'PROBLEMA_UTERINO', 'ENFERMEDAD_GENERAL', 'SECADA_PROGRAMADA', 'PARTO', 'ABORTO', 'ALTA_MEDICA');

-- AlterTable
ALTER TABLE "MovimientoAnimal" ADD COLUMN     "causa" "CausaMovimientoAnimal";
