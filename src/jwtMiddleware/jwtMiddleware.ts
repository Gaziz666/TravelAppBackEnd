import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).send();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const verified = jwt.verify(token, process.env.TOKEN_SECRET!);
    // req.user = verified;
    console.log('verified', verified);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token is invalid' });
  }
};
