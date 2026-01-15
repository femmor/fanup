const fetch = require('node-fetch');

async function testWebhookEndpoint() {
    const testEvent = {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test',
                customer: 'cus_test',
                subscription: 'sub_test',
                metadata: {
                    userId: '507f1f77bcf86cd799439011',
                    planId: '507f1f77bcf86cd799439012'
                }
            }
        }
    };

    try {
        console.log('Testing webhook endpoint...');
        const response = await fetch('http://localhost:5005/api/webhooks/stripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testEvent)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);
    } catch (error) {
        console.error('Error testing webhook:', error.message);
    }
}

testWebhookEndpoint();