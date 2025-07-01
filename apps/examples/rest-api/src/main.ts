import express                              from 'express';
import { useExpressServer, useContainer }   from 'routing-controllers';
import { RestControllerBase }               from '@saga-soa/core-api/rest-controller';
import './sectors/hello-rest';
import './sectors/hello-again-rest';
import { container }                        from './inversify.config';
import type { ILogger }                     from '@saga-soa/logger';

const app = express();

// Enable Inversify DI for routing-controllers
useContainer(container);
// Register controllers with routing-controllers
useExpressServer(app, {
  controllers: RestControllerBase.getRegisteredControllers(),
});

const PORT = process.env.PORT || 3000;
const logger = container.get<ILogger>('ILogger');
app.listen(PORT, () => {
  logger.info(`Example REST server running at http://localhost:${PORT}/saga-soa/hello`);
});