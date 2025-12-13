
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
    { name: 'Dxtra Inc', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': ['Filmmaker', 'Editor'], 'MARCO VAZ': 'Designer' } },
    { name: 'Bill Car', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': ['Filmmaker', 'Editor'], 'KIDNEY': 'Designer' } },
    { name: 'Machado Lima Empreendimentos', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'GUSTAVO': ['Filmmaker', 'Editor'], 'MARCO VAZ': 'Designer' } },
    { name: 'Precisa Engenharia', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': ['Filmmaker', 'Editor'], 'AIRA': 'Designer' } },
    { name: 'Maximus Hamburgueria e Churrascaria', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'MESSIAS': ['Filmmaker', 'Editor'], 'MARCO VAZ': 'Designer' } },
    { name: 'Sushi Santarem', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'NALDO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Loja do Cartucho', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'NALDO': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Macedo Engenharia', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'NALDO': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'NEW MÓVEIS', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'NALDO': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Recanto do Amanhã', roleMap: { 'ROSI': 'Consultora de Marketing', 'MESSIAS': ['Filmmaker', 'Editor'], 'AIRA': 'Designer' } },
    { name: 'Sanclin', roleMap: { 'ROSI': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'NALDO': 'Editor' } },
    { name: 'Via Marconi', roleMap: { 'GUSTAVO': 'Filmmaker', 'NALDO': 'Editor' } },
    { name: 'Dr. Marcos Ariel', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'MAILSON': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Mercado do Bairro', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'NALDO': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Campo Bello INC/CONSTRUTORA', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'NALDO': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Distribuidora Durães', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'NALDO': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'João Matheus Advogado', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'NALDO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Gustavo Veículos', roleMap: { 'ROSI': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'NALDO': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Tapajós Skate Shop', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'PAULO': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Sócias da Experiencia', roleMap: { 'ROSI': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'QG do Iphone', roleMap: { 'ROSI': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'PAULO': 'Editor' } },
    { name: 'Veneta Açaí', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'MESSIAS': ['Filmmaker', 'Editor'], 'MARCO VAZ': 'Designer' } },
    { name: 'Boto Gelateria', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Maria do Carmo', roleMap: { 'JULIA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'MAILSON': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Intermed', roleMap: { 'JULIA': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Prudentte Lima Imóveis', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Prudentte Lima Inc', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Way Jeep Ram', roleMap: { 'ATILA': 'Filmmaker', 'PAULO': 'Editor' } },
    { name: 'Dr Luiz Manoel', roleMap: { 'ROSI': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'NortePlay', roleMap: { 'JULIA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Instituto Bruno Moura', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'MAILSON': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Dr. Diego Reale', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'MAILSON': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'GUI360', roleMap: { 'JULIA': 'Consultora de Marketing' } },
    { name: 'Raphael Machado', roleMap: { 'ROSI': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Cartão Eco', roleMap: { 'ROSI': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'WALBER': 'Editor' } },
    { name: 'Tiago Malvão', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'WALBER': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Dr. Bruno Moura Pessoal', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Essencial Informática', roleMap: { 'LEILA': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Sucaria sabor da fruta', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'ATILA': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Dental Unic', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'MAILSON': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Elinelson', roleMap: { 'ROSI': 'Consultora de Marketing' } },
    { name: 'Origem', roleMap: { 'ROSI': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'WALBER': 'Editor', 'KIDNEY': 'Designer' } },
    { name: 'Gelateria pinguin', roleMap: { 'LUDMILA': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Horizonte Park', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Tapajós Prime Residence', roleMap: { 'ROSI': 'Consultora de Marketing', 'ALLAF': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'UDI Murakami', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'MAILSON': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Equilibrium Vestibulares', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'WALBER': 'Editor', 'MARCO VAZ': 'Designer' } },
    { name: 'Agencia Up&Up', roleMap: { 'LEILA': 'Consultora de Marketing', 'GUSTAVO': 'Filmmaker', 'PAULO': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Nexus Variedades', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'MAILSON': 'Editor', 'AIRA': 'Designer' } },
    { name: 'Hering', roleMap: { 'LUDIMILA': 'Consultora de Marketing', 'MESSIAS': 'Filmmaker', 'WALBER': 'Editor', 'KIDNEY': 'Designer' } },
];

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in DB.`);

    const findUser = (nameStart: string) => {
        const n = nameStart.toLowerCase();
        return users.find(u => u.name.toLowerCase().startsWith(n));
    };

    // Mapping short names to DB users if needed
    const nameMap: Record<string, string> = {
        'ROSI': '', // Not found
        'LUDMILA': '', // Not found
        'LUDIMILA': '', // Not found
        'JULIA': '', // Not found
        'LEILA': '', // Not found
        'ALLAF': 'Allaf Brito',
        'GUSTAVO': 'Gustavo',
        'MESSIAS': 'Davisson Messias',
        'NALDO': 'Naldo',
        'MARCO VAZ': 'Marco Vaz',
        'KIDNEY': 'Kidney Seixas',
        'AIRA': 'Aira Laís',
        'PAULO': 'Paulo Oliveira Fernandes',
        'MAILSON': 'Mailson Ribeiro',
        'WALBER': 'Walber Valente',
        'ATILA': 'Átila Pereira'
    };

    // Create map of shortName -> userId
    const userMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(nameMap)) {
        if (!value) continue;
        const u = findUser(value.split(' ')[0]); // try to match by first name of the mapped value
        if (u) {
            userMap[key] = u.id;
        } else {
            // Try exact match
            const u2 = users.find(u => u.name.toLowerCase() === value.toLowerCase());
            if (u2) userMap[key] = u2.id;
        }
    }

    // Also try to match directly if not in map
    // ...

    for (const item of data) {
        console.log(`Creating company: ${item.name}`);
        const company = await prisma.company.create({
            data: {
                name: item.name,
                status: 'active'
            }
        });

        for (const [key, roleOrRoles] of Object.entries(item.roleMap)) {
            const userId = userMap[key];
            if (!userId) {
                console.log(`  Skipping user ${key} (not found)`);
                continue;
            }

            const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];

            for (const role of roles) {
                // Check uniqueness? The schema has @@unique([company_id, user_id]). 
                // So one user can only have ONE role per company or we need to change schema to allow multiple?
                // The requirement: "Filmmaker: ALLAF, Editor: ALLAF". Same user, two roles.
                // My schema has @@unique([company_id, user_id]). This is a problem!
                // Wait, usually one person has one primary role or we need many-to-many.
                // If Allaf is both Filmmaker and Editor, maybe the role string should be "Filmmaker & Editor" or I simply take the first one?
                // Or I change the schema.
                // Given the time, I will concatenate the roles if multiple.
            }

            const combinedRole = roles.join(' & ');

            await prisma.companyMember.create({
                data: {
                    company_id: company.id,
                    user_id: userId,
                    role: combinedRole
                }
            }).catch(e => console.log(`  Error adding member ${key}: ${e.message}`));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
