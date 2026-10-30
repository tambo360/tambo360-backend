import axios from "axios";
import { ZodError } from "zod";
import { analisisIARequestSchema, analisisIAResponseSchema, errorIAResponseSchema, } from "../schemas/ia.schema";
import type { AnalisisIARequest, AnalisisIAResponse, } from "../types/ia.types";
import { PythonIAError } from "../errors/python-ia.error";

const pythonIAClient = axios.create({
    baseURL: process.env.PYTHON_IA_URL,
    timeout: 60_000,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function ejecutarAnalisisIA(payload: AnalisisIARequest): Promise<AnalisisIAResponse> {
    const request = analisisIARequestSchema.parse(payload);
    try {
        const { data } = await pythonIAClient.post("/analyses", request);

        let response: AnalisisIAResponse;

        try {
            response = analisisIAResponseSchema.parse(data);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new PythonIAError("Python devolvió una respuesta con formato inválido", "INVALID_RESPONSE", false);
            }

            throw error;
        }

        if (response.idEventoIA !== request.idEventoIA) {
            throw new PythonIAError("El evento recibido en la respuesta no coincide con el enviado", "INVALID_RESPONSE", false);
        }

        return response;
    } catch (error) {
        if (error instanceof PythonIAError) {
            throw error;
        }

        if (axios.isAxiosError(error)) {
            const parsed = errorIAResponseSchema.safeParse(error.response?.data);

            // Python devolvió un error con el formato del contrato.
            if (parsed.success) {
                const { codigo, mensaje, reintentable } = parsed.data.error;

                throw new PythonIAError(mensaje, codigo, reintentable);
            }

            // No hubo una respuesta válida con el formato esperado.
            const status = error.response?.status;

            if (status === 429 || (status !== undefined && status >= 500)) {
                throw new PythonIAError(`Python respondió con HTTP ${status}`, "PYTHON_HTTP_ERROR", true);
            }

            if (status !== undefined) {
                throw new PythonIAError(`Python respondió con HTTP ${status}`, "PYTHON_HTTP_ERROR", false);
            }

            // Timeout, conexión rechazada, DNS, etc.
            throw new PythonIAError("No se pudo establecer comunicación con Python", "PYTHON_CONNECTION_ERROR", true);
        }

        throw error;
    }
}




