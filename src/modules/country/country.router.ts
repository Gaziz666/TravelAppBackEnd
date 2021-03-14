import express from 'express';
import { getCountryService } from './country.service';
import { RSMongoClient } from '../../db-client/mongo-client';

export const getCountryRouter = (mongoClient: RSMongoClient) => {
  const router = express.Router();
  const countryService = getCountryService(mongoClient);

  router.get(`/`, async (req, res, next) => {
    try {
      const data = await countryService.findAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get(`/:id`, async (req, res, next) => {
    try {
      const data = await countryService.findById(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.post(`/newCountry`, async (req, res, next) => {
    try {
      const data = await countryService.create(req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
