import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding Rosi data...');

    // 1. Find a user to be the owner (admin ideally)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No users found. Please create a user first.');
        return;
    }
    console.log(`Using user: ${user.name} (${user.email}) as owner.`);

    // 2. Delete ALL existing spaces
    console.log('Deleting all spaces...');
    await prisma.space.deleteMany({});
    console.log('All spaces deleted.');

    // 3. Create "Rosi - Clientes" Space
    console.log('Creating Space: Rosi - Clientes...');
    const space = await prisma.space.create({
        data: {
            name: 'Rosi - Clientes',
            description: 'Espaço para clientes da Rosi',
            owner_id: user.id,
        },
    });
    console.log(`Space created with ID: ${space.id}`);

    // 4. Create Folders
    const folderNames = [
        'Elinelson',
        'Precisa Engenharia',
        'Cartão Eco',
        'Distribuidora Durães',
        'Instituto Bruno Moura',
        'Mercado do Bairro',
        'Sócias da Experiência',
        'Sanclin',
        'Bill Car',
        'Gustavo Veículos',
        'Horizonte Park',
        'Bruno Moura Pessoal',
        'Dr. Marcos Ariel',
        'QG Phone',
        'Campo Bello',
        'Prudentte Lima Inc',
        'Pax Recanto',
        'Raphael Advogado',
        'Prudentte Lima',
        'Dxtra',
    ];

    console.log(`Creating ${folderNames.length} folders...`);

    for (const name of folderNames) {
        await prisma.folder.create({
            data: {
                name,
                space_id: space.id,
                // Optional: Create a default list for each folder so it's not empty
                lists: {
                    create: [
                        { name: 'Geral' }
                    ]
                }
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
