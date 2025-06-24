import { Router, Request, Response } from 'express';
import figlet from 'figlet';

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
   */
  public registerRoutes(router: Router): void {
    const sectorBase = `${this.apiBaseUrl}/${this.sectorName}`;
    router.get(`${sectorBase}/alive`, this.aliveRoute());
    router.get(sectorBase, this.sectorHomeRoute());
    this.registerSectorRoutes(router, sectorBase);
  }

  /**
   * Implement in subclass to register sector-specific routes.
   */
  protected abstract registerSectorRoutes(router: Router, sectorBase: string): void;
} 