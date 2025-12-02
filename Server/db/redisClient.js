import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'x9p4gD9TMS3YazpNFCpGWkveM4MX6Pii',
    socket: {
        host: 'redis-17207.c250.eu-central-1-1.ec2.cloud.redislabs.com',
        port: 17207
    }
});


// Connect automatically when importing
await client.connect();

// Export the client so other files can use it
export default client;
