import { prisma } from "../lib/prisma";



class BreedsService {

    async getAllBreeds(org_id: string) {
        const data = await prisma.raza.findMany({
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
export default new BreedsService();


