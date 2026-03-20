/*
  Warnings:

  - You are about to drop the column `descripcion` on the `Merma` table. All the data in the column will be lost.
  - You are about to drop the column `unidad` on the `Merma` table. All the data in the column will be lost.
  - Added the required column `tipo` to the `Merma` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMerma" AS ENUM ('Natural', 'Tecnica', 'Administrativa', 'Danio');

-- AlterTable
ALTER TABLE "Merma" DROP COLUMN "descripcion",
DROP COLUMN "unidad",
ADD COLUMN     "observacion" TEXT,
ADD COLUMN     "tipo" "TipoMerma" NOT NULL;
