import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../types/http-statuses';
import { SETTINGS } from '../../settings/config';

const LOGIN = SETTINGS.ADMIN_USERNAME;
const PASSWORD = SETTINGS.ADMIN_PASSWORD;

export const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const base64Credentials = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [login, password] = decoded.split(':');

  if (login !== LOGIN || password !== PASSWORD) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  next();
};
