/*
  Warnings:

  - A unique constraint covering the columns `[idEstablecimiento,codigo]` on the table `Animal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Animal_idEstablecimiento_codigo_key" ON "Animal"("idEstablecimiento", "codigo");
