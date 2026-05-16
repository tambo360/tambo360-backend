/*
  Warnings:

  - You are about to drop the `Invitacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invitacion" DROP CONSTRAINT "Invitacion_idInvitador_fkey";

-- DropForeignKey
ALTER TABLE "Invitacion" DROP CONSTRAINT "Invitacion_idOrganizacion_fkey";

-- DropTable
DROP TABLE "Invitacion";

-- CreateTable
CREATE TABLE "InvitacionOrganizacion" (
    "idInvitacion" TEXT NOT NULL,
    "idOrganizacion" TEXT NOT NULL,
    "idInvitador" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'pendiente',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitacionOrganizacion_pkey" PRIMARY KEY ("idInvitacion")
);

-- CreateTable
CREATE TABLE "InvitacionEstablecimiento" (
    "idInvitacion" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idInvitador" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'pendiente',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "rol" "RolEstablecimiento" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitacionEstablecimiento_pkey" PRIMARY KEY ("idInvitacion")
);

-- AddForeignKey
ALTER TABLE "InvitacionOrganizacion" ADD CONSTRAINT "InvitacionOrganizacion_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionOrganizacion" ADD CONSTRAINT "InvitacionOrganizacion_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionEstablecimiento" ADD CONSTRAINT "InvitacionEstablecimiento_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitacionEstablecimiento" ADD CONSTRAINT "InvitacionEstablecimiento_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
