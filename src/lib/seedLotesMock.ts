import { prisma } from "./prisma";

async function main() {
    const idEstablecimientoMock = "07356209-e6de-4232-b24c-60ea772b11f7";

    // 1. Asegurar que haya un usuario para ligarle el establecimiento falso si no existe
    let usuario = await prisma.usuario.findFirst();
    if (!usuario) {
        usuario = await prisma.usuario.create({
            data: {
                nombre: "Usuario Prueba",
                correo: "prueba@alertas.com",
                contrasena: "123456",
                verificado: true
            }
        });
        console.log("Usuario de prueba creado");
    }

    // 2. Asegurar que exista el establecimiento de la IA
    let estab = await prisma.establecimiento.findUnique({
        where: { idEstablecimiento: idEstablecimientoMock }
    });

    if (!estab) {
        estab = await prisma.establecimiento.create({
            data: {
                idEstablecimiento: idEstablecimientoMock,
                nombre: "Tambo Simulación Alertas",
                localidad: "Virtual",
                provincia: "Server",
                idUsuario: usuario.idUsuario
            }
        });
        console.log("Establecimiento de las alertas creado.");
    }

    // 3. Obtener un producto (Queso Cremoso o alguno de la BD)
    let producto = await prisma.producto.findFirst({
        where: { categoria: "quesos" }
    });

    if (!producto) {
        producto = await prisma.producto.create({
            data: { nombre: "Queso Cremoso", categoria: "quesos" }
        })
    }

    // 4. Lotes falsos de la IA
    const lotes = [
        { idLote: "lote-desvio-alto-3", cantidad: 100, unidad: "kg" as const, idEstablecimiento: idEstablecimientoMock, idProducto: producto.idProducto, estado: true },
        { idLote: "lote-desvio-medio-2", cantidad: 100, unidad: "kg" as const, idEstablecimiento: idEstablecimientoMock, idProducto: producto.idProducto, estado: true },
        { idLote: "lote-desvio-bajo-1", cantidad: 100, unidad: "kg" as const, idEstablecimiento: idEstablecimientoMock, idProducto: producto.idProducto, estado: true },
    ];

    for (const lote of lotes) {
        await prisma.loteProduccion.upsert({
            where: { idLote: lote.idLote },
            update: {}, // Si ya existe no hacemos nada
            create: lote
        });
    }

    console.log("✅ Lotes falsos insertados exitosamente para probar las alertas!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
