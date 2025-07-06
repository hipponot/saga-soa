# Dynamic Controller Loader and Plugin Discovery Plan

## Feature Requirements

1. **Multiple Plugin Directories**
   - Support specifying one or more directories containing extensions of `RestControllerBase`.
2. **Dynamic Loading Encapsulated in RestControllerBase**
   - Logic for discovering/loading controllers is encapsulated in a static method (e.g., `RestControllerBase.loadControllers(pluginDir, container)`).
3. **Repeated Invocation and Registry Management**
   - Loader can be called multiple times for different or the same directories.
   - Registry tracks which controllers are loaded from which directory.
   - On repeated calls, reload new controllers and unload those no longer present.
   - Avoid duplicate registration.
4. **Robustness to Non-Controller Artifacts**
   - Loader ignores non-class exports and only registers classes extending `RestControllerBase`.
5. **Inversify Dependency Injection**
   - Controllers are registered with the Inversify container and instantiated via DI.
6. **Async Initialization**
   - Controllers provide an `async init()` method, called after construction.

## Hot Reloading and useExpressServer

- `useExpressServer` is not designed for repeated invocation on the same Express app instance.
- For hot reloading, a new Express app instance must be created and all controllers re-registered.
- Swapping the app instance in a running server is non-trivial and may require additional infrastructure.

## Suggested Implementation Plan

### A. Controller Loader Utility
- Implement a static method (e.g., `RestControllerBase.loadControllers(pluginDir, container)`) that:
  1. Scans the directory for `.ts`/`.js` files.
  2. Dynamically imports each file.
  3. Filters for classes extending `RestControllerBase`.
  4. Registers each with the Inversify container (if not already bound).
  5. Instantiates each via the container and awaits `init()`.
  6. Maintains a registry of loaded controllers per directory.

### B. Registry Management
- Track which controllers are loaded from which directory.
- On repeated calls, compare the current directory contents to the registry:
  - **Add** new controllers.
  - **Remove** controllers no longer present (optionally unbind from container).
  - **Ignore** already-loaded controllers.

### C. Robustness
- Only register classes that:
  - Are functions (constructor).
  - Extend `RestControllerBase`.
- Ignore all other exports.

### D. DI and Async Init
- After registering with the container, instantiate via `container.get()`.
- Await `init()` if present.

### E. Main Startup Logic
- For each plugin directory:
  - Call `RestControllerBase.loadControllers(pluginDir, container)`.
- Collect all loaded controller classes.
- Pass the full list to `useExpressServer` **once** at startup.

### F. Hot Reloading
- For true hot reloading:
  - Create a new Express app and re-register all controllers.
  - Swap the app instance in your server (e.g., using a proxy or by restarting the server).

## Summary Table

| Feature/Requirement         | Supported? | Notes                                                                 |
|----------------------------|------------|-----------------------------------------------------------------------|
| Multiple plugin dirs       | Yes        | Call loader for each dir, aggregate results                           |
| Dynamic loading            | Yes        | Use dynamic import, filter for RestControllerBase subclasses          |
| Repeated invocation        | Yes        | Registry tracks per-dir, supports add/remove                          |
| Robust to non-controllers  | Yes        | Filter for class, subclass of RestControllerBase                      |
| Inversify DI               | Yes        | Register with container, instantiate via container                    |
| Async init                 | Yes        | Await `init()` after construction                                     |
| Hot reloading              | Partial    | Requires new Express app, not natively supported by useExpressServer  |

---

**For further details or implementation, see the full plan in this file.** 