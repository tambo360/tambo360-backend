/*
  Warnings:

  - A unique constraint covering the columns `[idEstablecimiento]` on the table `configuracion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "configuracion_idEstablecimiento_key" ON "configuracion"("idEstablecimiento");
