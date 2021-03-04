import express from 'express';
import { getBoardsService } from './boards.service';
import { RSMongoClient } from '../db-client/mongo-client';

export const getBoardsRouter = (mongoClient: RSMongoClient) => {
  const router = express.Router();
  const boardsService = getBoardsService(mongoClient);

  router.get(`/`, async (req, res, next) => {
    try {
      const data = await boardsService.findAll();

      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.get(`/:id`, async (req, res, next) => {
    try {
      const data = await boardsService.findByUserName(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.post(`/newBoard`, async (req, res, next) => {
    try {
      const data = await boardsService.create(req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.put(`/:id`, async (req, res, next) => {
    try {
      const data = await boardsService.update(req.params.id, req.body);

      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.delete(`/:id`, async (req, res, next) => {
    console.log(req.params.id);
    try {
      const data = await boardsService.remove(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
