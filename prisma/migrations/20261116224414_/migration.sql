/*
  Warnings:

  - A unique constraint covering the columns `[mes,anio]` on the table `PrecioMercado` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PrecioMercado_mes_anio_key" ON "PrecioMercado"("mes", "anio");
