
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'airalcastro@gmail.com' } });
    if (!user) {
        console.log('User not found');
        return;
    }

    const task = await prisma.task.findFirst({
        include: { list: { include: { folder: true } } }
    });

    if (task) {
        console.log(`TASK_ID: ${task.id}`);
        console.log(`EXPECTED_URL: /spaces/${task.list.folder.space_id}/folders/${task.list.folder.id}/lists/${task.list.id}?openTask=${task.id}`);
    } else {
        console.log('No tasks found');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
