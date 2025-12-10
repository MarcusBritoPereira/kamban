"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const list = await prisma.list.findFirst({
        include: { folder: { include: { space: true } } }
    });
    if (list) {
        console.log(`URL: http://localhost:4200/space/${list.folder.space.id}/folder/${list.folder_id}/list/${list.id}`);
    }
    else {
        console.log('No lists found');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=get-url.js.map