import { Router } from 'express';
export class RestRouter {
    router;
    constructor() {
        this.router = Router();
    }
    /**
     * Add one or more RestEndpointGroups (sectors) to the router.
     */
    addSectors(sectors) {
        for (const sector of sectors) {
            sector.registerRoutes(this.router);
        }
    }
}
