
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const newMembers = [
    { name: 'Aira Laís', email: 'airalcastro@gmail.com' },
    { name: 'Allaf Brito', email: 'allaf991806795@gmail.com' },
    { name: 'Davisson Messias', email: 'davissonrocha82@gmail.com' },
    { name: 'Gustavo', email: 'gustavoxstm@gmail.com' },
    { name: 'Kidney Seixas', email: 'kidneyseixas@gmail.com' },
    { name: 'Mailson Ribeiro', email: 'eumailsonribeironog@gmail.com' },
    { name: 'Marco Vaz', email: 'marcovaz.artes@gmail.com' },
    { name: 'Naldo', email: 'lucaslucinaldo19@gmail.com' },
    { name: 'Paulo Oliveira Fernandes', email: 'fernandespaulo330@gmail.com' },
    { name: 'Walber Valente', email: 'walberedrian2002@gmail.com' },
    { name: 'Átila Pereira', email: 'atilaotapajos@gmail.com' }
];

async function main() {
    console.log('Start seeding members...');

    // 1. Find the target Space
    // Trying to find 'Rosi - Clientes' specifically, or fallback to the first space found.
    let space = await prisma.space.findFirst({
        where: { name: { contains: 'Rosi' } }
    });

    if (!space) {
        console.log('Space "Rosi - Clientes" not found. Using the first available space.');
        space = await prisma.space.findFirst();
    }

    if (!space) {
        console.error('No spaces found! valid space required to add members.');
        return;
    }

    console.log(`Adding members to Space: ${space.name} (${space.id})`);

    // 2. Prepare password
    const passwordHash = await bcrypt.hash('123456', 10);

    for (const member of newMembers) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: member.email },
            update: {}, // Don't change existing users
            create: {
                name: member.name,
                email: member.email,
                password_hash: passwordHash,
                role: Role.editor // Default role for team members
            }
        });

        console.log(`User ensured: ${user.name}`);

        // Upsert SpaceMember
        await prisma.spaceMember.upsert({
            where: {
                space_id_user_id: {
                    space_id: space.id,
                    user_id: user.id
                }
            },
            update: {},
            create: {
                space_id: space.id,
                user_id: user.id,
                role: 'editor'
            }
        });

        console.log(` -> Added to space as editor.`);
    }

    console.log('Seeding members finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
