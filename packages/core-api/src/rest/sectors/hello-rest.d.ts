import { Router } from 'express';
import { RestEndpointGroup } from '../rest-endpoint-group';
export declare class HelloRest extends RestEndpointGroup {
    constructor();
    protected registerSectorRoutes(router: Router, sectorBase: string): void;
    private helloRoute;
}
//# sourceMappingURL=hello-rest.d.ts.map