import { Get } from 'routing-controllers';
import figlet  from 'figlet';

export const REST_API_BASE_PATH = 'saga-soa';

export function RestController(path: string) {
  return function (target: any) {
    if (typeof target.registerController === 'function') {
      target.registerController(target);
    }
  };
}

export abstract class RestControllerBase {
  private static _controllers: Function[] = [];

  static registerController(controller: Function) {
    RestControllerBase._controllers.push(controller);
  }

  static getRegisteredControllers() {
    return RestControllerBase._controllers;
  }

  abstract readonly sectorName: string;

  constructor(public readonly _sectorName: string) {}

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