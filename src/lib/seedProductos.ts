import { prisma } from "./prisma";
import { Categoria } from "@prisma/client";

async function main() {
    const productos = [
        { nombre: "Queso Crema", categoria: Categoria.quesos },
        { nombre: "Queso Gouda", categoria: Categoria.quesos },
        { nombre: "Queso Brie", categoria: Categoria.quesos },
        { nombre: "Leche Entera", categoria: Categoria.leches },
        { nombre: "Leche Descremada", categoria: Categoria.leches },
        { nombre: "Leche Semidescremada", categoria: Categoria.leches },
    ];


    await prisma.producto.createMany({
        data: productos,
        skipDuplicates: true,
    });

    console.log("Productos cargados correctamente");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });