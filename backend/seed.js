require('dotenv').config();

const { MongoClient } = require('mongodb');
const data = require('./data.json');

const CONNECTION_STRING = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'studypy_db';
const COLLECTION_NAME = 'links';

async function seed() {
  const client = new MongoClient(CONNECTION_STRING);

  try {
    await client.connect();
    console.log('Connected to MongoDB...');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const docs = [];

    for (const category of data.categories) {
      for (const page of category.pages) {
        for (const link of page.links) {
          docs.push({
            title: link.title,
            description: link.description,
            url: link.url,
            category: category.name,
            page: page.name,
            addedAt: new Date(),
          });
        }
      }
    }

    console.log(`Prepared ${docs.length} documents...`);

    await collection.deleteMany({});
    console.log('Cleared existing links...');

    const result = await collection.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} links`);

  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
