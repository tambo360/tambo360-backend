-- CreateEnum
CREATE TYPE "Unidad" AS ENUM ('kg', 'litros');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('USD', 'EUR', 'ARS');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('quesos', 'leches');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('verificacion', 'recuperacion');

-- CreateEnum
CREATE TYPE "TipoMerma" AS ENUM ('Natural', 'Tecnica', 'Administrativa', 'Danio');

-- CreateEnum
CREATE TYPE "ConceptoCosto" AS ENUM ('insumos_basicos', 'leche_cruda', 'cuajo_y_fermentos', 'refrigeracion');

-- CreateEnum
CREATE TYPE "RolOrganizacion" AS ENUM ('ORG_OWNER', 'ORG_ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "RolEstablecimiento" AS ENUM ('OWNER', 'ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EstadoInvitacion" AS ENUM ('pendiente', 'aceptada', 'rechazada');

-- CreateEnum
CREATE TYPE "TipoOrdenie" AS ENUM ('balde', 'linea', 'espina_de_pescado', 'rotativo', 'manual', 'otro');

-- CreateEnum
CREATE TYPE "VentaLeche" AS ENUM ('usina', 'fabrica_propia', 'cooperativa', 'varios');

-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('bajo', 'medio', 'alto');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

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
CREATE TABLE "Establecimiento" (
    "idEstablecimiento" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "localidad" TEXT,
    "provincia" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idOrganizacion" TEXT NOT NULL,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("idEstablecimiento")
);

-- CreateTable
CREATE TABLE "Establecimiento_OrganizacionUsuario" (
    "idEstablecimientoOrganizacionUsuario" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idOrganizacionUsuario" TEXT NOT NULL,
    "rol" "RolEstablecimiento" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Establecimiento_OrganizacionUsuario_pkey" PRIMARY KEY ("idEstablecimientoOrganizacionUsuario")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "idConfiguracion" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "cantVacas" INTEGER,
    "cantOrdenies" INTEGER,
    "promLitros" DOUBLE PRECISION,
    "tipoOrdenie" "TipoOrdenie",
    "ventaLeche" "VentaLeche",
    "empleados" BOOLEAN,
    "cantEmpleados" INTEGER,
    "modificadoEn" TIMESTAMP(3),

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("idConfiguracion")
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

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "Raza" (
    "idRaza" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Raza_pkey" PRIMARY KEY ("idRaza")
);

-- CreateTable
CREATE TABLE "EstablecimientoRaza" (
    "idEstablecimientoRaza" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idRaza" TEXT NOT NULL,

    CONSTRAINT "EstablecimientoRaza_pkey" PRIMARY KEY ("idEstablecimientoRaza")
);

-- CreateTable
CREATE TABLE "LoteProduccion" (
    "idLote" TEXT NOT NULL,
    "numeroLote" SERIAL NOT NULL,
    "fechaProduccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idProducto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad" "Unidad" NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoteProduccion_pkey" PRIMARY KEY ("idLote")
);

-- CreateTable
CREATE TABLE "Merma" (
    "idMerma" TEXT NOT NULL,
    "tipo" "TipoMerma" NOT NULL,
    "observacion" TEXT,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idLote" TEXT NOT NULL,

    CONSTRAINT "Merma_pkey" PRIMARY KEY ("idMerma")
);

-- CreateTable
CREATE TABLE "CostosDirecto" (
    "idCostoDirecto" TEXT NOT NULL,
    "concepto" "ConceptoCosto" NOT NULL,
    "monto" DECIMAL(13,2) NOT NULL,
    "observaciones" TEXT DEFAULT '',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idLote" TEXT NOT NULL,

    CONSTRAINT "CostosDirecto_pkey" PRIMARY KEY ("idCostoDirecto")
);

-- CreateTable
CREATE TABLE "VerificarToken" (
    "tokenid" TEXT NOT NULL,
    "idUsuario" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificarToken_pkey" PRIMARY KEY ("tokenid")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "nivel" "NivelAlerta" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromedioCategoria" (
    "id" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "produccionAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mermaAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pctMermaPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cantidadLotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PromedioCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "VerificarToken_idUsuario_tipo_idx" ON "VerificarToken"("idUsuario", "tipo");

-- CreateIndex
CREATE INDEX "Alerta_idEstablecimiento_creadoEn_idx" ON "Alerta"("idEstablecimiento", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "PromedioCategoria_idEstablecimiento_categoria_key" ON "PromedioCategoria"("idEstablecimiento", "categoria");

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizacionUsuario" ADD CONSTRAINT "OrganizacionUsuario_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganizacionUsuario" ADD CONSTRAINT "Establecimiento_OrganizacionUsuario_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento_OrganizacionUsuario" ADD CONSTRAINT "Establecimiento_OrganizacionUsuario_idOrganizacionUsuario_fkey" FOREIGN KEY ("idOrganizacionUsuario") REFERENCES "OrganizacionUsuario"("idOrganizacionUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion" ADD CONSTRAINT "configuracion_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_idInvitador_fkey" FOREIGN KEY ("idInvitador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoRaza" ADD CONSTRAINT "EstablecimientoRaza_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoRaza" ADD CONSTRAINT "EstablecimientoRaza_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "Raza"("idRaza") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProduccion" ADD CONSTRAINT "LoteProduccion_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merma" ADD CONSTRAINT "Merma_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostosDirecto" ADD CONSTRAINT "CostosDirecto_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificarToken" ADD CONSTRAINT "VerificarToken_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
