import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getUsersService } from './users.service';
import { RSMongoClient } from '../../db-client/mongo-client';
import { User } from './users.types';

const errMessage = {
  passwordLeng: {
    en: 'password must be at least 6 chars long',
    ru: 'пароль не менее 6 символов',
    uk: 'пароль не менше 6 символів',
  },
  passwordWrong: {
    en: 'password is wrong',
    ru: 'пароль не верный',
    uk: 'пароль невірний',
  },
  loginWrong: {
    en: 'incorrect login',
    ru: 'логин не корректен',
    uk: 'логин не коректний',
  },
  emailWrong: {
    en: 'incorrect form of email',
    ru: 'эл адрес не корректен',
    uk: 'ел адреса не коректний',
  },
  loginRepeat: {
    en: 'login is already exists',
    ru: 'логин уже использется',
    uk: 'логин вже використовується',
  },
  emailRepeat: {
    en: 'email is already exists',
    ru: 'эл-адрес уже использется',
    uk: 'ел-адреса вже використовується',
  },
};
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
        throw new Error('login');
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        isNameExist.data?.password
      );
      if (!validPassword) {
        throw new Error('password');
      }

      const payLoad = { name: isNameExist.data.name };

      const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);

      res.header('auth-token', token).json({
        error: null,
        token: { token },
        data: isNameExist.data,
      });
    } catch (err) {
      let error = {};
      if (err.message === 'password') {
        error = errMessage.passwordWrong;
      } else if (err.message === 'login') {
        error = errMessage.loginWrong;
      }
      return res.status(400).json({
        errors: error,
      });
    }
  });

  router.post(
    '/register',
    check('password').isLength({ min: 6 }).withMessage(errMessage.passwordLeng),
    check('email').isEmail().withMessage(errMessage.emailWrong),
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0] });
      }

      try {
        const isNameExist: {
          data: User | null;
        } = await usersService.findByName(req.body.name);
        if (isNameExist.data) {
          throw new Error();
        }
      } catch (err) {
        return res.status(400).json({
          errors: errMessage.loginRepeat,
        });
      }

      try {
        const isNameExist: {
          data: User | null;
        } = await usersService.findByEmail(req.body.email);
        if (isNameExist.data) {
          throw new Error();
        }
      } catch (err) {
        return res.status(400).json({
          errors: errMessage.emailRepeat,
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

  router.get(
    '/register',
    // body('password').isLength({ min: 6 }),
    // .withMessage({
    //   en: 'password must be at least 6 chars long',
    //   ru: 'пароль не менее 6 символов',
    //   uk: 'пароль не менше 6 символів',
    // }),
    // body('email').isEmail(),
    // .withMessage({
    //   en: 'incorrect form of email',
    //   ru: 'эл адрес не корректен',
    //   uk: 'ел адреса не коректний',
    // }),
    async (req, res, next) => {
      console.log('err', req.body);
    }
  );

  return router;
};
