# tRPC API Services

This directory contains the service modules for the tRPC API demo page, providing both curl and tRPC client approaches.

## Architecture

### Service Interface
All services implement the `ServiceInterface` which provides:
- `executeEndpoint(endpoint, input)` - Execute an API call
- `generateCode(endpoint, input)` - Generate code examples

### Services

#### `TrpcCurlService`
- Uses HTTP fetch requests to call tRPC endpoints
- Generates curl commands for code examples
- Provides syntax highlighting for curl commands
- No additional dependencies beyond standard fetch

#### `TrpcClientService`
- Uses the actual `@trpc/client` library
- Provides type safety through `@saga-soa/trpc-types`
- Generates tRPC client code examples
- Maintains separation from server dependencies
- Uses proper tRPC client with httpBatchLink

### Shared Types

#### `types.ts`
- `Endpoint` - Defines endpoint structure
- `ApiResponse` - Standard response format
- `ServiceInterface` - Contract for all services
- Re-exports all trpc-types for convenience

#### `endpoints.ts`
- Centralized endpoint definitions
- Sample input data for each endpoint
- Type-safe endpoint configuration

## Usage

The page component uses both services and provides a toggle between:
- **cURL Mode**: Traditional HTTP requests with curl examples
- **tRPC Client Mode**: Type-safe client calls with tRPC examples

## Benefits

1. **Separation of Concerns**: Each service handles its own approach
2. **Type Safety**: Full TypeScript support using `@saga-soa/trpc-types`
3. **No Server Dependencies**: Client only depends on types package
4. **Educational**: Users can compare both approaches side-by-side
5. **Maintainable**: Clean architecture makes code easy to extend

## File Structure

```
src/services/
├── types.ts                 # Shared interfaces and types
├── endpoints.ts             # Endpoint definitions
├── trpc-curl-service.ts    # cURL-based service
├── trpc-client-service.ts  # tRPC client service
└── README.md              # This documentation
``` 