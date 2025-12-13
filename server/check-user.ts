import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@upeupmarketing.com.br' },
    });
    console.log(user);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
