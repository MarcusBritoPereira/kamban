
// @ts-nocheck
const API_URL = 'http://localhost:3000';
const EMAIL = 'airalcastro@gmail.com';
const PASSWORD = '123456';
const NAME = 'Aira Castro';

async function ensureUserAndData() {
    console.log(`🔍 Checking/Creating user: ${EMAIL}...`);

    try {
        // 1. Try Login
        const loginRes = await fetch(`${API_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        let token;

        if (loginRes.ok) {
            console.log('✅ User exists and password is correct.');
            const data = await loginRes.json();
            token = data.access_token;
        } else {
            console.log('⚠️ Login failed. Registering user...');
            const regRes = await fetch(`${API_URL}/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: NAME })
            });

            if (!regRes.ok) {
                throw new Error(`Register failed: ${await regRes.text()}`);
            }
            console.log('✅ Registration Successful.');

            // Login again to get token
            const loginRes2 = await fetch(`${API_URL}/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });
            if (!loginRes2.ok) throw new Error("Login failed after registration");
            const data2 = await loginRes2.json();
            token = data2.access_token;
        }

        // 2. Ensure they have a Workspace/Space/List/Task for the test
        console.log('🏗️ Ensuring test data (Space -> List -> Task)...');
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Check for Spaces
        const spacesRes = await fetch(`${API_URL}/v1/spaces`, { headers });
        const spaces = await spacesRes.json();
        let space = spaces[0];

        if (!space) {
            console.log('   Creating Space...');
            const sRes = await fetch(`${API_URL}/v1/spaces`, {
                method: 'POST', headers, body: JSON.stringify({ name: 'Browser Test Space' })
            });
            space = await sRes.json();
        }
        console.log(`   Using Space: ${space.name} (${space.id})`);

        // Check for Folders
        const foldersRes = await fetch(`${API_URL}/v1/spaces/${space.id}/folders`, { headers });
        const folders = await foldersRes.json();
        let folder = folders[0];

        if (!folder) {
            console.log('   Creating Folder...');
            const fRes = await fetch(`${API_URL}/v1/spaces/${space.id}/folders`, {
                method: 'POST', headers, body: JSON.stringify({ name: 'General', space_id: space.id })
            });
            folder = await fRes.json();
        }

        // Check for Lists
        const listsRes = await fetch(`${API_URL}/v1/folders/${folder.id}/lists`, { headers });
        const lists = await listsRes.json();
        let list = lists[0];

        if (!list) {
            console.log('   Creating List...');
            const lRes = await fetch(`${API_URL}/v1/folders/${folder.id}/lists`, {
                method: 'POST', headers, body: JSON.stringify({ name: 'Kanban List', folder_id: folder.id })
            });
            list = await lRes.json();
        }

        // Check for Tasks in "Todo"
        // We want at least one task in 'todo' to drag
        console.log('   Ensuring a task exists in "todo"...');
        const tasksRes = await fetch(`${API_URL}/v1/tasks/me`, { headers });
        const tasksData = await tasksRes.json();
        const tasks = Array.isArray(tasksData) ? tasksData : tasksData.data;
        const todoTask = tasks.find(t => t.status === 'todo');

        if (!todoTask) {
            console.log('   Creating Task...');
            await fetch(`${API_URL}/v1/tasks`, {
                method: 'POST', headers,
                body: JSON.stringify({ title: 'Browser Drag Test', status: 'todo', list_id: list.id })
            });
        }

        console.log('✅ PRE-FLIGHT CHECK COMPLETE. User and Data are ready for Browser.');

    } catch (e) {
        console.error('❌ CHECK FAILED:', e.message);
    }
}

ensureUserAndData();
