import { List } from './list.types';
import { ObjectId } from 'mongodb';
import { RSMongoClient } from '../db-client/mongo-client';

export const getListsService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('lists');
  };

  return {
    async create({
      name,
      order,
      boardId,
      cards,
    }: {
      name: string;
      order: string;
      boardId: string;
      cards: [];
    }): Promise<{ data: List }> {
      const collection = await getCollection();

      const createdAt = new Date();

      const { ops } = await collection.insertOne({
        createdAt,
        updatedAt: createdAt,
        name,
        order,
        boardId,
        cards,
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

    async update(
      id: string,
      data: { [key: string]: string }
    ): Promise<{ data: List }> {
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

    async findAllByUserBoard({
      boardId,
    }: {
      boardId: string;
    }): Promise<{ data: List[] }> {
      const collection = await getCollection();

      const lists = await collection
        .find<List>({ boardId: boardId })
        .toArray();

      return { data: lists };
    },

    async deleteAllByListId(listId: string) {
      const collection = await getCollection();

      const lists = await collection.deleteMany({
        listId: listId,
      });

      return { data: lists };
    },
  };
};
