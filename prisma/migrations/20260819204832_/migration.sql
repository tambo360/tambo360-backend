/*
  Warnings:

  - The values [PREPARTO] on the enum `CategoriaAnimal` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `estado` on the `Animal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `estado` on the `ProduccionAnimal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoSanitarioAnimal" AS ENUM ('MASTITIS', 'TRATAMIENTO', 'NORMAL');

-- CreateEnum
CREATE TYPE "DestinoProduccion" AS ENUM ('TANQUE', 'DESCARTE');

-- AlterEnum
BEGIN;
CREATE TYPE "CategoriaAnimal_new" AS ENUM ('ORDENE', 'SECAS');
ALTER TABLE "Animal" ALTER COLUMN "categoria" TYPE "CategoriaAnimal_new" USING ("categoria"::text::"CategoriaAnimal_new");
ALTER TYPE "CategoriaAnimal" RENAME TO "CategoriaAnimal_old";
ALTER TYPE "CategoriaAnimal_new" RENAME TO "CategoriaAnimal";
DROP TYPE "CategoriaAnimal_old";
COMMIT;

-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "observacion" TEXT,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoSanitarioAnimal" NOT NULL;

-- AlterTable
ALTER TABLE "ProduccionAnimal" DROP COLUMN "estado",
ADD COLUMN     "estado" "DestinoProduccion" NOT NULL;

-- DropEnum
DROP TYPE "EstadoAnimal";
