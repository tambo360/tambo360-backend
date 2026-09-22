/*
  Warnings:

  - The values [TRATAMIENTO] on the enum `EstadoSanitarioAnimal` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoSanitarioAnimal_new" AS ENUM ('MASTITIS', 'PREPARTO', 'SANO', 'PROBLEMA_PODAL', 'PROBLEMA_UTERINO', 'ENFERMEDAD_GENERAL');
ALTER TABLE "Animal" ALTER COLUMN "estado" TYPE "EstadoSanitarioAnimal_new" USING ("estado"::text::"EstadoSanitarioAnimal_new");
ALTER TABLE "ProduccionAnimal" ALTER COLUMN "estado" TYPE "EstadoSanitarioAnimal_new" USING ("estado"::text::"EstadoSanitarioAnimal_new");
ALTER TYPE "EstadoSanitarioAnimal" RENAME TO "EstadoSanitarioAnimal_old";
ALTER TYPE "EstadoSanitarioAnimal_new" RENAME TO "EstadoSanitarioAnimal";
DROP TYPE "EstadoSanitarioAnimal_old";
COMMIT;
