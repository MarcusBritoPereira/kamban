
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const companiesList = [
    "Prudentte Lima Inc",
    "QG do Iphone",
    "Cartão Eco",
    "Mercado do Bairro",
    "Dr. Bruno Pessoal",
    "A Mesa Certa Podcast",
    "João Matheus Advogado",
    "Gustavo Veículos",
    "Dr. Luis Manoel",
    "Elinelson",
    "Instituto Bruno Moura",
    "Precisa",
    "Prudentte Lima Imóveis",
    "Recanto do Amanhã",
    "Dxtra",
    "Bill Car",
    "Raphael Advogado",
    "Sanclin",
    "Sócias da Experiencia",
    "Dr. Marcos Ariel",
    "Distribuidora Durães",
    "Campo Belo",
    "Horizonte Park",
    "Tapajós Prime Residence"
];

async function main() {
    console.log('Start updating Rosi allocations...');

    // 1. Find User ROSI
    const user = await prisma.user.findFirst({
        where: {
            name: { contains: 'ROSI', mode: 'insensitive' }
        }
    });

    if (!user) {
        console.error('User ROSI not found!');
        return;
    }

    console.log(`Found Consultant: ${user.name} (${user.id})`);

    for (const companyName of companiesList) {
        // Find Company
        const company = await prisma.company.findFirst({
            where: { name: { equals: companyName, mode: 'insensitive' } }
        });

        if (!company) {
            console.warn(`Company not found: ${companyName}`);
            continue;
        }

        // Check current members with 'Consultora de Marketing' role
        const currentConsultants = await prisma.companyMember.findMany({
            where: {
                company_id: company.id,
                role: 'Consultora de Marketing'
            },
            include: { user: true }
        });

        // If Rosi is already there, check if she is the only one?
        const isAlreadyAssigned = currentConsultants.some(m => m.user_id === user.id);

        // Remove other consultants if they exist
        for (const current of currentConsultants) {
            if (current.user_id !== user.id) {
                console.log(`Removing ${current.user.name} from ${company.name}`);
                await prisma.companyMember.delete({
                    where: { id: current.id }
                });
            }
        }

        if (!isAlreadyAssigned) {
            console.log(`Assigning ROSI to ${company.name}`);
            await prisma.companyMember.create({
                data: {
                    company_id: company.id,
                    user_id: user.id,
                    role: 'Consultora de Marketing'
                }
            });
        } else {
            console.log(`ROSI already assigned to ${company.name}`);
        }
    }

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
