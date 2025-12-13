
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const consultantMap = [
    { company: "25 de Março", consultant: "AMANDA" },
    { company: "NortePlay", consultant: "JULIA" },
    { company: "Maria do Carmo", consultant: "JULIA" },
    { company: "Intermed", consultant: "JULIA" },
    { company: "Diego Reale", consultant: "LUDIMILA" },
    { company: "Prudentte Lima Inc", consultant: "ROSI" },
    { company: "QG do Iphone", consultant: "ROSI" },
    { company: "Cartão Eco", consultant: "ROSI" },
    { company: "Via Marconi", consultant: "UP" },
    { company: "Way Jeep Ram", consultant: "UP" },
    { company: "Mercado do Bairro", consultant: "ROSI" },
    { company: "Dr. Bruno Pessoal", consultant: "ROSI" },
    { company: "A Mesa Certa Podcast", consultant: "ROSI" },
    { company: "Essencial Informática", consultant: "LEILA" },
    { company: "Tapajós Skate Shop", consultant: "LUDIMILA" },
    { company: "João Matheus Advogado", consultant: "ROSI" },
    { company: "Sucaria sabor da fruta", consultant: "LUDIMILA" },
    { company: "Dental Unic", consultant: "LUDIMILA" },
    { company: "Gustavo Veículos", consultant: "ROSI" },
    { company: "Dr. Luis Manoel", consultant: "ROSI" },
    { company: "Elinelson", consultant: "AMANDA" },
    { company: "Sushi Santarem", consultant: "AMANDA" },
    { company: "Casa do Saulo", consultant: "JULIA" },
    { company: "BeloAlter (Casa do Saulo)", consultant: "JULIA" },
    { company: "Bangalo da Selva", consultant: "JULIA" },
    { company: "Veneta", consultant: "AMANDA" },
    { company: "Boto Gelateria", consultant: "LUDIMILA" },
    { company: "Loja do Cartucho", consultant: "ROSI" },
    { company: "Macedo Engenharia", consultant: "JULIA" },
    { company: "Maximus", consultant: "AMANDA" },
    { company: "Bobs", consultant: "JULIA" },
    { company: "NEW MÓVEIS", consultant: "JULIA" },
    { company: "Instituto Bruno Moura", consultant: "JULIA" },
    { company: "Zenf", consultant: "JULIA" },
    { company: "Machado Lima", consultant: "LUDIMILA" },
    { company: "Precisa", consultant: "ROSI" },
    { company: "GUI360", consultant: "AMANDA" },
    { company: "Urbano Norte", consultant: "JULIA" },
    { company: "Tapajos Extintores", consultant: "JULIA" },
    { company: "Prudentte Lima Imóveis", consultant: "ROSI" },
    { company: "Recanto do Amanhã", consultant: "AMANDA" },
    { company: "Dxtra", consultant: "LUDIMILA" },
    { company: "Bill Car", consultant: "LUDIMILA" },
    { company: "Raphael Advogado", consultant: "ROSI" },
    { company: "Sanclin", consultant: "LUDIMILA" },
    { company: "Estudio Arco", consultant: "LUDIMILA" },
    { company: "Sócias da Experiencia", consultant: "JULIA" },
    { company: "Dr. Marcos Ariel", consultant: "ROSI" },
    { company: "Tiago Malvão Nutricionista", consultant: "ROSI" },
    { company: "Distribuidora Durães", consultant: "AMANDA" },
    { company: "Unicurso", consultant: "AMANDA" },
    { company: "Campo Belo", consultant: "ROSI" },
    { company: "Up&Up", consultant: "UP" },
    { company: "Box 47", consultant: "AMANDA" },
    { company: "Boliche To Na Pista", consultant: "AMANDA" },
    { company: "Lugs", consultant: "AMANDA" },
    { company: "Gelateria pinguin", consultant: "LUDIMILA" },
    { company: "Horizonte Park", consultant: "JULIA" },
    { company: "Tapajós Prime Residence", consultant: "JULIA" },
    { company: "UDI Murakami", consultant: "JULIA" },
    { company: "Equilibrium Vestibulares", consultant: "JULIA" },
    { company: "Nexus Distribuidora", consultant: "LUDIMILA" },
    { company: "Hering", consultant: "LUDIMILA" }
];

async function main() {
    console.log('Start assigning consultants...');

    // 1. Ensure Consultants Exist
    const uniqueConsultants = [...new Set(consultantMap.map(i => i.consultant))];
    const consultantUsers: Record<string, string> = {}; // Name -> ID

    const defaultPassword = await bcrypt.hash('123456', 10);

    for (const name of uniqueConsultants) {
        const email = `${name.toLowerCase().replace(/\s+/g, '')}@projectup.com`; // Fake email

        // Check if user exists by name (fuzzy) or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { name: { equals: name, mode: 'insensitive' } } // Exact name match
                ]
            }
        });

        if (!user) {
            console.log(`Creating user: ${name}`);
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password_hash: defaultPassword,
                    role: 'editor' // Default role
                }
            });
        }

        consultantUsers[name] = user.id;
    }

    // 2. Assign to Companies
    for (const item of consultantMap) {
        const company = await prisma.company.findFirst({
            where: { name: { equals: item.company, mode: 'insensitive' } }
        });

        if (!company) {
            console.log(`⚠️ Company NOT FOUND: ${item.company}`);
            continue;
        }

        const userId = consultantUsers[item.consultant];
        if (!userId) continue;

        // Upsert Member
        await prisma.companyMember.upsert({
            where: {
                company_id_user_id: {
                    company_id: company.id,
                    user_id: userId
                }
            },
            update: {
                role: 'Consultora de Marketing'
            },
            create: {
                company_id: company.id,
                user_id: userId,
                role: 'Consultora de Marketing'
            }
        });

        console.log(`Assigned ${item.consultant} to ${item.company}`);
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
