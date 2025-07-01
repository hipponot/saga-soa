import { Get }                                                                                     from 'routing-controllers';
import { inject }                                                                                  from 'inversify';
import type { ILogger }                                                                            from '@saga-soa/logger';
import { RestControllerBase, RestController, REST_API_BASE_PATH }                                  from '@saga-soa/core-api/rest-controller';

const SECTOR = 'hello';

@RestController(`/${REST_API_BASE_PATH}/${SECTOR}`)
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
}

