import { Get } from 'routing-controllers';
import { RestControllerBase, RestController, REST_API_BASE_PATH } from '@saga-soa/core-api/rest-controller';

const SECTOR = 'hello';

@RestController(`/${REST_API_BASE_PATH}/${SECTOR}`)
export class HelloRest extends RestControllerBase {
  readonly sectorName = SECTOR;
  constructor() { super(SECTOR); }

  @Get('/test-route')
  testRoute() {
    return 'Hello';
  }
}
 