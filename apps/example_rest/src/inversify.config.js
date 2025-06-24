import { Container } from 'inversify';
import { HelloRest } from './sectors/hello-rest';
export const TYPES = {
    RestEndpointGroup: Symbol.for('RestEndpointGroup'),
};
const container = new Container();
// Multi-binding for sectors
container.bind(TYPES.RestEndpointGroup).to(HelloRest);
export { container };
