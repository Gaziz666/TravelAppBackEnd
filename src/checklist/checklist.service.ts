import { Checklist } from './checklist.types';
import { ObjectId } from 'mongodb';
import { RSMongoClient } from '../db-client/mongo-client';

export const getChecklistsService = (mongoClient: RSMongoClient) => {
  const getCollection = async () => {
    const db = await mongoClient.connect();
    return db.collection('checklist');
  };

  return {
    async create({
      name,
      order,
      cardId,
      checkboxes,
    }: {
      name: string;
      order: string;
      cardId: string;
      checkboxes: [];
    }): Promise<{ data: Checklist }> {
      const collection = await getCollection();

      const createdAt = new Date();

      const { ops } = await collection.insertOne({
        createdAt,
        updatedAt: createdAt,
        name,
        order,
        cardId,
        checkboxes,
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
    ): Promise<{ data: Checklist }> {
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

    async addNewCheckbox(
      id: string,
      data: { [key: string]: string }
    ): Promise<{ data: Checklist }> {
      const collection = await getCollection();

      const { value } = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $currentDate: {
            updatedAt: true,
          },
          $push: {
            checkboxes: data,
          },
        },
        { returnOriginal: false }
      );
      return value;
    },

    //   async findAllByUserBoard({
    //     boardId,
    //   }: {
    //     boardId: string;
    //   }): Promise<{ data: List[] }> {
    //     const collection = await getCollection();

    //     const lists = await collection
    //       .find<List>({ boardId: boardId })
    //       .toArray();

    //     return { data: lists };
    //   },

    //   async deleteAllByListId(listId: string) {
    //     const collection = await getCollection();

    //     const lists = await collection.deleteMany({
    //       listId: listId,
    //     });

    //     return { data: lists };
    //   },
    // };
  };
};
