-- AlterTable
ALTER TABLE "AiAnalysisEvent" ADD COLUMN     "bloqueadoHasta" TIMESTAMP(3),
ADD COLUMN     "intentosMaximos" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "proximoIntentoEn" TIMESTAMP(3),
ADD COLUMN     "tokenBloqueo" TEXT;

-- CreateIndex
CREATE INDEX "AiAnalysisEvent_estado_proximoIntentoEn_creadoEn_idx" ON "AiAnalysisEvent"("estado", "proximoIntentoEn", "creadoEn");

-- CreateIndex
CREATE INDEX "AiAnalysisEvent_estado_bloqueadoHasta_idx" ON "AiAnalysisEvent"("estado", "bloqueadoHasta");
