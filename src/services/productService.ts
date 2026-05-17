import { prisma } from "../lib/prisma";



class ProductService {

    async getAllProducts(org_id: string) {
        const data = await prisma.producto.findMany({
            where: {
                OR: [
                    { idOrganizacion: org_id },
                    { esSistema: true }
                ]
            }
        })

        return data;
    }

}
export default new ProductService();


