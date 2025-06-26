import { Controller, Get } from 'routing-controllers';

@Controller('/saga-soa/hello-again')
export class HelloAgainRest {
  @Get('/hello-again')
  helloAgainRoute() {
    return 'Hello again!';
  }

  @Get('/goodbye')
  goodbyeRoute() {
    return 'Goodbye!';
  }
}