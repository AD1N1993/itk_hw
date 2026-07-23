import express, { Express, NextFunction, Request, Response } from 'express';
import { videoRouter } from './videos/routers/videos.roter';
import { testingRouter } from './testing/routers/testing.router';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { ensureDbConnected } from './db/mongo.db';
import { BLOGS_PATH } from './blogs/constants/blogs.paths';
import { POSTS_PATH } from './posts/constants/posts.paths';
import { TESTING_PATH } from './testing/constants/testing.paths';

// Гарантирует, что подключение к MongoDB установлено до того, как запрос
// дойдёт до роутера. В serverless-окружении (Vercel) каждый холодный старт
// вызовет runDB один раз, дальше промис уже готов и middleware не тормозит.
const dbConnectionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await ensureDbConnected();
    next();
  } catch (e) {
    next(e);
  }
};

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса
  app.use(dbConnectionMiddleware); // подключение к MongoDB перед любым роутом

  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/hometask_01/api/videos', videoRouter);
  app.use('/hometask_01/api/testing', testingRouter);

  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(TESTING_PATH, testingRouter);

  return app;
};
