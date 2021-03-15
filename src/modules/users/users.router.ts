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
      return res.status(400).json({ error: validateErr.array()[0] });
    }

    try {
      const isLoginExist: {
        data: User | null;
      } = await usersService.findByLogin(req.body.login);
      if (!isLoginExist.data) {
        throw new Error('login');
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        isLoginExist.data?.password
      );
      if (!validPassword) {
        throw new Error('password');
      }

      const payLoad = { login: isLoginExist.data.login };

      const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);
      console.log('payload', payLoad);
      res.header('auth-token', token).json({
        error: null,
        token: { token },
        data: {
          userLogin: isLoginExist.data.login,
          userEmail: isLoginExist.data.email,
          userName: isLoginExist.data.name,
        },
      });
    } catch (err) {
      let error = {};
      if (err.message === 'password') {
        error = errMessage.passwordWrong;
      } else if (err.message === 'login') {
        error = errMessage.loginWrong;
      }
      return res.status(400).json({
        error: error,
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
      const error = validationResult(req);

      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array()[0] });
      }

      try {
        const isLoginExist: {
          data: User | null;
        } = await usersService.findByLogin(req.body.login);
        if (isLoginExist.data) {
          throw new Error();
        }
      } catch (err) {
        return res.status(400).json({
          error: errMessage.loginRepeat,
        });
      }

      try {
        const isLoginExist: {
          data: User | null;
        } = await usersService.findByEmail(req.body.email);
        if (isLoginExist.data) {
          throw new Error();
        }
      } catch (err) {
        return res.status(400).json({
          error: errMessage.emailRepeat,
        });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        const data = await usersService.create({
          login: req.body.login,
          email: req.body.email,
          password,
        });

        const payLoad = { login: data.data.login };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const token = jwt.sign(payLoad, process.env.TOKEN_SECRET!);

        res.header('auth-token', token).json({
          error: null,
          token: { token },
          data: {
            userLogin: data.data.login,
            userEmail: data.data.email,
            userName: data.data.name,
          },
        });
      } catch (err) {
        res.send('error');
        next(err);
      }
    }
  );

  return router;
};
