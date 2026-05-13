import { prisma } from "./prisma";
import { Categoria } from "@prisma/client";

async function main() {
    const productos = [
        { nombre: "Queso Crema", categoria: Categoria.quesos, nombreNormalizado:  "queso crema" },
        { nombre: "Queso Gouda", categoria: Categoria.quesos, nombreNormalizado: "queso gouda" },
        { nombre: "Queso Brie", categoria: Categoria.quesos, nombreNormalizado: "queso brie" },
        { nombre: "Leche Entera", categoria: Categoria.leches, nombreNormalizado: "leche entera" },
        { nombre: "Leche Descremada", categoria: Categoria.leches, nombreNormalizado: "leche descremada" },
        { nombre: "Leche Semidescremada", categoria: Categoria.leches, nombreNormalizado: "leche semidescremada" },
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