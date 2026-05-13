/*
  Warnings:

  - A unique constraint covering the columns `[nombreNormalizado,idOrganizacion]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombreNormalizado` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "esSistema" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "idOrganizacion" TEXT,
ADD COLUMN     "nombreNormalizado" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombreNormalizado_idOrganizacion_key" ON "Producto"("nombreNormalizado", "idOrganizacion");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;
