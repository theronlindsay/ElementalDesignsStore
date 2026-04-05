import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

// For local dev, use 'mongodb://localhost:27017/?replicaSet=rs0' or 'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0' if running in Docker Compose
const MONGO_URI = env.MONGO_URI || `mongodb+srv://elemental:@cluster0.tedq9qw.mongodb.net/?appName=Cluster0`;
const DB_NAME =  env.MONGO_DB || 'elementaldesigns';


let client;
let db;
let connectPromise;

async function getDb() {
  if (!db) {
    // Startup can trigger multiple server loads in parallel; share one connect attempt.
    if (!connectPromise) {
      client = new MongoClient(MONGO_URI);
      connectPromise = client
        .connect()
        .then(() => {
          db = client.db(DB_NAME);
          return db;
        })
        .catch((err) => {
          client = undefined;
          db = undefined;
          connectPromise = undefined;
          console.error('MongoDB connection error:', err);
          throw new Error('Failed to connect to MongoDB. Check your MONGO_URI and replica set.');
        });
    }

    await connectPromise;
  }

  if (!db) throw new Error('MongoDB database is not initialized.');
  return db;
}

async function getCollection(name) {
  const dbInstance = await getDb();
  // Check if collection exists, create if not
  const collections = await dbInstance.listCollections({ name }).toArray();
  if (collections.length === 0) {
    // Create with a validator for testimonials if name matches
    if (name.toLowerCase() === 'testimonials' || name.toLowerCase() === 'testamonials') {
      await dbInstance.createCollection(name, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id', 'name', 'text'],
            properties: {
              id: { bsonType: 'string' },
              name: { bsonType: 'string' },
              text: { bsonType: 'string' },
              stars: { bsonType: ['string', 'int', 'null'], description: 'Optional star rating' },
              image: { bsonType: ['string', 'null'], description: 'Optional image URL' },
              link: { bsonType: ['string', 'null'], description: 'Optional link' }
            }
          }
        }
      });
    } else {
      // Default: require id (string)
      await dbInstance.createCollection(name, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id'],
            properties: {
              id: { bsonType: 'string' }
            }
          }
        }
      });
    }
  }
  return dbInstance.collection(name);
}

export { getDb, getCollection };
