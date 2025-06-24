export class ConfigValidationError extends Error {
    configType;
    validationError;
    constructor(configType, validationError) {
        super(`Configuration validation failed for ${configType}`);
        this.configType = configType;
        this.validationError = validationError;
        this.name = 'ConfigValidationError';
    }
}
