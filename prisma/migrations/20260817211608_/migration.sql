/*
  Warnings:

  - You are about to drop the `MovimientoRodeo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoMovimientoAnimal" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "MotivoMovimientoAnimal" AS ENUM ('INGRESO_COMPRA', 'INGRESO_NACIMIENTO', 'EGRESO_VENTA', 'EGRESO_DESCARTE', 'EGRESO_MUERTE', 'TRANSFERENCIA_BAJA_PRODUCCION', 'TRANSFERENCIA_ALTA_PRODUCCION', 'TRANSFERENCIA_SECADO', 'TRANSFERENCIA_CAMBIO_ESTADO', 'TRANSFERENCIA_OTRO');

-- DropForeignKey
ALTER TABLE "MovimientoRodeo" DROP CONSTRAINT "MovimientoRodeo_idConfiguracion_fkey";

-- DropTable
DROP TABLE "MovimientoRodeo";

-- DropEnum
DROP TYPE "MotivoMovimientoRodeo";

-- DropEnum
DROP TYPE "TipoMovimientoRodeo";

-- CreateTable
CREATE TABLE "MovimientoAnimal" (
    "idMovimiento" TEXT NOT NULL,
    "idConfiguracion" TEXT NOT NULL,
    "tipo" "TipoMovimientoAnimal" NOT NULL,
    "motivo" "MotivoMovimientoAnimal" NOT NULL,
    "rodeoOrigen" TEXT,
    "rodeoDestino" TEXT,
    "cantidad" INTEGER NOT NULL,
    "usuarioId" TEXT,
    "observacion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoAnimal_pkey" PRIMARY KEY ("idMovimiento")
);

-- CreateTable
CREATE TABLE "MovimientoAnimalDetalle" (
    "idMovimientoDetalle" TEXT NOT NULL,
    "idMovimiento" TEXT NOT NULL,
    "idAnimal" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoAnimalDetalle_pkey" PRIMARY KEY ("idMovimientoDetalle")
);

-- AddForeignKey
ALTER TABLE "MovimientoAnimal" ADD CONSTRAINT "MovimientoAnimal_idConfiguracion_fkey" FOREIGN KEY ("idConfiguracion") REFERENCES "configuracion"("idConfiguracion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimalDetalle" ADD CONSTRAINT "MovimientoAnimalDetalle_idMovimiento_fkey" FOREIGN KEY ("idMovimiento") REFERENCES "MovimientoAnimal"("idMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoAnimalDetalle" ADD CONSTRAINT "MovimientoAnimalDetalle_idAnimal_fkey" FOREIGN KEY ("idAnimal") REFERENCES "Animal"("idAnimal") ON DELETE RESTRICT ON UPDATE CASCADE;
