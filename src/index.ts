import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './settings/config';
import { runDB } from './db/mongo.db';

const app = express();
setupApp(app);

if (require.main === module) {
  // Локальный запуск (node dist/index.js): ждём подключения к БД,
  // затем поднимаем HTTP-сервер на порту.
  runDB(SETTINGS.MONGO_URL)
    .then(() => {
      app.listen(SETTINGS.PORT, () => {
        console.log(`Example app listening on port ${SETTINGS.PORT}`);
      });
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

// экспорт для Vercel (serverless-хендлер).
// Подключение к Mongo для serverless-окружения выполняется лениво
// в middleware (см. ensureDbConnected в setup-app.ts) — так соединение
// переиспользуется между вызовами функции, а не открывается на каждый запрос.
export default app;
