/*
  Warnings:

  - The values [UNICO] on the enum `TipoRodeo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoRodeo_new" AS ENUM ('ALTA_PRODUCCION', 'BAJA_PRODUCCION', 'VACAS_SECAS', 'UNICO_ORDENIE', 'UNICO_SECA');
ALTER TABLE "Rodeo" ALTER COLUMN "tipoRodeo" TYPE "TipoRodeo_new" USING ("tipoRodeo"::text::"TipoRodeo_new");
ALTER TYPE "TipoRodeo" RENAME TO "TipoRodeo_old";
ALTER TYPE "TipoRodeo_new" RENAME TO "TipoRodeo";
DROP TYPE "TipoRodeo_old";
COMMIT;
