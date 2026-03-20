type MermaEntrada = {
    descripcion: string;
    cantidad: number;
    unidad: string;
    fecha: string;
};

type Merma = MermaEntrada & {
    id: number;
};

class ServicioMerma {
    private mermas: Merma[] = [];
    private idActual: number = 1;

    // Crear merma
    async crear(data: MermaEntrada): Promise<Merma> {
        const nuevaMerma: Merma = {
            id: this.idActual++,
            ...data,
        };

        this.mermas.push(nuevaMerma);
        return nuevaMerma;
    }

    // Obtener todas
    obtenerTodas(): Merma[] {
        return this.mermas;
    }

    // Obtener por id
    obtenerPorId(id: number): Merma | undefined {
        return this.mermas.find(m => m.id === id);
    }

    // Editar merma
    async editar(data: Merma): Promise<Merma> {
        const existente = this.mermas.find(m => m.id === data.id);

        if (!existente) {
            throw new Error("Merma no encontrada");
        }

        existente.descripcion = data.descripcion;
        existente.cantidad = data.cantidad;
        existente.unidad = data.unidad;
        existente.fecha = data.fecha;

        return existente;
    }

}

export default new ServicioMerma();
