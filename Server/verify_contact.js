import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000'; // Adjust port if necessary

async function testContactSubmission() {
    try {
        console.log('Testing Send Contact Message...');
        const response = await fetch(`${BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'This is a test message from the verification script.'
            })
        });

        if (response.status === 201) {
            console.log('✅ Contact message submitted successfully');
        } else {
            console.error(`❌ Failed to submit contact message. Status: ${response.status}`);
            const text = await response.text();
            console.error('Response:', text);
        }

    } catch (error) {
        console.error('❌ Error testing contact submission:', error);
    }
}

testContactSubmission();
