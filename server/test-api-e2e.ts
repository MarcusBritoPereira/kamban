
// @ts-nocheck
const API_URL = 'http://localhost:3000';
const TIMESTAMP = Date.now();
const EMAIL = `hierarchy.test.${TIMESTAMP}@up.com`;
const PASSWORD = 'password123';
const NAME = 'Hierarchy Bot';

async function runTest() {
    console.log('🤖 STARTING HIERARCHY VERIFICATION BOT...');
    console.log(`   User: ${EMAIL}`);

    try {
        // 1. Register
        console.log('\n📝 Registering...');
        const regRes = await fetch(`${API_URL}/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: NAME })
        });
        if (!regRes.ok) throw new Error(`Register failed: ${await regRes.text()}`);

        // 2. Login
        console.log('🔐 Logging in...');
        const loginRes = await fetch(`${API_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });
        if (!loginRes.ok) throw new Error(`Login failed`);
        const { access_token: token } = await loginRes.json();
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. Create Space
        console.log('\n🪐 Creating Space...');
        const spaceRes = await fetch(`${API_URL}/v1/spaces`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: `Space ${TIMESTAMP}` })
        });
        if (!spaceRes.ok) throw new Error(`Space create failed: ${await spaceRes.text()}`);
        const space = await spaceRes.json();
        console.log(`   Space ID: ${space.id}`);

        // 4. Create Folder
        console.log('📂 Creating Folder...');
        const folderRes = await fetch(`${API_URL}/v1/spaces/${space.id}/folders`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'General Folder', space_id: space.id })
        });
        if (!folderRes.ok) throw new Error(`Folder create failed: ${await folderRes.text()}`);
        const folder = await folderRes.json();
        console.log(`   Folder ID: ${folder.id}`);

        // 5. Create List
        console.log('📋 Creating List...');
        const listRes = await fetch(`${API_URL}/v1/folders/${folder.id}/lists`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'To Do List', folder_id: folder.id })
        });
        if (!listRes.ok) throw new Error(`List create failed: ${await listRes.text()}`);
        const list = await listRes.json();
        console.log(`   List ID: ${list.id}`);

        // 6. Create Task
        console.log('✨ Creating Task...');
        const taskRes = await fetch(`${API_URL}/v1/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Drag Me',
                status: 'todo',
                list_id: list.id
            })
        });
        if (!taskRes.ok) throw new Error(`Task create failed: ${await taskRes.text()}`);
        const task = await taskRes.json();
        console.log(`   Task Created: "${task.title}" (ID: ${task.id})`);

        // 7. Move Task
        console.log('\n🚚 Moving Task to "doing"...');
        const moveRes = await fetch(`${API_URL}/v1/tasks/${task.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'doing' })
        });
        if (!moveRes.ok) throw new Error(`Move failed: ${await moveRes.text()}`);
        const movedTask = await moveRes.json();

        if (movedTask.status === 'doing') {
            console.log('✅ Move API Success (200 OK)');
        } else {
            console.error('❌ Move API returned OK but status mismatch:', movedTask.status);
        }

        // 8. Verify
        console.log('\n🕵️‍♀️ Final Database Check...');
        const checkRes = await fetch(`${API_URL}/v1/tasks/${task.id}`, { headers });
        const finalTask = await checkRes.json();

        if (finalTask.status === 'doing') {
            console.log('--------------------------------------------------');
            console.log('🎉 LIVE VERIFICATION SUCCESSFUL');
            console.log('   The drag-and-drop logic (status update) is fully operational.');
            console.log('--------------------------------------------------');
        } else {
            console.error('❌ PERSISTENCE FAILURE');
        }

    } catch (e) {
        console.error('❌ ERROR:', e.message);
    }
}

runTest();
