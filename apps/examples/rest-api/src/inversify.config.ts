import 'reflect-metadata';
import { Container } from 'inversify';
import { ILogger, PinoLogger, PinoLoggerConfig } from '@saga-soa/logger';
import * as controllers from './sectors';

const container = new Container();

// Example config for PinoLogger
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// Auto-bind only classes decorated with @Controller
Object.values(controllers).forEach(ctrl => {
  if (
    typeof ctrl === 'function' &&
    Reflect.hasMetadata('routing-controllers:controller', ctrl)
  ) {
    container.bind(ctrl).toSelf();
  }
});

export { container };