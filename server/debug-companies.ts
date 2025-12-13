
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.company.count();
    console.log(`Total companies in DB: ${count}`);

    if (count > 0) {
        const companies = await prisma.company.findMany({
            take: 5,
            include: { members: { include: { user: true } } }
        });
        console.log(JSON.stringify(companies, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
