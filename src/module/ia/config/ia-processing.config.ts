export const IA_PROCESSING_CONFIG = {
  MAX_INTENTOS: 5,
  BATCH_SIZE: 10,
  LOCK_DURATION_MS: 90_000,
  BACKOFF_MS: [30_000, 60_000, 120_000, 240_000],
} as const;

export function obtenerTiempoEspera(intento: number): number {
  const index = Math.max(0, intento - 1);

  return (
    IA_PROCESSING_CONFIG.BACKOFF_MS[index] ??
    IA_PROCESSING_CONFIG.BACKOFF_MS[
      IA_PROCESSING_CONFIG.BACKOFF_MS.length - 1
    ]
  );
}