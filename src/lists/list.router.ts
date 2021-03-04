import express from 'express';

import { getListsService } from './list.service';
import { RSMongoClient } from '../db-client/mongo-client';

export const getListsRouter = (mongoClient: RSMongoClient) => {
  const router = express.Router();
  const listsService = getListsService(mongoClient);

  router.post(`/new`, async (req, res, next) => {
    try {
      const data = await listsService.create(req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.post(`/all`, async (req, res, next) => {
    try {
      const data = await listsService.findAllByUserBoard(req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.delete(`/:id`, async (req, res, next) => {
    try {
      const data = await listsService.remove(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.delete(`/deleteAll/:id`, async (req, res, next) => {
    try {
      const data = await listsService.deleteAllByListId(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.put(`/:id`, async (req, res, next) => {
    try {
      const data = await listsService.update(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
