
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start correcting Julia allocations...');

    // 1. Find User JULIA
    const julia = await prisma.user.findFirst({
        where: {
            AND: [
                { name: { contains: 'JULIA', mode: 'insensitive' } },
                { email: { contains: 'julia', mode: 'insensitive' } } // Double check to avoid collisions if any
            ]
        }
    });

    if (!julia) {
        console.error('User JULIA not found!');
        return;
    }

    console.log(`Found JULIA: ${julia.id} (${julia.email})`);

    // 2. Get all her assignments
    const companies = await prisma.company.findMany({
        where: {
            members: {
                some: {
                    user_id: julia.id,
                    role: 'Consultora de Marketing'
                }
            }
        },
        include: {
            members: true // strictly not needed for logic but good for logging
        }
    });

    console.log(`Julia is currently assigned to ${companies.length} companies.`);

    const keptCompanies = ['Maria do Carmo', 'NortePlay'];

    for (const company of companies) {
        // Check if this company should be kept
        // Normalized check
        const isKept = keptCompanies.some(k => k.toLowerCase() === company.name.toLowerCase());

        if (!isKept) {
            console.log(`Removing Julia from: ${company.name}`);
            await prisma.companyMember.delete({
                where: {
                    company_id_user_id: {
                        company_id: company.id,
                        user_id: julia.id
                    }
                }
            });
        } else {
            console.log(`KEEPING Julia in: ${company.name}`);
        }
    }

    console.log('Correction complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
