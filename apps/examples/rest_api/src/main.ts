import express              from 'express';
import { useExpressServer } from 'routing-controllers';
import { RestController }   from '@saga-soa/core-api/rest-controller';
import './sectors/hello-rest';
import './sectors/hello-again-rest';

const app = express();

// Register controllers with routing-controllers
useExpressServer(app, {
  controllers: RestController.getRegisteredControllers(),
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Example REST server running at http://localhost:${PORT}/saga-soa/hello`);
});