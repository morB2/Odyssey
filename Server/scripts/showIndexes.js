import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from '../models/tripModel.js';
import Like from '../models/likesModel.js';
import Save from '../models/savesModel.js';
import Follow from '../models/followModel.js';

// Load environment variables
dotenv.config();

/**
 * Utility script to display all indexes for Trip, Like, Save, and Follow collections
 * This helps verify that indexes are properly created and identify any missing indexes
 * 
 * Usage: node scripts/showIndexes.js
 */

async function showIndexes() {
    try {
        // Connect to MongoDB using the same connection string as the app
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log('✅ Connected to MongoDB\n');

        const collections = [
            { name: 'Trip', model: Trip },
            { name: 'Like', model: Like },
            { name: 'Save', model: Save },
            { name: 'Follow', model: Follow }
        ];

        for (const { name, model } of collections) {
            console.log(`${'='.repeat(60)}`);
            console.log(`📊 ${name} Collection Indexes`);
            console.log(`${'='.repeat(60)}\n`);

            const indexes = await model.collection.getIndexes();

            if (Object.keys(indexes).length === 0) {
                console.log('⚠️  No indexes found!\n');
                continue;
            }

            for (const [indexName, indexSpec] of Object.entries(indexes)) {
                console.log(`Index Name: ${indexName}`);
                console.log(`Keys: ${JSON.stringify(indexSpec.key, null, 2)}`);

                if (indexSpec.unique) {
                    console.log(`Unique: ✓`);
                }

                if (indexSpec.sparse) {
                    console.log(`Sparse: ✓`);
                }

                console.log('---');
            }

            console.log(`Total indexes: ${Object.keys(indexes).length}\n`);
        }

        console.log(`${'='.repeat(60)}`);
        console.log('✅ Index inspection complete!');
        console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
        console.error('❌ Error inspecting indexes:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
showIndexes();
