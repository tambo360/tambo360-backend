-- CreateEnum
CREATE TYPE "TipoSeguimiento" AS ENUM ('RODEO', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "CategoriaAnimal" AS ENUM ('ORDENE', 'SECAS', 'PREPARTO');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('MATITIS', 'TRATAMIENTO', 'PREPARTO', 'DESCARTE');

-- AlterTable
ALTER TABLE "configuracion" ADD COLUMN     "tipoSeguimiento" "TipoSeguimiento" NOT NULL DEFAULT 'RODEO';

-- CreateTable
CREATE TABLE "Animal" (
    "idAnimal" TEXT NOT NULL,
    "idEstablecimiento" TEXT NOT NULL,
    "idRodeo" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT,
    "categoria" "CategoriaAnimal" NOT NULL,
    "estado" "EstadoAnimal" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaNacimiento" TIMESTAMP(3),

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("idAnimal")
);

-- CreateTable
CREATE TABLE "ProduccionAnimal" (
    "idProduccionAnimal" TEXT NOT NULL,
    "idAnimal" TEXT NOT NULL,
    "idLote" TEXT NOT NULL,
    "estado" "EstadoAnimal" NOT NULL,
    "litros" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ProduccionAnimal_pkey" PRIMARY KEY ("idProduccionAnimal")
);

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_idEstablecimiento_fkey" FOREIGN KEY ("idEstablecimiento") REFERENCES "Establecimiento"("idEstablecimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_idRodeo_fkey" FOREIGN KEY ("idRodeo") REFERENCES "Rodeo"("idRodeo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAnimal" ADD CONSTRAINT "ProduccionAnimal_idAnimal_fkey" FOREIGN KEY ("idAnimal") REFERENCES "Animal"("idAnimal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionAnimal" ADD CONSTRAINT "ProduccionAnimal_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LoteProduccion"("idLote") ON DELETE RESTRICT ON UPDATE CASCADE;
