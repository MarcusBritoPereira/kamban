import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@kamban.com';
    const plainPassword = '123456';

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Stored Hash:', user.password_hash);

    const isMatch = await bcrypt.compare(plainPassword, user.password_hash);
    console.log('Password match result:', isMatch);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
