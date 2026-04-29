/*
  Warnings:

  - A unique constraint covering the columns `[idEstablecimiento,idOrganizacionUsuario]` on the table `Establecimiento_OrganizacionUsuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_OrganizacionUsuario_idEstablecimiento_idOrg_key" ON "Establecimiento_OrganizacionUsuario"("idEstablecimiento", "idOrganizacionUsuario");
