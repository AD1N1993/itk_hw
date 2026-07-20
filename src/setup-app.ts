import express, { Express } from 'express';
import { videoRouter } from './videos/routers/videos.roter';
import { testingRouter } from './testing/routers/testing.router';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  // роуты доступны и с префиксом задания, и по «голым» путям —
  // чтобы тест-раннер попал в цель при любом base URL
  app.use('/hometask_01/api/videos', videoRouter);
  app.use('/hometask_01/api/testing', testingRouter);
  app.use('/videos', videoRouter);
  app.use('/testing', testingRouter);

  app.use('/ht_02/api/blogs', blogsRouter);
  app.use('/ht_02/api/posts', postsRouter);
  app.use('/ht_02/api/testing', testingRouter);
  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);

  return app;
};
