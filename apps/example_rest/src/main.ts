import 'reflect-metadata';
import express from 'express';
import { container, TYPES } from './inversify.config.js';
import { RestRouter } from '@saga-soa/core-api/rest/rest-router';
import { RestEndpointGroup } from '@saga-soa/core-api/rest/rest-endpoint-group';

const app = express();

// Resolve all sectors (RestEndpointGroup instances)
const sectors = container.getAll<RestEndpointGroup>(TYPES.RestEndpointGroup);

// Create and configure the RestRouter
const restRouter = new RestRouter();
restRouter.addSectors(sectors);

// Mount the router at the root
app.use(restRouter.router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Example REST server running at http://localhost:${PORT}/saga-soa/hello`);
});