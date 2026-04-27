-- CreateEnum
CREATE TYPE "TipoOrdenie" AS ENUM ('balde', 'linea', 'espina_de_pescado', 'rotativo', 'manual', 'otro');

-- CreateEnum
CREATE TYPE "VentaLeche" AS ENUM ('usina', 'fabrica_propia', 'cooperativa', 'varios');

-- CreateTable
CREATE TABLE "configuracion" (
    "idConfiguracion" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "cantVacas" INTEGER NOT NULL,
    "cantOrdenies" INTEGER NOT NULL,
    "promLitros" DOUBLE PRECISION NOT NULL,
    "tipoOrdenie" "TipoOrdenie" NOT NULL,
    "ventaLeche" "VentaLeche" NOT NULL,
    "empleados" BOOLEAN NOT NULL,
    "cantEmpleados" INTEGER,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("idConfiguracion")
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

-- AddForeignKey
ALTER TABLE "configuracion" ADD CONSTRAINT "configuracion_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoRaza" ADD CONSTRAINT "EstablecimientoRaza_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablecimientoRaza" ADD CONSTRAINT "EstablecimientoRaza_idRaza_fkey" FOREIGN KEY ("idRaza") REFERENCES "Raza"("idRaza") ON DELETE RESTRICT ON UPDATE CASCADE;
