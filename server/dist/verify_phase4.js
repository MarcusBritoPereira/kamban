"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function verifyPhase4() {
    const prisma = new client_1.PrismaClient();
    const API_URL = 'http://localhost:3000/v1';
    async function request(method, url, token, body) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const res = await fetch(`${API_URL}${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = res.ok ? await res.json() : await res.text();
        return { status: res.status, ok: res.ok, data };
    }
    try {
        console.log('--- Starting Verification Phase 4 ---');
        console.log('Timestamp:', new Date().toISOString());
        const timestamp = Date.now();
        const adminEmail = `admin_${timestamp}@test.com`;
        const userEmail = `user_${timestamp}@test.com`;
        console.log('Creating Admin & User...');
        await request('POST', '/auth/register', '', { name: 'Admin Candidate', email: adminEmail, password: 'password' });
        await request('POST', '/auth/register', '', { name: 'Regular User', email: userEmail, password: 'password' });
        console.log(`Promoting ${adminEmail} to ADMIN via Prisma Client...`);
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'admin' }
        });
        const adminLogin = await request('POST', '/auth/login', '', { email: adminEmail, password: 'password' });
        const userLogin = await request('POST', '/auth/login', '', { email: userEmail, password: 'password' });
        let adminToken = adminLogin.data.access_token;
        const adminId = adminLogin.data.user.id;
        const userToken = userLogin.data.access_token;
        const userId = userLogin.data.user.id;
        console.log('Admin Role in Token:', adminLogin.data.user.role);
        if (adminLogin.data.user.role !== 'admin') {
            console.error('FAILURE: User is not admin even after update.');
            process.exit(1);
        }
        console.log('User creating a private space...');
        const spaceRes = await request('POST', '/spaces', userToken, { name: 'User Private Space' });
        const spaceId = spaceRes.data.id;
        console.log(`Space Created: ${spaceId}`);
        console.log('Admin listing ALL spaces...');
        const allSpacesRes = await request('GET', '/spaces', adminToken);
        const hasSpace = allSpacesRes.data.find((s) => s.id === spaceId);
        if (hasSpace) {
            console.log('SUCCESS: Admin sees the private space.');
        }
        else {
            console.error('FAILURE: Admin does NOT see the private space.');
            console.log(allSpacesRes.data);
            process.exit(1);
        }
        console.log('Admin listing ALL users...');
        const usersRes = await request('GET', '/users', adminToken);
        if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
            console.log(`SUCCESS: Admin retrieved ${usersRes.data.length} users.`);
            const fetchedUser = usersRes.data.find((u) => u.id === userId);
            if (fetchedUser) {
                console.log('Found created user.');
                if (fetchedUser.last_active_at) {
                    console.log(`Last Activity tracked: ${fetchedUser.last_active_at}`);
                }
                else {
                    console.warn('WARNING: last_active_at is null/missing.');
                }
            }
        }
        else {
            console.error(`FAILURE: Admin could not list users. Status: ${usersRes.status}`);
            process.exit(1);
        }
        console.log('Admin updating User Role to Editor...');
        const updateRes = await request('PUT', `/users/${userId}`, adminToken, { role: 'editor' });
        if (updateRes.ok && updateRes.data.role === 'editor') {
            console.log('SUCCESS: Admin updated user role.');
        }
        else {
            console.error('FAILURE: Admin could not update user role.');
            console.log(updateRes.data);
            process.exit(1);
        }
        console.log('--- Phase 4 Verification Passed ---');
    }
    catch (error) {
        console.error('Verification Failed:', error.message);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyPhase4();
//# sourceMappingURL=verify_phase4.js.map