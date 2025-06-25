import { Router, Request, Response } from 'express';
import figlet                        from 'figlet';
import { resolve }                   from 'path';
// import { getRestRouteDefinitions } from './rest-decorators';

export abstract class RestEndpointGroup {
  public readonly sectorName: string;
  private sectorSplashCache?: string;
  public readonly apiBaseUrl: string;

  constructor(sectorName: string, apiBaseUrl = '/saga-soa') {
    this.sectorName = sectorName;
    this.apiBaseUrl = apiBaseUrl;
  }

  public get sectorSplash(): string {
    if (!this.sectorSplashCache) {
      this.sectorSplashCache = figlet.textSync(this.sectorName, { font: 'Alligator' });
    }
    return `<pre>${this.sectorSplashCache}</pre>`;
  }

  protected sectorHomeRoute(): (req: Request, res: Response) => void {
    return (req, res) => {
      res.send(this.sectorSplash);
    };
  }

  protected aliveRoute(): (req: Request, res: Response) => void {
    return (req, res) => {
      res.json({ status: 'alive', sector: this.sectorName });
    };
  }

  /**
   * Register all routes for this sector with the given router.
   * Should be called by RestRouter.
   *
   * If the subclass provides routing-controllers controllers via getRoutingControllers(),
   * they will be auto-registered. Otherwise, falls back to manual registration.
   */
  public registerRoutes(router: Router): void {
    const sectorBase = `${this.apiBaseUrl}/${this.sectorName}`;
    router.get(`${sectorBase}/alive`, this.aliveRoute());
    router.get(sectorBase, this.sectorHomeRoute());

    // Auto-register routing-controllers controllers if provided
    const controllers = this.getRoutingControllers();
    if (controllers && controllers.length > 0) {
      // Note: Actual registration with routing-controllers must be done at the app level
      // (e.g., via useExpressServer), so here we just expose the controllers for registration.
      // You may want to collect these from all sectors and register them in your main app entrypoint.
      // For now, we fallback to manual registration if not using routing-controllers.
      // (No-op here, but subclasses can override this method to integrate with routing-controllers)
      return;
    }

    // Fallback to manual registration
    this.registerSectorRoutes(router, sectorBase);
  }

  /**
   * Subclasses can override to return an array of routing-controllers controller classes.
   * By default, returns an empty array (manual registration).
   */
  protected getRoutingControllers(): Function[] {
    return [];
  }

  /**
   * Implement in subclass to register sector-specific routes.
   */
  protected abstract registerSectorRoutes(router: Router, sectorBase: string): void;
}
