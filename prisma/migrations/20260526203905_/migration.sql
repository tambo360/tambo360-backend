/*
  Warnings:

  - The values [Natural,Tecnica,Administrativa,Danio] on the enum `TipoMerma` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoMerma_new" AS ENUM ('MASTITIS', 'ESTRES_CALORICO', 'DERRAME_EN_ORDENE', 'FALLA_EQUIPO', 'RECHAZO_ANTIBIOTICOS', 'ACIDOSIS_RUMINAL', 'PERDIDA_EN_TRANSPORTE', 'VENCIMIENTO_PRODUCTO', 'DANO_POR_MANIPULACION', 'DISCREPANCIA_INVENTARIO', 'MERMA_DESCONOCIDA', 'OTRO');
ALTER TABLE "Merma" ALTER COLUMN "tipo" TYPE "TipoMerma_new" USING ("tipo"::text::"TipoMerma_new");
ALTER TYPE "TipoMerma" RENAME TO "TipoMerma_old";
ALTER TYPE "TipoMerma_new" RENAME TO "TipoMerma";
DROP TYPE "TipoMerma_old";
COMMIT;
