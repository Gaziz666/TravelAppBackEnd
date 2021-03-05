import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import { RSMongoClient } from './db-client/mongo-client';
import path from 'path';
import { getCountryRouter } from './modules/country/country.router';

export const createApp = (mongoClient: RSMongoClient) => {
  const app = express();

  app.use(express.static(path.resolve(__dirname, '../../client/dist')));

  app.use(morgan('dev'));
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/country', getCountryRouter(mongoClient));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
  });

  return app;
};