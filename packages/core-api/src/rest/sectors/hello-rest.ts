import { Router, Request, Response } from 'express';
import { RestEndpointGroup } from '../rest-endpoint-group';

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