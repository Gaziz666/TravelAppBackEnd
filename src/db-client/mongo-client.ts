import { MongoClient } from 'mongodb';

export const createMongoClient = () => {
  const mongoDbName = 'travelApp';
  let client: MongoClient | null;
  return {
    async connect() {
      if (!client) {
        const user = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;
        const uri = `mongodb+srv://${user}:${password}@cluster0.epwap.mongodb.net/travelApp?retryWrites=true&w=majority`;
        client = await MongoClient.connect(uri, {
          poolSize: 5,
          useUnifiedTopology: true,
        });
        console.info(`mongo db client is connected to ${mongoDbName}`);
        client.on(`close`, () => {
          console.info(`mongo db client is disconnected`);
          client = null;
        });
      }

      return client.db(mongoDbName);
    },
    async disconnect() {
      if (client) {
        await client.close();
        client = null;
      }
    },
  };
};
export type RSMongoClient = ReturnType<typeof createMongoClient>;
