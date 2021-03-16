import { User } from './users.types';
import { RSMongoClient } from '../../db-client/mongo-client';

export const getUsersService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('users');
  };

  return {
    async create({
      login,
      email,
      password,
    }: {
      login: string;
      email: string;
      password: string;
    }): Promise<{ data: User }> {
      const collection = await getCollection();

      const createdAt = new Date();

      const { ops } = await collection.insertOne({
        createdAt,
        updatedAt: createdAt,
        login,
        email,
        password,
        name: '',
      });

      return { data: ops[0] };
    },

    async findByLogin(login: string): Promise<{ data: User | null }> {
      const collection = await getCollection();
      const data = await collection.findOne<User>({ login: login });
      return { data };
    },

    async findByEmail(email: string): Promise<{ data: User | null }> {
      const collection = await getCollection();
      const data = await collection.findOne<User>({ email: email });
      return { data };
    },

    async update(login: string, file: string): Promise<{ data: User }> {
      const collection = await getCollection();
      let img64 = file.split(',')[1];

      const { value } = await collection.findOneAndUpdate(
        { login: login },
        {
          $currentDate: {
            updatedAt: true,
          },
          $set: { file: img64 },
        },
        { returnOriginal: false }
      );
      return value.file;
    },
  };
};
