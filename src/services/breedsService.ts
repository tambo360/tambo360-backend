import { prisma } from "../lib/prisma";



class BreedsService {

    async getAllBreeds(org_id: string) {
        const data = await prisma.raza.findMany({
            where: {
                esSistema: true,
                OR: [
                    { idOrganizacion: org_id },
                    { idOrganizacion: null }
                ]
            }
        })

        return data;
    }

}
export default new BreedsService();


