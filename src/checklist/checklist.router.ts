import express from 'express';

import { getChecklistsService } from './checklist.service';
import { RSMongoClient } from '../db-client/mongo-client';

export const getChecklistsRouter = (mongoClient: RSMongoClient) => {
  const router = express.Router();
  const checklistsService = getChecklistsService(mongoClient);

  router.post(`/newChecklist`, async (req, res, next) => {
    try {
      const data = await checklistsService.create(req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  // router.post(`/all`, async (req, res, next) => {
  //   try {
  //     const data = await listsService.findAllByUserBoard(req.body);
  //     res.json({ data });
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  router.delete(`/:id`, async (req, res, next) => {
    try {
      const data = await checklistsService.remove(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  // router.delete(`/deleteAll/:id`, async (req, res, next) => {
  //   try {
  //     const data = await listsService.deleteAllByListId(req.params.id);
  //     res.json({ data });
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  router.put(`/:id`, async (req, res, next) => {
    try {
      const data = await checklistsService.update(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.put(`/addNewCheckbox/:id`, async (req, res, next) => {
    try {
      const data = await checklistsService.addNewCheckbox(
        req.params.id,
        req.body
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
