/*
  Warnings:

  - You are about to drop the column `raza` on the `ProduccionRodeo` table. All the data in the column will be lost.
  - Added the required column `idRaza` to the `ProduccionRodeo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `razaNombre` to the `ProduccionRodeo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProduccionRodeo" DROP COLUMN "raza",
ADD COLUMN     "idRaza" TEXT NOT NULL,
ADD COLUMN     "razaNombre" "Razas" NOT NULL;

-- AddForeignKey
ALTER TABLE "ProduccionRodeo" ADD CONSTRAINT "ProduccionRodeo_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "Raza"("idRaza") ON DELETE RESTRICT ON UPDATE CASCADE;
