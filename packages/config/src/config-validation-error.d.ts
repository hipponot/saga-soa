import { z } from 'zod';
export declare class ConfigValidationError extends Error {
    readonly configType: string;
    readonly validationError: z.ZodError;
    constructor(configType: string, validationError: z.ZodError);
}
//# sourceMappingURL=config-validation-error.d.ts.map