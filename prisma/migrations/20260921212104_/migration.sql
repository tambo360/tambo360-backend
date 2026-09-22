/*
  Warnings:

  - The values [TRANSFERENCIA_BAJA_PRODUCCION,TRANSFERENCIA_ALTA_PRODUCCION,TRANSFERENCIA_SECADO,TRANSFERENCIA_CAMBIO_ESTADO,TRANSFERENCIA_OTRO] on the enum `MotivoMovimientoAnimal` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MotivoMovimientoAnimal_new" AS ENUM ('INGRESO_COMPRA', 'INGRESO_NACIMIENTO', 'EGRESO_VENTA', 'EGRESO_DESCARTE', 'EGRESO_MUERTE', 'TRANSFERENCIA_SANITARIA', 'TRANSFERENCIA_CICLO_PRODUCTIVO', 'TRANSFERENCIA_RECUPERACION');
ALTER TABLE "MovimientoAnimal" ALTER COLUMN "motivo" TYPE "MotivoMovimientoAnimal_new" USING ("motivo"::text::"MotivoMovimientoAnimal_new");
ALTER TYPE "MotivoMovimientoAnimal" RENAME TO "MotivoMovimientoAnimal_old";
ALTER TYPE "MotivoMovimientoAnimal_new" RENAME TO "MotivoMovimientoAnimal";
DROP TYPE "MotivoMovimientoAnimal_old";
COMMIT;
