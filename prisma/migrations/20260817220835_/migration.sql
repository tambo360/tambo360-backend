-- CreateEnum
CREATE TYPE "GeneroAnimal" AS ENUM ('HEMBRA', 'MACHO');

-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "genero" "GeneroAnimal" NOT NULL DEFAULT 'HEMBRA';
