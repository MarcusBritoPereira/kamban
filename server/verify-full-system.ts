
import { randomUUID } from 'crypto';

async function verifySystem() {
    const baseUrl = 'http://localhost:3000/v1';
    let token = '';
    let userId = '';

    const log = (step: string, msg: string) => console.log(`[${step}] ${msg}`);
    const err = (step: string, msg: any) => {
        console.error(`[${step}] FAILED:`, msg);
        process.exit(1);
    };

    // 1. AUTHENTICATION
    log('AUTH', 'Attempting login with admin credentials...');
    let loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@kamban.com', password: '123456' })
    });

    if (!loginRes.ok) {
        log('AUTH', 'Login failed, attempting registration...');
        const uniqueEmail = `test.user.${Date.now()}@example.com`;
        const regRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: uniqueEmail, password: 'password123' })
        });

        if (!regRes.ok) err('AUTH', await regRes.text());

        // Login with new user
        loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
        });
        if (!loginRes.ok) err('AUTH', await loginRes.text());
    }

    const authData = await loginRes.json();
    token = authData.access_token;
    // Decode token simply to get ID if needed, or assume verified
    log('AUTH', 'Login successful. Token obtained.');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. SPACES
    log('SPACES', 'Creating a new Space...');
    const spaceRes = await fetch(`${baseUrl}/spaces`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Verification Space', description: 'Auto-generated' })
    });
    if (!spaceRes.ok) err('SPACES', await spaceRes.text());
    const space = await spaceRes.json();
    log('SPACES', `Space created: ${space.id}`);

    // Verify Space Listing
    const listSpacesRes = await fetch(`${baseUrl}/spaces`, { headers });
    const spaces = await listSpacesRes.json();
    if (!spaces.find((s: any) => s.id === space.id)) err('SPACES', 'Created space not found in list');
    log('SPACES', 'Space listed successfully.');

    // 3. FOLDERS
    log('FOLDERS', 'Creating a Folder...');
    const folderRes = await fetch(`${baseUrl}/spaces/${space.id}/folders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Projects Folder' })
    });
    if (!folderRes.ok) {
        // Fallback: Check if folders endpoint is different. Some apps use /folders directly or nested.
        // Trying direct default just in case based on controller patterns, but usually filtered by space.
        // Let's assume the standard REST pattern.
        err('FOLDERS', await folderRes.text());
    }
    const folder = await folderRes.json();
    log('FOLDERS', `Folder created: ${folder.id}`);

    // 4. LISTS
    log('LISTS', 'Creating a Task List...');
    const listRes = await fetch(`${baseUrl}/folders/${folder.id}/lists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Sprint 1' })
    });
    if (!listRes.ok) err('LISTS', await listRes.text());
    const list = await listRes.json();
    log('LISTS', `List created: ${list.id}`);

    // 5. TASKS
    log('TASKS', 'Creating a Task...');
    const taskRes = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            list_id: list.id,
            title: 'Verify System Task',
            status: 'todo',
            priority: 'high'
        })
    });
    if (!taskRes.ok) err('TASKS', await taskRes.text());
    const task = await taskRes.json();
    log('TASKS', `Task created: ${task.id}`);

    // Update Task
    log('TASKS', 'Updating Task status...');
    const updateRes = await fetch(`${baseUrl}/tasks/${task.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'done' })
    });
    if (!updateRes.ok) err('TASKS', await updateRes.text());
    const updatedTask = await updateRes.json();
    if (updatedTask.status !== 'done') err('TASKS', 'Task status update failed');
    log('TASKS', 'Task updated successfully.');

    log('SUCCESS', 'All automated backend checks passed! 🚀');
}

verifySystem().catch(console.error);
