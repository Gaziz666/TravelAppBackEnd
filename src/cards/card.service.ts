import { Card } from './card.types';
import { ObjectId } from 'mongodb';
import { RSMongoClient } from '../db-client/mongo-client';

export const getCardsService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('cards');
  };

  return {
    async create({
      name,
      order,
      description,
      listId,
      listName,
      checklists,
      labelColorId,
      labelTextId,
    }: {
      name: string;
      order: string;
      description: string;
      listId: string;
      listName: string;
      checklists: [];
      labelColorId: string;
      labelTextId: string;
    }): Promise<{ data: Card }> {
      const collection = await getCollection();

      const createdAt = new Date();

      const { ops } = await collection.insertOne({
        createdAt,
        updatedAt: createdAt,
        name,
        order,
        description,
        listId,
        listName,
        checklists,
        labelColorId,
        labelTextId,
      });

      return { data: ops[0] };
    },

    async remove(id: string) {
      const collection = await getCollection();

      const { deletedCount } = await collection.deleteOne({
        _id: new ObjectId(id),
      });

      return { data: { deletedCount } };
    },

    async deleteAllByListId(listId: string) {
      const collection = await getCollection();

      const cards = await collection.deleteMany({
        listId: listId,
      });

      return { data: cards };
    },

    async update(
      id: string,
      data: { name?: string; order?: string }
    ): Promise<{ data: Card }> {
      const collection = await getCollection();

      const { value } = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $currentDate: {
            updatedAt: true,
          },
          $set: data,
        },
        { returnOriginal: false }
      );
      return { data: value };
    },

    async findAllByListId({
      listId,
    }: {
      listId: string;
    }): Promise<{ data: Card[] }> {
      const collection = await getCollection();

      const cards = await collection
        .find<Card>({ listId: listId })
        .toArray();

      return { data: cards };
    },
  };
};
