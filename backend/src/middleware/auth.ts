import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { toNodeHandler } from 'better-auth/node';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const handler = toNodeHandler(auth);
  await handler(req, res);
  next();
};

export const getSession = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });
  return session;
};