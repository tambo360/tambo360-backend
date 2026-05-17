import { prisma } from "./prisma";
import { Categoria } from "@prisma/client";

async function main() {
    const productos = [
        { nombre: "Queso Crema", categoria: Categoria.quesos, nombreNormalizado:  "queso crema", esSistema: true },
        { nombre: "Queso Gouda", categoria: Categoria.quesos, nombreNormalizado: "queso gouda", esSistema: true },
        { nombre: "Queso Brie", categoria: Categoria.quesos, nombreNormalizado: "queso brie", esSistema: true },
        { nombre: "Leche Entera", categoria: Categoria.leches, nombreNormalizado: "leche entera", esSistema: true },
        { nombre: "Leche Descremada", categoria: Categoria.leches, nombreNormalizado: "leche descremada", esSistema: true },
        { nombre: "Leche Semidescremada", categoria: Categoria.leches, nombreNormalizado: "leche semidescremada", esSistema: true },
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