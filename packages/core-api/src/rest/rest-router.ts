import { Router } from 'express';
import { RestEndpointGroup } from './rest-endpoint-group';

export class RestRouter {
  public readonly router: Router;

  constructor() {
    this.router = Router();
  }

  /**
   * Add one or more RestEndpointGroups (sectors) to the router.
   */
  public addSectors(sectors: RestEndpointGroup[]): void {
    for (const sector of sectors) {
      sector.registerRoutes(this.router);
    }
  }
} 