import { Request, Response } from "express";
import ServicioMerma from "../services/decreaseService";


export const registrarMerma = async (req: Request, res: Response): Promise<void> => {
    try {
        const { descripcion, cantidad, unidad, fecha } = req.body;

        if (!descripcion || cantidad <= 0 || !unidad || !fecha) {
            res.status(400).json({
                error: "Todos los campos son obligatorios",
            });
            return;
        }

        const nuevaMerma = await ServicioMerma.crear({
            descripcion,
            cantidad,
            unidad,
            fecha,
        });

        res.status(201).json({
            message: "Merma registrada correctamente",
            merma: nuevaMerma,
        });

    } catch (error: unknown) {
        res.status(500).json({ error: "Error al registrar la merma" });
    }
};

// Obtener merma por id
export const obtenerMermaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const merma = ServicioMerma.obtenerPorId(id);

        if (!merma) {
            res.status(404).json({ error: "Merma no encontrada" });
            return;
        }

        res.json({ merma });

    } catch {
        res.status(500).json({ error: "Error al obtener la merma" });
    }
};


// Actualizar merma
export const actualizarMerma = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { descripcion, cantidad, unidad, fecha } = req.body;

        if (!descripcion || cantidad <= 0 || !unidad || !fecha) {
            res.status(400).json({
                error: "Todos los campos son obligatorios",
            });
            return;
        }

        const actualizada = await ServicioMerma.editar({
            id,
            descripcion,
            cantidad,
            unidad,
            fecha,
        });

        res.json({
            message: "Merma actualizada correctamente",
            merma: actualizada,
        });

    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Merma no encontrada") {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Error al actualizar la merma" });
    }
};

