import { User } from './users.types';
import { RSMongoClient } from '../db-client/mongo-client';

export const getUsersService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('users');
  };

  return {
    async create({
      name,
      password,
    }: {
      name: string;
      password: string;
    }): Promise<{ data: User }> {
      const collection = await getCollection();

      const createdAt = new Date();

      const { ops } = await collection.insertOne({
        createdAt,
        updatedAt: createdAt,
        name,
        password,
      });

      return { data: ops[0] };
    },

    async findByName(name: string): Promise<{ data: User | null }> {
      const collection = await getCollection();

      const data = await collection.findOne<User>({ name: name });

      return { data };
    },
  };
};
