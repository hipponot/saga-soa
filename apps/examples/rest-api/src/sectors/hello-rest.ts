import { Get, Controller }                        from 'routing-controllers';
import type { Request, Response }                 from 'express';
import { injectable, inject }                     from 'inversify';
import type { ILogger }                           from '@saga-soa/logger';
import { AbstractRestController, REST_API_BASE_PATH } from '@saga-soa/core-api/abstract-rest-controller';

const SECTOR = 'hello';

@Controller(`/${REST_API_BASE_PATH}/${SECTOR}`)
@injectable()
export class HelloRest extends AbstractRestController {
  readonly sectorName = SECTOR;
  constructor(@inject('ILogger') logger: ILogger) {
    super(logger, SECTOR);
  }

  @Get('/test-route')
  testRoute() {
    this.logger.info('Hello route hit');
    return 'Hello';
  }

  async init() {
    // Async setup if needed
  }
}