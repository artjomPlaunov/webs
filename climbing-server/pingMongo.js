require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const uri = `mongodb+srv://${username}:${password}@cluster0.vehjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function pingMongo() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const result = await client.db().command({ ping: 1 });
        console.log('Ping result:', result);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        await client.close();
    }
}

pingMongo();
