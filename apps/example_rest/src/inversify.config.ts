import { Container, interfaces } from 'inversify';
import { RestEndpointGroup } from '@saga-soa/core-api/rest/rest-endpoint-group';
import { HelloRest } from './sectors/hello-rest.js';

export const TYPES = {
  RestEndpointGroup: Symbol.for('RestEndpointGroup'),
};

const container = new Container();

// Multi-binding for sectors
container.bind<RestEndpointGroup>(TYPES.RestEndpointGroup).to(HelloRest);

export { container }; 