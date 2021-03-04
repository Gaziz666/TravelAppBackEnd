import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import { getBoardsRouter } from './boards/boards.router';
import { RSMongoClient } from './db-client/mongo-client';
import { getUsersRouter } from './users/users.router';
import { getListsRouter } from './lists/list.router';
import { getCardsRouter } from './cards/card.router';
import { getChecklistsRouter } from './checklist/checklist.router';
import path from 'path';
import { verifyToken } from './jwtMiddleware/jwtMiddleware';

export const createApp = (mongoClient: RSMongoClient) => {
  const app = express();

  app.use(express.static(path.resolve(__dirname, '../../client/dist')));

  app.use(morgan('dev'));
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api/board', verifyToken, getBoardsRouter(mongoClient));
  app.use('/api/user', getUsersRouter(mongoClient));
  app.use('/api/list', getListsRouter(mongoClient));
  app.use('/api/card', getCardsRouter(mongoClient));
  app.use('/api/checklist', getChecklistsRouter(mongoClient));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
  });

  return app;
};
