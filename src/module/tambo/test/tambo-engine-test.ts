import "dotenv/config"
import { PrismaClient, Categoria } from "@prisma/client"
import { seedCategoryAverages, evaluateSingleLote } from "../tambo.engine"

const db = new PrismaClient()
/*
Se comento el archivo de testeo porque se esta usando para probar la logica de los metodos del tambo engine, y no es un test unitario, sino mas bien una prueba de concepto. Se puede volver a habilitar cuando se quiera hacer un test unitario de esos metodos.
async function run() {
    const data = {
        idEstablecimiento: "test-establecimiento",
        lotes: [
            {
                idLote: "lote1",
                numeroLote: 1,
                producto: "Queso Cremoso",
                categoria: Categoria.quesos,
                cantidad: 100,
                unidad: "kg",
                mermas: [
                    { cantidad: 5 },
                    { cantidad: 3 }
                ]
            },
            {
                idLote: "lote2",
                numeroLote: 2,
                producto: "Queso Cremoso",
                categoria: Categoria.quesos,
                cantidad: 100,
                unidad: "kg",
                mermas: [
                    { cantidad: 10 }
                ]
            }
        ]
    }

    console.log("----- SEED -----")
    const res1 = await seedCategoryAverages(data, db)
    console.log("Resultado seed:", res1)

    console.log("----- SINGLE -----")
    const res2 = await evaluateSingleLote(
        {
            idEstablecimiento: data.idEstablecimiento,
            lotes: [data.lotes[0]]
        },
        db
    )

    console.log("Resultado single:", res2)
}

run()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect()
    })
*/