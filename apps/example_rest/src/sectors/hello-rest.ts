import { Router, Request, Response } from 'express';
import { injectable } from 'inversify';
import { RestEndpointGroup } from '@saga-soa/core-api/rest/rest-endpoint-group';

@injectable()
export class HelloRest extends RestEndpointGroup {
  constructor() {
    super('hello');
  }

  protected registerSectorRoutes(router: Router, sectorBase: string): void {
    router.get(`${sectorBase}/hello`, this.helloRoute());
  }

  private helloRoute() {
    return (req: Request, res: Response) => {
      res.send('Hello');
    };
  }
} 