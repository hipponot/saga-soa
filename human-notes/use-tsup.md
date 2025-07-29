Perfect! Now I can see the key differences. The working my-turborepo project uses:
moduleResolution: "Bundler" (not NodeNext)
allowImportingTsExtensions: true
tsup for building (which handles the extension resolution)
Plan
Key Configuration Differences Found:
Module Resolution: The working project uses "moduleResolution": "Bundler" instead of "NodeNext"
Allow Importing TS Extensions: The working project has "allowImportingTsExtensions": true
Build Tool: Uses tsup instead of tsc for building
Proposed Solution:
Instead of requiring explicit .js extensions in imports, we should:
Update the TypeScript configuration to use "moduleResolution": "Bundler" and add "allowImportingTsExtensions": true
Switch from tsc to tsup for building the core-api package
Keep the existing relative imports without .js extensions
Benefits:
Maintains cleaner import syntax
Compatible with modern bundlers
Follows the pattern of the working example
No need to update all existing imports
Implementation Steps:
Update packages/typescript-config/base.json to include the bundler-friendly settings
Update packages/core-api/tsconfig.json to extend the updated base config
Add tsup as a build tool for core-api
Create tsup.config.ts for the core-api package
Update package.json to use tsup instead of tsc
Rebuild and test
