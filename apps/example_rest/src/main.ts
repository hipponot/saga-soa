import 'reflect-metadata';
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { HelloRest } from './sectors/hello-rest.js';
import { HelloAgainRest } from './sectors/hello-again-rest.js';

const app = express();

// Register controllers with routing-controllers
useExpressServer(app, {
  controllers: [HelloRest, HelloAgainRest],
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Example REST server running at http://localhost:${PORT}/saga-soa/hello`);
});