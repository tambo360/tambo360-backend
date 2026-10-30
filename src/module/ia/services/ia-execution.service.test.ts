import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {iniciarEjecucion,finalizarEjecucionExitosa,finalizarEjecucionFallida,} from "./ia-executionService";

// IMPORTANTE: esta ruta debe coincidir con la que utiliza el service.
const { prismaMock, txMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
  },
  txMock: {
    aiAnalysisEvent: {
      update: vi.fn(),
    },
    aiAnalysisExecution: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

vi.mock("../../../lib/prisma", () => ({prisma: prismaMock,}));



const ejecucionBase = {
  idEjecucionIA: "execution-123",
  idEventoIA: "event-123",
  numeroIntento: 1,
  estado: "RUNNING",
  inicioEn: new Date("2026-10-30T10:00:00.000Z"),
  finEn: null,
  duracionMs: null,
  usoLLM: false,
  proveedor: null,
  modelo: null,
  tokensEntrada: null,
  tokensSalida: null,
  codigoError: null,
  mensajeError: null,
};

describe("IA Execution Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Simulamos una transacción de Prisma.
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock)
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --------------------------------------------------
  // INICIAR EJECUCIÓN
  // --------------------------------------------------

  describe("iniciarEjecucion", () => {
    it("debe incrementar el contador de intentos del evento", async () => {
      txMock.aiAnalysisEvent.update.mockResolvedValue({
        intentos: 1,
      });

      txMock.aiAnalysisExecution.create.mockResolvedValue({
        ...ejecucionBase,
      });

      await iniciarEjecucion("event-123");

      expect(txMock.aiAnalysisEvent.update).toHaveBeenCalledWith({
        where: {
          idEventoIA: "event-123",
        },
        data: {
          intentos: {
            increment: 1,
          },
        },
        select: {
          intentos: true,
        },
      });
    });

    it("debe crear una ejecución con estado RUNNING", async () => {
      txMock.aiAnalysisEvent.update.mockResolvedValue({
        intentos: 1,
      });

      txMock.aiAnalysisExecution.create.mockResolvedValue({
        ...ejecucionBase,
      });

      const resultado = await iniciarEjecucion("event-123");

      expect(txMock.aiAnalysisExecution.create).toHaveBeenCalledWith({
        data: {
          idEventoIA: "event-123",
          numeroIntento: 1,
          estado: "RUNNING",
        },
      });

      expect(resultado.estado).toBe("RUNNING");
    });

    it("debe asignar el número de intento devuelto por el contador", async () => {
      txMock.aiAnalysisEvent.update.mockResolvedValue({
        intentos: 4,
      });

      txMock.aiAnalysisExecution.create.mockResolvedValue({
        ...ejecucionBase,
        numeroIntento: 4,
      });

      await iniciarEjecucion("event-123");

      expect(txMock.aiAnalysisExecution.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          numeroIntento: 4,
        }),
      });
    });

    it("debe utilizar una transacción de Prisma", async () => {
      txMock.aiAnalysisEvent.update.mockResolvedValue({
        intentos: 1,
      });

      txMock.aiAnalysisExecution.create.mockResolvedValue({
        ...ejecucionBase,
      });

      await iniciarEjecucion("event-123");

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it("debe propagar el error si el evento no existe", async () => {
      const error = new Error("Record not found");

      txMock.aiAnalysisEvent.update.mockRejectedValue(error);

      await expect(
        iniciarEjecucion("evento-inexistente")
      ).rejects.toThrow("Record not found");

      expect(txMock.aiAnalysisExecution.create).not.toHaveBeenCalled();
    });

    it("debe propagar el error si falla la creación de la ejecución", async () => {
      txMock.aiAnalysisEvent.update.mockResolvedValue({
        intentos: 1,
      });

      txMock.aiAnalysisExecution.create.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        iniciarEjecucion("event-123")
      ).rejects.toThrow("Database error");
    });
  });

  // --------------------------------------------------
  // FINALIZAR EJECUCIÓN EXITOSA
  // --------------------------------------------------

  describe("finalizarEjecucionExitosa", () => {
    it("debe cambiar el estado a COMPLETED", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
      });

      const resultado = await finalizarEjecucionExitosa(
        "execution-123"
      );

      expect(resultado.estado).toBe("COMPLETED");

      expect(txMock.aiAnalysisExecution.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: "COMPLETED",
          }),
        })
      );
    });

    it("debe registrar la fecha de finalización", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
      });

      await finalizarEjecucionExitosa("execution-123");

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data.finEn).toBeInstanceOf(Date);
    });

    it("debe calcular la duración de la ejecución en milisegundos", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-30T10:00:05.000Z"));

      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
        inicioEn: new Date("2026-10-30T10:00:00.000Z"),
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
        duracionMs: 5000,
      });

      await finalizarEjecucionExitosa("execution-123");

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data.duracionMs).toBe(5000);
    });

    it("debe guardar las métricas del LLM cuando están disponibles", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
        usoLLM: true,
        proveedor: "openrouter",
        modelo: "modelo-test",
        tokensEntrada: 100,
        tokensSalida: 50,
      });

      await finalizarEjecucionExitosa("execution-123", {
        usoLLM: true,
        proveedor: "openrouter",
        modelo: "modelo-test",
        tokensEntrada: 100,
        tokensSalida: 50,
      });

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data).toEqual(
        expect.objectContaining({
          usoLLM: true,
          proveedor: "openrouter",
          modelo: "modelo-test",
          tokensEntrada: 100,
          tokensSalida: 50,
        })
      );
    });

    it("debe permitir finalizar sin métricas de LLM", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
      });

      await expect(
        finalizarEjecucionExitosa("execution-123")
      ).resolves.toBeDefined();

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data).not.toHaveProperty("proveedor");
      expect(llamada.data).not.toHaveProperty("modelo");
      expect(llamada.data).not.toHaveProperty("tokensEntrada");
      expect(llamada.data).not.toHaveProperty("tokensSalida");
    });

    it("debe rechazar una ejecución inexistente", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue(null);

      await expect(
        finalizarEjecucionExitosa("execution-inexistente")
      ).rejects.toMatchObject({
        codigo: "EJECUCION_NO_ENCONTRADA",
      });

      expect(txMock.aiAnalysisExecution.updateMany).not.toHaveBeenCalled();
    });

    it("debe rechazar una ejecución que ya está COMPLETED", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
        estado: "COMPLETED",
      });

      await expect(
        finalizarEjecucionExitosa("execution-123")
      ).rejects.toMatchObject({
        codigo: "EJECUCION_YA_FINALIZADA",
      });

      expect(txMock.aiAnalysisExecution.updateMany).not.toHaveBeenCalled();
    });

    it("debe rechazar una ejecución que ya está FAILED", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
      });

      await expect(
        finalizarEjecucionExitosa("execution-123")
      ).rejects.toMatchObject({
        codigo: "EJECUCION_YA_FINALIZADA",
      });

      expect(txMock.aiAnalysisExecution.updateMany).not.toHaveBeenCalled();
    });

    it("debe rechazar la finalización si otra operación ya la completó", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      // Simulamos que otra operación modificó la ejecución
      // antes de que este update pudiera hacerlo.
      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        finalizarEjecucionExitosa("execution-123")
      ).rejects.toMatchObject({
        codigo: "EJECUCION_YA_FINALIZADA",
      });
    });
  });

  // --------------------------------------------------
  // FINALIZAR EJECUCIÓN FALLIDA
  // --------------------------------------------------

  describe("finalizarEjecucionFallida", () => {
    it("debe cambiar el estado a FAILED", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
      });

      const resultado = await finalizarEjecucionFallida(
        "execution-123",
        {
          codigo: "PYTHON_ERROR",
          mensaje: "Error al analizar",
        }
      );

      expect(resultado.estado).toBe("FAILED");
    });

    it("debe guardar el código y mensaje del error", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
        codigoError: "PYTHON_TIMEOUT",
        mensajeError: "El servicio Python no respondió",
      });

      await finalizarEjecucionFallida("execution-123", {
        codigo: "PYTHON_TIMEOUT",
        mensaje: "El servicio Python no respondió",
      });

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data).toEqual(
        expect.objectContaining({
          estado: "FAILED",
          codigoError: "PYTHON_TIMEOUT",
          mensajeError: "El servicio Python no respondió",
        })
      );
    });

    it("debe registrar fecha y duración al fallar", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-30T10:00:08.000Z"));

      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
        inicioEn: new Date("2026-10-30T10:00:00.000Z"),
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
        duracionMs: 8000,
      });

      await finalizarEjecucionFallida("execution-123", {
        codigo: "PYTHON_ERROR",
        mensaje: "Error",
      });

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data.finEn).toBeInstanceOf(Date);
      expect(llamada.data.duracionMs).toBe(8000);
    });

    it("debe guardar métricas disponibles incluso cuando falla", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.aiAnalysisExecution.findUniqueOrThrow.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
      });

      await finalizarEjecucionFallida(
        "execution-123",
        {
          codigo: "PYTHON_ERROR",
          mensaje: "Error durante el análisis",
        },
        {
          usoLLM: true,
          proveedor: "openrouter",
          modelo: "modelo-test",
          tokensEntrada: 200,
          tokensSalida: 0,
        }
      );

      const llamada =
        txMock.aiAnalysisExecution.updateMany.mock.calls[0][0];

      expect(llamada.data).toEqual(
        expect.objectContaining({
          usoLLM: true,
          proveedor: "openrouter",
          modelo: "modelo-test",
          tokensEntrada: 200,
          tokensSalida: 0,
        })
      );
    });

    it("debe rechazar una ejecución inexistente", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue(null);

      await expect(
        finalizarEjecucionFallida("execution-inexistente", {
          codigo: "ERROR",
          mensaje: "Error",
        })
      ).rejects.toMatchObject({
        codigo: "EJECUCION_NO_ENCONTRADA",
      });
    });

    it("debe rechazar una ejecución que ya fue finalizada", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
        estado: "FAILED",
      });

      await expect(
        finalizarEjecucionFallida("execution-123", {
          codigo: "ERROR",
          mensaje: "Otro error",
        })
      ).rejects.toMatchObject({
        codigo: "EJECUCION_YA_FINALIZADA",
      });

      expect(txMock.aiAnalysisExecution.updateMany).not.toHaveBeenCalled();
    });

    it("debe rechazar la actualización si otra operación ya finalizó la ejecución", async () => {
      txMock.aiAnalysisExecution.findUnique.mockResolvedValue({
        ...ejecucionBase,
      });

      txMock.aiAnalysisExecution.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        finalizarEjecucionFallida("execution-123", {
          codigo: "ERROR",
          mensaje: "Error",
        })
      ).rejects.toMatchObject({
        codigo: "EJECUCION_YA_FINALIZADA",
      });
    });
  });
});