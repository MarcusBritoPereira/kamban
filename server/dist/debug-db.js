"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=debug-db.js.map