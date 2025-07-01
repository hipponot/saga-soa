import { Container }                             from 'inversify';           from 'inversify';    from 'routing-controllers';
import { injectable, inject }             from 'inversify';
import { HelloRest }                             from './sectors/hello-rest';from './sectors/hello-rest';saga-soa/logger';
import figlet                             from 'figlet';

export const REST_API_BASE_PATH = 'saga-soa';

export function RestController(path: string) {
  const controllerDecorator = Controller(path);
  return function (target: any) {
    // Apply the routing-controllers @Controller decorator
    controllerDecorator(target);
    // Auto-register for your own tracking
    if (typeof target.registerController === 'function') {
      target.registerController(target);
    }
  };
}

export abstract class RestControllerBase {
  private static _controllers: Function[] = [];
  protected logger: ILogger;

  static registerController(controller: Function) {
    RestControllerBase._controllers.push(controller);
  }

  static getRegisteredControllers() {
    return RestControllerBase._controllers;
  }

  abstract readonly sectorName: string;

  constructor(logger: ILogger, public readonly _sectorName: string) {
    this.logger = logger;
  }

  @Get('/')
  home() {
    const splash = figlet.textSync(this.sectorName, { font: 'Alligator' });
    return `<pre>${splash}</pre>`;
  }

  @Get('/alive')
  alive() {
    return { status: 'alive', sector: this.sectorName };
  }
}