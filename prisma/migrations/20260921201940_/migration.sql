/*
  Warnings:

  - A unique constraint covering the columns `[idRodeo,nombre]` on the table `Raza` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Raza_idRodeo_nombre_key" ON "Raza"("idRodeo", "nombre");
