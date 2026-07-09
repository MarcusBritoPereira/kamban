// @ts-nocheck
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function main() {
    console.log('🌱 Starting seed...');

    const password = await bcrypt.hash('123456', 10);

    // 1. Create Team Users
    const usersData = [
        { email: 'admin@upeupmarketing.com.br', name: 'Admin User', role: Role.admin, avatar: 'https://i.pravatar.cc/150?u=admin' },
        { email: 'gestor@upandup.com', name: 'Gestor Silva', role: Role.gestor, avatar: 'https://i.pravatar.cc/150?u=gestor' },
        { email: 'editor@upandup.com', name: 'Editor Junior', role: Role.editor, avatar: 'https://i.pravatar.cc/150?u=editor' },
        { email: 'designer@upandup.com', name: 'Designer Pro', role: Role.editor, avatar: 'https://i.pravatar.cc/150?u=designer' },
        { email: 'copy@upandup.com', name: 'Copywriter Lead', role: Role.editor, avatar: 'https://i.pravatar.cc/150?u=copy' }
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password_hash: password,
                role: u.role,
                avatar_url: u.avatar
            },
        });
        users.push(user);
    }
    console.log(`✅ Created/Updated ${users.length} users.`);

    // 2. Create Companies (MRR Data)
    const companiesData = [
        { name: 'Tech Solutions Ltd', value: 12000.00, status: 'active' },
        { name: 'Green Valley Organics', value: 5500.00, status: 'active' },
        { name: 'Startup Rocket', value: 8000.00, status: 'active' },
        { name: 'Legacy Corp', value: 2000.00, status: 'inactive' } // Should not count for MRR
    ];

    const companies = [];
    for (const c of companiesData) {
        let company = await prisma.company.findFirst({ where: { name: c.name } });
        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: c.name,
                    contract_value: c.value,
                    status: c.status
                }
            });
        }
        companies.push(company);
    }
    console.log(`✅ Created/Updated ${companies.length} companies.`);

    // 3. Create Spaces & Tasks (Client Performance & Capacity)
    // We map 1 Space per Active Company for simplicity
    const activeCompanies = companies.filter(c => c.status === 'active');

    for (let i = 0; i < activeCompanies.length; i++) {
        const company = activeCompanies[i];

        // Create Space
        let space = await prisma.space.findFirst({ where: { name: company.name } });
        if (!space) {
            space = await prisma.space.create({
                data: { name: company.name, owner_id: users[0].id }
            });
        }

        // Create Client Tag (Crucial for Dashboard)
        let clientTag = await prisma.tag.findFirst({ where: { name: company.name, space_id: space.id } });
        if (!clientTag) {
            clientTag = await prisma.tag.create({
                data: { name: company.name, space_id: space.id, color: '#FF007F' } // Pink/Purple accent
            });
        }

        // Create Folder
        const folderName = 'Marketing Operations'; // Or use company.name if you prefer 1 folder/client naming
        let folder = await prisma.folder.findFirst({ where: { space_id: space.id, name: folderName } });
        if (!folder) {
            folder = await prisma.folder.create({
                data: { space_id: space.id, name: folderName }
            });
        } else {
            // Folder exists, no need to link
        }

        // Create Lists
        const listsData = ['Backlog', 'Em Andamento', 'Em Aprovação', 'Concluído'];
        const lists = {};
        for (const lname of listsData) {
            let list = await prisma.list.findFirst({ where: { folder_id: folder.id, name: lname } });
            if (!list) {
                list = await prisma.list.create({ data: { folder_id: folder.id, name: lname } });
            }
            lists[lname] = list;
        }

        // Generate Tasks
        const tasksToCreate = [
            // Overdue Tasks (Backlog/Andamento)
            { title: 'Relatório Mensal de SEO', status: 'todo', list: lists['Backlog'], deadlineDays: -5, hours: 4, value: 500 },
            { title: 'Ajuste Crítico na Home', status: 'doing', list: lists['Em Andamento'], deadlineDays: -2, hours: 8, value: 1200 },

            // Healthy Tasks (Andamento/Aprovação)
            { title: 'Campanha Instagram Reels', status: 'doing', list: lists['Em Andamento'], deadlineDays: 5, hours: 12, value: 2500 },
            { title: 'Redação de Blog Posts (x4)', status: 'in_review', list: lists['Em Aprovação'], deadlineDays: 2, hours: 6, value: 800 },

            // Completed Tasks (Concluído)
            { title: 'Setup de Conta Google Ads', status: 'done', list: lists['Concluído'], deadlineDays: -10, hours: 5, value: 1500 },
            { title: 'Design de Banners Display', status: 'done', list: lists['Concluído'], deadlineDays: -15, hours: 10, value: 1000 },

            // Rejected Task (Creation of Rework Rate)
            { title: 'Vídeo Institucional v1', status: 'rejected', list: lists['Em Aprovação'], deadlineDays: -1, hours: 20, value: 5000 },
        ];

        for (const t of tasksToCreate) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + t.deadlineDays);

            const createdTask = await prisma.task.create({
                data: {
                    list_id: t.list.id,
                    title: t.title,
                    status: t.status,
                    deadline: deadline,
                    estimated_hours: t.hours,
                    task_value: t.value,
                    created_at: new Date(), // Ensure current period
                    updated_at: new Date()
                }
            });

            // Assign Tag (CRITICAL STEP)
            await prisma.taskTag.create({
                data: {
                    task_id: createdTask.id,
                    tag_id: clientTag.id
                }
            });

            // Assign random user (except first which assigns to specific to test load)
            const assignee = users[Math.floor(Math.random() * users.length)];

            await prisma.taskAssignee.create({
                data: {
                    task_id: createdTask.id,
                    user_id: assignee.id
                }
            });

            // If done or rejected, add activity log to count in metrics
            if (t.status === 'done' || t.status === 'rejected') {
                await prisma.taskActivity.create({
                    data: {
                        task_id: createdTask.id,
                        user_id: assignee.id,
                        type: 'status_change',
                        content: t.status === 'done' ? 'mudou o status para concluído' : 'mudou o status para rejeitado',
                        created_at: new Date()
                    }
                });
            }
        }
    }

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
