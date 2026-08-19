/*
  Warnings:

  - Added the required column `destino` to the `ProduccionAnimal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `ProduccionAnimal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProduccionAnimal" ADD COLUMN     "destino" "DestinoProduccion" NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoSanitarioAnimal" NOT NULL;
