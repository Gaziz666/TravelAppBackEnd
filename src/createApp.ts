import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { RSMongoClient } from './db-client/mongo-client';
import path from 'path';
import { getCountryRouter } from './modules/country/country.router';
import { getUsersRouter } from './modules/users/users.router';

export const createApp = (mongoClient: RSMongoClient) => {
  const app = express();

  app.use(express.static(path.resolve(__dirname, '../../client/dist')));

  app.use(morgan('dev'));
  app.use(cors());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.text());
  app.use(express.raw());
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  app.use('/country', getCountryRouter(mongoClient));
  app.use('/user', getUsersRouter(mongoClient));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
  });

  return app;
};
