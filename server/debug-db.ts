import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const spaceCount = await prisma.space.count();
    const folderCount = await prisma.folder.count();
    const listCount = await prisma.list.count();

    console.log(`Users: ${userCount}`);
    console.log(`Spaces: ${spaceCount}`);
    console.log(`Folders: ${folderCount}`);
    console.log(`Lists: ${listCount}`);

    const users = await prisma.user.findMany();
    console.log('Users:', users);

    const spaces = await prisma.space.findMany();
    console.log('Spaces:', spaces);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
