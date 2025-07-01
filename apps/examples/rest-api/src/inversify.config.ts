import { Container } from 'inversify';
import { ILogger, PinoLogger, PinoLoggerConfig } from '@saga-soa/logger';
import { HelloRest } from './sectors/hello-rest';

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

// Bind HelloRest controller for DI
container.bind(HelloRest).toSelf();

export { container };