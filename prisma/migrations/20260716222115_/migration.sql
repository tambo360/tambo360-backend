-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_idRodeo_fkey";

-- AlterTable
ALTER TABLE "Animal" ALTER COLUMN "idRodeo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE SET NULL ON UPDATE CASCADE;
