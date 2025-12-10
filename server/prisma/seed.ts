// @ts-nocheck
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function main() {
    const password = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@upeupmarketing.com.br' },
        update: {},
        create: {
            email: 'admin@upeupmarketing.com.br',
            name: 'Admin',
            password_hash: password,
            role: Role.admin,
        },
    });

    const gestor = await prisma.user.upsert({
        where: { email: 'gestor@upandup.com' },
        update: {},
        create: {
            email: 'gestor@upandup.com',
            name: 'Gestor User',
            password_hash: password,
            role: Role.gestor,
        },
    });

    console.log({ admin, gestor });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
