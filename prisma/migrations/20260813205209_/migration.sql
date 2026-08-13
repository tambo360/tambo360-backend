/*
  Warnings:

  - The values [MATITIS] on the enum `EstadoAnimal` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoAnimal_new" AS ENUM ('MASTITIS', 'TRATAMIENTO', 'PREPARTO', 'DESCARTE');
ALTER TABLE "Animal" ALTER COLUMN "estado" TYPE "EstadoAnimal_new" USING ("estado"::text::"EstadoAnimal_new");
ALTER TABLE "ProduccionAnimal" ALTER COLUMN "estado" TYPE "EstadoAnimal_new" USING ("estado"::text::"EstadoAnimal_new");
ALTER TYPE "EstadoAnimal" RENAME TO "EstadoAnimal_old";
ALTER TYPE "EstadoAnimal_new" RENAME TO "EstadoAnimal";
DROP TYPE "EstadoAnimal_old";
COMMIT;
