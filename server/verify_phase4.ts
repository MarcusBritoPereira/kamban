
import { PrismaClient } from '@prisma/client';

async function verifyPhase4() {
    const prisma = new PrismaClient();
    const API_URL = 'http://localhost:3000/v1';

    // Helper function for requests
    async function request(method: string, url: string, token: string, body?: any) {
        const headers: any = {
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

        // 1. Setup Users
        const timestamp = Date.now();
        const adminEmail = `admin_${timestamp}@test.com`;
        const userEmail = `user_${timestamp}@test.com`;

        console.log('Creating Admin & User...');
        // Create Admin (using register, initially gestor)
        await request('POST', '/auth/register', '', { name: 'Admin Candidate', email: adminEmail, password: 'password' });
        // Create User
        await request('POST', '/auth/register', '', { name: 'Regular User', email: userEmail, password: 'password' });

        // Promote to Admin using Prisma
        console.log(`Promoting ${adminEmail} to ADMIN via Prisma Client...`);
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'admin' }
        });

        // Login to get IDs/Tokens
        const adminLogin = await request('POST', '/auth/login', '', { email: adminEmail, password: 'password' });
        const userLogin = await request('POST', '/auth/login', '', { email: userEmail, password: 'password' });

        let adminToken = adminLogin.data.access_token;
        const adminId = adminLogin.data.user.id;
        const userToken = userLogin.data.access_token;
        const userId = userLogin.data.user.id;

        console.log('Admin Role in Token:', adminLogin.data.user.role);

        if (adminLogin.data.user.role !== 'admin') {
            console.error('FAILURE: User is not admin even after update.');
            // Note: If token role is old, maybe DB update worked but token claim logic is checking something else?
            // Actually, JwtStrategy verifies payload. Payload is created at login from User object.
            // If prisma update happened before login, it SHOULD be correct.
            process.exit(1);
        }

        // 2. User creates a space
        console.log('User creating a private space...');
        const spaceRes = await request('POST', '/spaces', userToken, { name: 'User Private Space' });
        const spaceId = spaceRes.data.id;
        console.log(`Space Created: ${spaceId}`);

        // 3. Admin lists ALL spaces (Should see it)
        console.log('Admin listing ALL spaces...');
        const allSpacesRes = await request('GET', '/spaces', adminToken);
        const hasSpace = allSpacesRes.data.find((s: any) => s.id === spaceId);

        if (hasSpace) {
            console.log('SUCCESS: Admin sees the private space.');
        } else {
            console.error('FAILURE: Admin does NOT see the private space.');
            console.log(allSpacesRes.data);
            process.exit(1);
        }

        // 4. Admin lists ALL users (UsersController)
        console.log('Admin listing ALL users...');
        const usersRes = await request('GET', '/users', adminToken);

        if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
            console.log(`SUCCESS: Admin retrieved ${usersRes.data.length} users.`);
            const fetchedUser = usersRes.data.find((u: any) => u.id === userId);
            if (fetchedUser) {
                console.log('Found created user.');
                if (fetchedUser.last_active_at) {
                    console.log(`Last Activity tracked: ${fetchedUser.last_active_at}`);
                } else {
                    console.warn('WARNING: last_active_at is null/missing.');
                }
            }
        } else {
            console.error(`FAILURE: Admin could not list users. Status: ${usersRes.status}`);
            process.exit(1);
        }

        // 5. Admin updates User Role
        console.log('Admin updating User Role to Editor...');
        const updateRes = await request('PUT', `/users/${userId}`, adminToken, { role: 'editor' });
        if (updateRes.ok && updateRes.data.role === 'editor') {
            console.log('SUCCESS: Admin updated user role.');
        } else {
            console.error('FAILURE: Admin could not update user role.');
            console.log(updateRes.data);
            process.exit(1);
        }

        console.log('--- Phase 4 Verification Passed ---');

    } catch (error: any) {
        console.error('Verification Failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPhase4();
