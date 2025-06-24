import { RestEndpointGroup } from '../rest-endpoint-group';
export class HelloRest extends RestEndpointGroup {
    constructor() {
        super('hello');
    }
    registerSectorRoutes(router, sectorBase) {
        router.get(`${sectorBase}/hello`, this.helloRoute());
    }
    helloRoute() {
        return (req, res) => {
            res.send('Hello');
        };
    }
}
