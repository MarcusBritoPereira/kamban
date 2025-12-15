
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const companiesToAssign = [
    "Dxtra", // User said "Dxtra Inc", commonly just "Dxtra" or "Dxtra Inc" in DB? Checks required.
    "Bill Car",
    "Macedo Engenharia",
    "NEW MÓVEIS",
    "Campo Bello INC/CONSTRUTORA", // Exact match found in DB
    "Distribuidora Durães",
    "João Matheus Advogado",
    "Prudentte Lima Inc", // Previous script had "Prudentte Lima Imóveis" and "Prudentte Lima Inc"? checking.
    "Tiago Malvão", // User said "Tiago Malvão", DB might be "Tiago Malvão Nutricionista"
    "Essencial Informática",
    "Horizonte Park",
    "Tapajós Prime Residence"
];

const targetUser = {
    name: "Allaf",
    email: "allaf991806795@gmail.com", // Correct User Email
    role: "Filmmaker"
};

async function main() {
    console.log(`Starting assignment for ${targetUser.name}...`);

    // 0. Cleanup Mistake (Delete the fake user if created previously)
    const fakeEmail = "allaf@projectup.com";
    const fakeUser = await prisma.user.findUnique({ where: { email: fakeEmail } });
    if (fakeUser) {
        console.log(`🧹 Cleaning up duplicate user ${fakeEmail}...`);
        // Remove from companies first if Cascade doesn't handle checks (Cascade usually handles but explicit is safer for logs)
        await prisma.user.delete({ where: { id: fakeUser.id } });
        console.log('✅ Duplicate user deleted.');
    }

    // 1. Find or Create User
    const defaultPassword = await bcrypt.hash('123456', 10);

    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: targetUser.email },
                // { name: { equals: targetUser.name, mode: 'insensitive' } } // Remove name check to enforce email match for safety now
            ]
        }
    });

    if (!user) {
        console.log(`Creating user: ${targetUser.name} (${targetUser.email})`);
        user = await prisma.user.create({
            data: {
                name: targetUser.name,
                email: targetUser.email,
                password_hash: defaultPassword,
                role: 'editor' // System role
            }
        });
    } else {
        console.log(`✅ Found existing user: ${user.name} (${user.email})`);
    }
    console.log(`User ID: ${user.id}`);

    // 2. Assign to Companies
    for (const companyName of companiesToAssign) {
        // Try exact match first
        let company = await prisma.company.findFirst({
            where: { name: { equals: companyName, mode: 'insensitive' } }
        });

        // If not found, try contains for "Tiago Malvão" etc
        if (!company) {
            company = await prisma.company.findFirst({
                where: { name: { contains: companyName, mode: 'insensitive' } }
            });
        }

        // Specific fix for "Campo Bello" vs "Campo Belo" if needed, but let's see if contains works or valid names
        // "Dxtra Inc" vs "Dxtra"
        if (!company && companyName === 'Dxtra') {
            company = await prisma.company.findFirst({
                where: { name: { contains: 'Dxtra', mode: 'insensitive' } }
            });
        }

        if (!company) {
            console.log(`⚠️ Company NOT FOUND: ${companyName}`);
            continue;
        }

        // Upsert Member
        await prisma.companyMember.upsert({
            where: {
                company_id_user_id: {
                    company_id: company.id,
                    user_id: user.id
                }
            },
            update: {
                role: targetUser.role
            },
            create: {
                company_id: company.id,
                user_id: user.id,
                role: targetUser.role
            }
        });

        console.log(`✅ Assigned ${targetUser.name} as ${targetUser.role} to ${company.name}`);
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
