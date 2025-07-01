import express                            from 'express';
import { useExpressServer, useContainer } from 'routing-controllers';
import * as controllers                   from './sectors';
import { container }                      from './inversify.config';
import type { ILogger }                   from '@saga-soa/logger';

const app = express();

// Enable Inversify DI for routing-controllers
useContainer(container);

// Register controllers with routing-controllers
useExpressServer(app, {
  controllers: Object.values(controllers).filter(c => typeof c === 'function'),
});

const PORT = process.env.PORT || 3000;
const logger = container.get<ILogger>('ILogger');
app.listen(PORT, () => {
  logger.info(`Example REST server running at http://localhost:${PORT}/saga-soa/hello`);
});