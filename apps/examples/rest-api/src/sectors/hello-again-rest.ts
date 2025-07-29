import { Get, Controller }                                                    from 'routing-controllers';
import { inject }                                                             from 'inversify';
import type { ILogger }                                                       from '@saga-soa/logger';
import { AbstractRestController, REST_API_BASE_PATH }                             from '@saga-soa/core-api/abstract-rest-controller';
import { injectable } from 'inversify';

const SECTOR = 'hello-again';

@Controller(`/${REST_API_BASE_PATH}/${SECTOR}`)
@injectable()
export class HelloAgainRest extends AbstractRestController {
  readonly sectorName = SECTOR;
  constructor(@inject('ILogger') logger: ILogger) { super(logger, SECTOR); }

  @Get('/test-route')
  testRoute() {
    this.logger.info('Hello again route hit');
    return 'Hello again!';
  }

  async init() {
    // Async setup if needed
  }
}