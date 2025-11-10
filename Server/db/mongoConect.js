import mongoose from 'mongoose';
import { config } from '../config/secret.js';

async function main() {
  try {
     await mongoose.connect(config.dbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // await mongoose.connect(config.dbConnection);
    console.log('Mongo connected successfully');
  } catch (err) {
    console.error('Mongo connection error:', err);
  }
}

main();
