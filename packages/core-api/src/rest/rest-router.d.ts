import { Router } from 'express';
import { RestEndpointGroup } from './rest-endpoint-group';
export declare class RestRouter {
    readonly router: Router;
    constructor();
    /**
     * Add one or more RestEndpointGroups (sectors) to the router.
     */
    addSectors(sectors: RestEndpointGroup[]): void;
}
//# sourceMappingURL=rest-router.d.ts.map