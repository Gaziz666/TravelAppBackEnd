import express from 'express';
import { check, body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getUsersService } from './users.service';
import { RSMongoClient } from '../../db-client/mongo-client';
import { User } from './users.types';

export const getUsersRouter = (mongoClient: RSMongoClient) => {
  console.log('router work');
  const router = express.Router();
  const usersService = getUsersService(mongoClient);

  // router.post('/login', async (req, res) => {
  //   const validateErr = validationResult(req);
  //   if (!validateErr.isEmpty()) {
  //     return res.status(400).json({ errors: validateErr.array()[0] });
  //   }

  //   try {
  //     const isNameExist: {
  //       data: User | null;
  //     } = await usersService.findByName(req.body.name);
  //     if (!isNameExist.data) {
  //       throw new Error('Login is wrong');
  //     }

  //     const validPassword = await bcrypt.compare(
  //       req.body.password,
  //       isNameExist.data?.password
  //     );
  //     if (!validPassword) {
  //       throw new Error('Password is wrong');
  //     }

  //     const payLoad = { name: isNameExist.data.name };

  //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //     const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);

  //     res.header('auth-token', token).json({
  //       error: null,
  //       token: { token },
  //       data: isNameExist.data,
  //     });
  //   } catch (err) {
  //     return res.status(400).json({
  //       errors: err.message,
  //     });
  //   }
  // });

  router.post(
    '/register',
    body('password').isLength({ min: 6 }),
    // .withMessage({
    //   en: 'password must be at least 6 chars long',
    //   ru: 'пароль не менее 6 символов',
    //   uk: 'пароль не менше 6 символів',
    // }),
    body('email').isEmail(),
    // .withMessage({
    //   en: 'incorrect form of email',
    //   ru: 'эл адрес не корректен',
    //   uk: 'ел адреса не коректний',
    // }),
    async (req, res, next) => {
      const errors = validationResult(req);
      console.log('err', errors, req.body);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0] });
      }
      console.log('err', errors);
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
        const isNameExist: {
          data: User | null;
        } = await usersService.findByEmail(req.body.email);
        if (isNameExist.data) {
          throw new Error('email is already exists');
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
          email: req.body.email,
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
