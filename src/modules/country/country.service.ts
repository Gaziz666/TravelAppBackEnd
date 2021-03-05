import { ObjectId } from 'mongodb';
import { Country } from './country.types';
import { RSMongoClient } from '../../db-client/mongo-client';

export const getCountryService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('country');
  };

  return {
    async findById(
      id: string,
      lang: string
    ): Promise<{ data: Country | null }> {
      const collection = await getCollection();

      const data = await collection.findOne<Country>({ _id: new ObjectId(id) });

      return { data };
    },

    async findAll(): Promise<{ data: Array<Country> }> {
      const collection = await getCollection();

      const countries = await collection.find<Country>().toArray();

      return { data: countries };
    },

    async create(body: Country): Promise<{ data: Country }> {
      const collection = await getCollection();

      // const createdAt = new Date();
      // const lists: List[] = [];

      const { ops } = await collection.insertOne(body);

      return { data: ops[0] };
    },
  };
};
