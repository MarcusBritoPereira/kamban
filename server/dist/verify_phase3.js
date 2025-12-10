"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function verifyPhase3() {
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
        return { status: res.status, ok: res.ok, data: res.ok ? await res.json() : await res.text() };
    }
    try {
        console.log('--- Starting Verification Phase 3 ---');
        const timestamp = Date.now();
        const ownerEmail = `owner_${timestamp}@test.com`;
        const editorEmail = `editor_${timestamp}@test.com`;
        console.log('Creating Users...');
        await request('POST', '/auth/register', '', { name: 'Owner', email: ownerEmail, password: 'password' });
        await request('POST', '/auth/register', '', { name: 'Editor', email: editorEmail, password: 'password' });
        const ownerLogin = await request('POST', '/auth/login', '', { email: ownerEmail, password: 'password' });
        const editorLogin = await request('POST', '/auth/login', '', { email: editorEmail, password: 'password' });
        const ownerToken = ownerLogin.data.access_token;
        const editorToken = editorLogin.data.access_token;
        console.log('Creating Space...');
        const spaceRes = await request('POST', '/spaces', ownerToken, { name: 'Protected Space' });
        const spaceId = spaceRes.data.id;
        console.log(`Space Created: ${spaceId}`);
        console.log('Inviting Editor...');
        await request('POST', `/spaces/${spaceId}/members`, ownerToken, { email: editorEmail });
        console.log('Test 1: Editor tries to DELETE Space (Expect 403)...');
        const deleteRes = await request('DELETE', `/spaces/${spaceId}`, editorToken);
        if (deleteRes.status === 403) {
            console.log('SUCCESS: Editor received 403 Forbidden.');
        }
        else {
            console.error(`FAILURE: Editor response status ${deleteRes.status}`);
            console.log(deleteRes.data);
            process.exit(1);
        }
        console.log('Test 2: Owner tries to DELETE Space (Expect 200)...');
        const deleteOwnerRes = await request('DELETE', `/spaces/${spaceId}`, ownerToken);
        if (deleteOwnerRes.ok) {
            console.log('SUCCESS: Owner deleted the space.');
        }
        else {
            console.error(`FAILURE: Owner response status ${deleteOwnerRes.status}`);
            console.log(deleteOwnerRes.data);
            process.exit(1);
        }
        console.log('--- Phase 3 Verification Passed ---');
    }
    catch (error) {
        console.error('Verification Failed:', error.message);
        process.exit(1);
    }
}
verifyPhase3();
//# sourceMappingURL=verify_phase3.js.map