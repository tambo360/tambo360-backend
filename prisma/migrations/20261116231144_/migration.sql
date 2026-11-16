/*
  Warnings:

  - The values [MANO_OBRA] on the enum `CategoriaCostoResumen` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CategoriaCostoResumen_new" AS ENUM ('ALIMENTACION', 'SANIDAD', 'PERSONAL', 'ENERGIA', 'MANTENIMIENTO', 'LOGISTICA', 'SERVICIOS', 'VETERINARIO', 'INMUEBLE', 'OTRO');
ALTER TABLE "ResumenMensualCostoCategoria" ALTER COLUMN "categoria" TYPE "CategoriaCostoResumen_new" USING ("categoria"::text::"CategoriaCostoResumen_new");
ALTER TYPE "CategoriaCostoResumen" RENAME TO "CategoriaCostoResumen_old";
ALTER TYPE "CategoriaCostoResumen_new" RENAME TO "CategoriaCostoResumen";
DROP TYPE "CategoriaCostoResumen_old";
COMMIT;
