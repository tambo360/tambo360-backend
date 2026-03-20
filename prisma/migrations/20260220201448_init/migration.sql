-- CreateEnum
CREATE TYPE "Unidad" AS ENUM ('kg', 'litros');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('USD', 'EUR', 'ARS');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('quesos', 'leches');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('verificacion', 'recuperacion');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Establecimiento" (
    "idEstablecimiento" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuario" TEXT NOT NULL,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("idEstablecimiento")
);

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "LoteProduccion" (
    "idLote" TEXT NOT NULL,
    "fechaProduccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idProducto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad" "Unidad" NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "observaciones" VARCHAR(255),

    CONSTRAINT "LoteProduccion_pkey" PRIMARY KEY ("idLote")
);

-- CreateTable
CREATE TABLE "Merma" (
    "idMerma" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad" "Unidad" NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idLote" TEXT NOT NULL,

    CONSTRAINT "Merma_pkey" PRIMARY KEY ("idMerma")
);

-- CreateTable
CREATE TABLE "CostosDirecto" (
    "idCostoDirecto" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" "Moneda" NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "VerificarToken_idUsuario_tipo_idx" ON "VerificarToken"("idUsuario", "tipo");

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

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
