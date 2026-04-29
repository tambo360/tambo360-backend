/*
  Warnings:

  - A unique constraint covering the columns `[idOrganizacion,idUsuario]` on the table `OrganizacionUsuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizacionUsuario_idOrganizacion_idUsuario_key" ON "OrganizacionUsuario"("idOrganizacion", "idUsuario");
