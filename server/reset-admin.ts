import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.update({
        where: { email: 'admin@upeupmarketing.com.br' },
        data: { password_hash: password },
    });
    console.log('Password updated for:', user.email);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
