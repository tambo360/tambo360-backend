-- CreateEnum
CREATE TYPE "TipoCostoGeneral" AS ENUM ('PERSONAL', 'SERVICIOS', 'LOGISTICA', 'MANTENIMIENTO', 'VETERINARIO', 'INMUEBLE', 'OTRO');

-- CreateTable
CREATE TABLE "CostoGeneral" (
    "idCostoGeneral" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "tipoCosto" "TipoCostoGeneral" NOT NULL,
    "descripcion" TEXT DEFAULT '',
    "monto" DECIMAL(13,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostoGeneral_pkey" PRIMARY KEY ("idCostoGeneral")
);

-- AddForeignKey
ALTER TABLE "CostoGeneral" ADD CONSTRAINT "CostoGeneral_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;
