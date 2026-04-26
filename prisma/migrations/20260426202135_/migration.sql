/*
  Warnings:

  - You are about to drop the column `idUsuario` on the `Establecimiento` table. All the data in the column will be lost.
  - Added the required column `idOrganizacion` to the `Establecimiento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RolOrganizacion" AS ENUM ('cooperativa', 'duenio', 'administrador', 'empleado');

-- CreateEnum
CREATE TYPE "RolEstablecimiento" AS ENUM ('duenio', 'administrador', 'empleado');

-- CreateEnum
CREATE TYPE "EstadoInvitacion" AS ENUM ('pendiente', 'aceptada', 'rechazada');

-- DropForeignKey
ALTER TABLE "Establecimiento" DROP CONSTRAINT "Establecimiento_idUsuario_fkey";

-- AlterTable
ALTER TABLE "Establecimiento" DROP COLUMN "idUsuario",
ADD COLUMN     "idOrganizacion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Organizacion" (
    "idOrganizacion" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("idOrganizacion")
);

-- CreateTable
CREATE TABLE "OrganizacionUsuario" (
    "idOrganizacionUsuario" TEXT NOT NULL,
    "idOrganizacion" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizacionUsuario_pkey" PRIMARY KEY ("idOrganizacionUsuario")
);

-- CreateTable
CREATE TABLE "Establecimiento_OrganiacionUsuario" (
    "idEstablecimientoOrganizacionUsuario" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idOrganizacionUsuario" TEXT NOT NULL,
    "rol" "RolEstablecimiento" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Establecimiento_OrganiacionUsuario_pkey" PRIMARY KEY ("idEstablecimientoOrganizacionUsuario")
);

-- CreateTable
CREATE TABLE "Invitacion" (
    "idInvitacion" TEXT NOT NULL,
    "idOrganizacion" TEXT NOT NULL,
    "idInvitador" TEXT NOT NULL,
    "idEstablecimiento" TEXT,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'pendiente',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitacion_pkey" PRIMARY KEY ("idInvitacion")
);

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganiacionUsuario" ADD CONSTRAINT "Establecimiento_OrganiacionUsuario_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganiacionUsuario" ADD CONSTRAINT "Establecimiento_OrganiacionUsuario_idOrganizacionUsuario_fkey" FOREIGN KEY ("idOrganizacionUsuario") REFERENCES "OrganizacionUsuario"("idOrganizacionUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
