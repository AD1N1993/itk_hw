import express, { Express } from 'express';
import { videoRouter } from './videos/routers/videos.roter';
import { testingRouter } from './testing/routers/testing.router';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/hometask_01/api/videos', videoRouter);
  app.use('/hometask_01/api/testing', testingRouter);

  return app;
};
