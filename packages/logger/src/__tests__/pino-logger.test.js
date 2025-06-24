import { PinoLogger } from '../pino-logger';
// Helper to mock process.stdout.isTTY
function withTTY(value, fn) {
    const original = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', { value, configurable: true });
    try {
        fn();
    }
    finally {
        if (original) {
            Object.defineProperty(process.stdout, 'isTTY', original);
        }
    }
}
describe('PinoLogger', () => {
    const baseConfig = {
        configType: 'PINO_LOGGER',
        level: 'info',
        prettyPrint: false,
    };
    afterEach(() => {
        jest.resetModules();
        delete process.env.NODE_ENV;
    });
    it('should use isExpressContext from config (DI)', () => {
        const config = { ...baseConfig, isExpressContext: true };
        withTTY(true, () => {
            process.env.NODE_ENV = 'development';
            expect(() => new PinoLogger(config)).not.toThrow();
        });
    });
    it('should detect isForeground using process.stdout.isTTY', () => {
        const config = { ...baseConfig, isExpressContext: true };
        process.env.NODE_ENV = 'development';
        let logger;
        withTTY(true, () => {
            expect(() => { logger = new PinoLogger(config); }).not.toThrow();
        });
        withTTY(false, () => {
            expect(() => { logger = new PinoLogger(config); }).not.toThrow();
        });
    });
    it('should throw if logFile is missing in production Express context', () => {
        const config = { ...baseConfig, isExpressContext: true };
        process.env.NODE_ENV = 'production';
        withTTY(true, () => {
            expect(() => new PinoLogger(config)).toThrow(/logFile must be specified/);
        });
    });
    it('should not throw if logFile is present in production Express context', () => {
        const config = { ...baseConfig, isExpressContext: true, logFile: '/tmp/test.log' };
        process.env.NODE_ENV = 'production';
        withTTY(true, () => {
            expect(() => new PinoLogger(config)).not.toThrow();
        });
    });
    it('should instantiate both console and file loggers in local with logFile', () => {
        const config = { ...baseConfig, isExpressContext: false, logFile: '/tmp/test.log' };
        process.env.NODE_ENV = 'local';
        withTTY(true, () => {
            expect(() => new PinoLogger(config)).not.toThrow();
        });
    });
});
