import { Get }                                                      from 'routing-controllers';
import { RestController, RestSectorController, REST_API_BASE_PATH } from '@saga-soa/core-api/rest-controller';

const SECTOR = 'hello';

@RestSectorController(`/${REST_API_BASE_PATH}/${SECTOR}`)
export class HelloRest extends RestController {
  readonly sectorName = SECTOR;
  constructor() {
    super(SECTOR);
  }

  @Get('/test-route')
  testRoute() {
    return 'Hello';
  }
}
 