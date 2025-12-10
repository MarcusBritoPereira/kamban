
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
    const email = 'demo_admin@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        // Update to admin
        user = await prisma.user.update({
            where: { email },
            data: { role: 'admin', password_hash: hashedPassword }
        });
        console.log('Updated existing user to admin:', user.email);
    } else {
        // Create new
        user = await prisma.user.create({
            data: {
                email,
                name: 'Demo Admin',
                password_hash: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Created new admin user:', user.email);
    }
}

seedAdmin()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
