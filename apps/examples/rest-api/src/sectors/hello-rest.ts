import { Get, Controller }                                                                                     from 'routing-controllers';
import { inject }                                                                                              from 'inversify';
import type { ILogger }                                                                                        from '@saga-soa/logger';
import { RestControllerBase, REST_API_BASE_PATH }                                                              from '@saga-soa/core-api/rest-controller';
import { injectable } from 'inversify';

const SECTOR = 'hello';

@Controller(`/${REST_API_BASE_PATH}/${SECTOR}`)
@injectable()
export class HelloRest extends RestControllerBase {
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

