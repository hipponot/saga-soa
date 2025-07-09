import { Get, Controller } from 'routing-controllers';
import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';
import { RestControllerBase, REST_API_BASE_PATH } from '@saga-soa/core-api/rest-controller';

const SECTOR = 'session';

@Controller(`/${REST_API_BASE_PATH}/${SECTOR}`)
@injectable()
export class SessionRestController extends RestControllerBase {
  readonly sectorName = SECTOR;
  constructor(@inject('ILogger') logger: ILogger) {
    super(logger, SECTOR);
  }

  @Get('/test-route')
  testRoute() {
    this.logger.info('Session REST route hit');
    return 'Session REST route OK';
  }

  async init() {
    // Async setup if needed
  }
} 