import { Controller, Get } from 'routing-controllers';

@Controller('/saga-soa/hello')
export class HelloRest {
  @Get('/hello')
  helloRoute() {
    return 'Hello';
  }
} 