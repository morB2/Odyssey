import { createClient } from 'redis';

const client = createClient({
  username: 'default',
  password: 'x9p4gD9TMS3YazpNFCpGWkveM4MX6Pii',
  socket: {
    host: 'redis-17207.c250.eu-central-1-1.ec2.cloud.redislabs.com',
    port: 17207,
    reconnectStrategy: (retries) => {
      // Retry after 500ms up to 10 times
      if (retries > 10) return new Error('Retry limit reached');
      return 500;
    },
    keepAlive: 10000, // keep connection alive
  },
});

// Add an error handler so Node won't crash
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect automatically when importing
await client.connect();

export default client;
