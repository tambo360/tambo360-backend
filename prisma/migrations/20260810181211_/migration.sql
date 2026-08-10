-- CreateEnum
CREATE TYPE "TipoMovimientoRodeo" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "MotivoMovimientoRodeo" AS ENUM ('INGRESO_COMPRA', 'INGRESO_NACIMIENTO', 'EGRESO_VENTA', 'EGRESO_DESCARTE', 'EGRESO_MUERTE', 'TRANSFERENCIA_BAJA_PRODUCCION', 'TRANSFERENCIA_ALTA_PRODUCCION', 'TRANSFERENCIA_SECADO', 'TRANSFERENCIA_CAMBIO_ESTADO', 'TRANSFERENCIA_OTRO');

-- CreateTable
CREATE TABLE "MovimientoRodeo" (
    "idMovRodeo" TEXT NOT NULL,
    "idConfiguracion" TEXT NOT NULL,
    "tipo" "TipoMovimientoRodeo" NOT NULL,
    "motivo" "MotivoMovimientoRodeo" NOT NULL,
    "rodeoOrigen" TEXT,
    "rodeoDestino" TEXT,
    "cantidad" INTEGER NOT NULL,
    "usuarioId" TEXT,
    "observacion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoRodeo_pkey" PRIMARY KEY ("idMovRodeo")
);

-- AddForeignKey
ALTER TABLE "MovimientoRodeo" ADD CONSTRAINT "MovimientoRodeo_idConfiguracion_fkey" FOREIGN KEY ("idConfiguracion") REFERENCES "configuracion"("idConfiguracion") ON DELETE RESTRICT ON UPDATE CASCADE;
