-- CreateEnum
CREATE TYPE "NivelAlerta" AS ENUM ('bajo', 'medio', 'alto');

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
CREATE INDEX "Alerta_idEstablecimiento_creadoEn_idx" ON "Alerta"("idEstablecimiento", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "PromedioCategoria_idEstablecimiento_categoria_key" ON "PromedioCategoria"("idEstablecimiento", "categoria");
