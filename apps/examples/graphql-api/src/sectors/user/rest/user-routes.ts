import { Get, Controller } from 'routing-controllers';
import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';

const SECTOR = 'user';

@Controller(`/${SECTOR}`)
@injectable()
export class UserRestController extends AbstractRestController {
  readonly sectorName = SECTOR;
  constructor(@inject('ILogger') logger: ILogger) {
    super(logger, SECTOR);
  }

  @Get('/test-route')
  testRoute() {
    this.logger.info('User REST route hit');
    return 'User REST route OK';
  }

  async init() {
    // Async setup if needed
  }
} 