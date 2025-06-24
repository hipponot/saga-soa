import { Router, Request, Response } from 'express';
export declare abstract class RestEndpointGroup {
    readonly sectorName: string;
    private sectorSplashCache?;
    readonly apiBaseUrl: string;
    constructor(sectorName: string, apiBaseUrl?: string);
    get sectorSplash(): string;
    protected sectorHomeRoute(): (req: Request, res: Response) => void;
    protected aliveRoute(): (req: Request, res: Response) => void;
    /**
     * Register all routes for this sector with the given router.
     * Should be called by RestRouter.
     */
    registerRoutes(router: Router): void;
    /**
     * Implement in subclass to register sector-specific routes.
     */
    protected abstract registerSectorRoutes(router: Router, sectorBase: string): void;
}
//# sourceMappingURL=rest-endpoint-group.d.ts.map