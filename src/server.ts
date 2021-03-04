import dotenv from 'dotenv';
import { createApp } from './createApp';
import { createMongoClient } from './db-client/mongo-client';
dotenv.config();

const mongoClient = createMongoClient();

const app = createApp(mongoClient);

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.info(`Server is started on port ${PORT}`);

const createShutdownCallback = (
  signal: string,
  logLevel = `info`,
  exitCode = 0
) => (error: Error) => {
  console.log(logLevel, `Application exit by reason ${error}`);
  console.info(`stop app due to ${signal}`);

  // eslint-disable-next-line no-process-exit
  process.exit(exitCode);
};

process.on(`SIGTERM`, createShutdownCallback(`SIGTERM`));
process.on(`SIGINT`, createShutdownCallback(`SIGINT`));
process.on(
  `uncaughtException`,
  createShutdownCallback(`uncaughtException`, `error`, 1)
);
process.on(
  `unhandledRejection`,
  createShutdownCallback(`unhandledRejection`, `error`, 1)
);
