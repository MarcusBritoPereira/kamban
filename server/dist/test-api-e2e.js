"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function main() {
    const listId = 'cf28c31d-8984-433a-a739-fc9f16cd9c06';
    const baseUrl = 'http://localhost:3000/v1';
    console.log('1. Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@upeupmarketing.com.br',
            password: '123456'
        })
    });
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        process.exit(1);
    }
    const { access_token } = await loginRes.json();
    console.log('Login successful. Token received.');
    console.log('2. Creating Task via API...');
    const taskData = {
        title: 'E2E Test Task ' + Date.now(),
        status: 'todo',
        priority: 'high',
        description: 'Created via e2e test script',
        list_id: listId
    };
    const createRes = await fetch(`${baseUrl}/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(taskData)
    });
    if (!createRes.ok) {
        console.error('Create Task failed:', await createRes.text());
        process.exit(1);
    }
    const createdTask = await createRes.json();
    console.log('Task created successfully:', createdTask);
    if (createdTask.title === taskData.title) {
        console.log('VERIFICATION PASSED: Task persisted and returned correctly.');
    }
    else {
        console.error('VERIFICATION FAILED: Task title mismatch.');
    }
}
main().catch(console.error);
//# sourceMappingURL=test-api-e2e.js.map