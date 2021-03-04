import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getUsersService } from './users.service';
import { RSMongoClient } from '../db-client/mongo-client';
import { User } from './users.types';

export const getUsersRouter = (mongoClient: RSMongoClient) => {
  const router = express.Router();
  const usersService = getUsersService(mongoClient);

  router.post('/login', async (req, res) => {
    const validateErr = validationResult(req);
    if (!validateErr.isEmpty()) {
      return res.status(400).json({ errors: validateErr.array()[0] });
    }

    try {
      const isNameExist: {
        data: User | null;
      } = await usersService.findByName(req.body.name);
      if (!isNameExist.data) {
        throw new Error('Login is wrong');
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        isNameExist.data?.password
      );
      if (!validPassword) {
        throw new Error('Password is wrong');
      }

      const payLoad = { name: isNameExist.data.name };

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);

      res.header('auth-token', token).json({
        error: null,
        token: { token },
        data: isNameExist.data,
      });
    } catch (err) {
      return res.status(400).json({
        errors: err.message,
      });
    }
  });

  router.post(
    '/register',
    check('password')
      .isLength({ min: 6 })
      .withMessage('password must be at least 6 chars long '),
    check('name').isEmail().withMessage('login must be a email'),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0] });
      }

      try {
        const isNameExist: {
          data: User | null;
        } = await usersService.findByName(req.body.name);
        if (isNameExist.data) {
          throw new Error('login is already exists');
        }
      } catch (err) {
        return res.status(400).json({
          errors: err.message,
        });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        const data = await usersService.create({
          name: req.body.name,
          password,
        });

        const payLoad = { name: data.data.name };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);

        res.header('auth-token', token).json({
          error: null,
          token: { token },
          data: data.data,
        });
      } catch (err) {
        res.send('error');
        next(err);
      }
    }
  );

  return router;
};
