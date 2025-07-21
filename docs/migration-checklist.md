# Migration Checklist: Workspace to Registry

This checklist helps you migrate from workspace dependencies to published packages from a private npm registry.

## Pre-Migration Checklist

- [ ] Set up private npm registry access
- [ ] Obtain authentication token for registry
- [ ] Test registry authentication locally
- [ ] Choose versioning strategy for packages

## Step 1: Prepare Packages for Publishing

### Update Package Configurations
- [ ] Add `publishConfig` to each package.json:
  ```json
  {
    "publishConfig": {
      "registry": "https://your-registry.com",
      "access": "restricted"
    }
  }
  ```

### Verify Package Exports
- [ ] Ensure all packages have proper `main` and `exports` fields
- [ ] Test package imports work correctly
- [ ] Check TypeScript type definitions are exported

### Version Management
- [ ] Set initial versions (e.g., 1.0.0) in all packages
- [ ] Document versioning strategy
- [ ] Consider using semantic versioning

## Step 2: Publish Packages

### Initial Publication
- [ ] Authenticate with registry: `npm login --registry=https://your-registry.com`
- [ ] Publish all packages: `pnpm -r publish --access restricted`
- [ ] Verify packages are available: `npm view @saga/soa-core-api --registry=https://your-registry.com`

### Test Package Installation
- [ ] Create test directory outside workspace
- [ ] Install packages from registry: `npm install @saga/soa-core-api@1.0.0`
- [ ] Test imports work correctly

## Step 3: Update Application Dependencies

### REST API Application
- [ ] Update `apps/examples/rest-api/package.json`:
  ```json
  {
    "dependencies": {
      "@saga/soa-core-api": "^1.0.0",
      "@saga/soa-db": "^1.0.0",
      "@saga/soa-logger": "^1.0.0"
    }
  }
  ```

### GraphQL API Application
- [ ] Update `apps/examples/graphql-api/package.json`:
  ```json
  {
    "dependencies": {
      "@saga/soa-core-api": "^1.0.0",
      "@saga/soa-db": "^1.0.0",
      "@saga/soa-logger": "^1.0.0"
    }
  }
  ```

### Update Lockfile
- [ ] Remove old lockfile: `rm pnpm-lock.yaml`
- [ ] Install with registry packages: `pnpm install`
- [ ] Test applications run locally

## Step 4: Update Docker Configuration

### Dockerfile Updates
- [ ] Add NPM_TOKEN build argument to Dockerfiles
- [ ] Configure registry in Dockerfiles
- [ ] Remove packages folder copying (no longer needed)
- [ ] Update build commands to pass NPM_TOKEN

### Build Scripts
- [ ] Create `scripts/build-docker.sh` with registry token
- [ ] Update CI/CD pipelines with NPM_TOKEN secret
- [ ] Test Docker builds locally

### Docker Compose
- [ ] Update docker-compose.yml with build args
- [ ] Test multi-container deployment

## Step 5: Testing

### Local Testing
- [ ] Test Docker builds: `docker build --build-arg NPM_TOKEN=token ...`
- [ ] Test container runtime: `docker run -p 3000:3000 saga-rest-api:latest`
- [ ] Verify API endpoints work correctly
- [ ] Test GraphQL API functionality

### Integration Testing
- [ ] Test all containers together
- [ ] Verify inter-service communication
- [ ] Test with production-like environment

## Step 6: Documentation

### Update Documentation
- [ ] Update README with new build instructions
- [ ] Document registry setup process
- [ ] Add troubleshooting guide
- [ ] Update deployment documentation

### Developer Onboarding
- [ ] Update developer setup instructions
- [ ] Document registry access requirements
- [ ] Create troubleshooting guide

## Step 7: Deployment

### CI/CD Pipeline
- [ ] Add NPM_TOKEN to CI/CD secrets
- [ ] Update build pipelines
- [ ] Test automated deployments
- [ ] Monitor deployment health

### Production Deployment
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Deploy to production
- [ ] Monitor application health

## Post-Migration Cleanup

### Optional Cleanup
- [ ] Remove packages folder from Dockerfiles (if no longer building from source)
- [ ] Clean up workspace references in documentation
- [ ] Remove unused development dependencies

### Monitoring
- [ ] Monitor package download metrics
- [ ] Track deployment success rates
- [ ] Monitor application performance

## Rollback Plan

### Emergency Rollback
- [ ] Keep old Dockerfiles as backup
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Maintain old package versions

## Benefits After Migration

✅ **Resolved Issues:**
- No more symlink issues in Docker containers
- Proper Node.js module resolution
- Production-ready dependency management
- Better caching in Docker builds

✅ **Improved Workflow:**
- Explicit version control for internal packages
- Better separation of concerns
- Standard npm ecosystem practices
- Easier CI/CD integration

## Common Issues and Solutions

### Package Not Found
```bash
# Check registry configuration
npm config list
# Test package availability
npm view @saga/soa-core-api --registry=https://your-registry.com
```

### Authentication Issues
```bash
# Re-authenticate
npm login --registry=https://your-registry.com
# Check whoami
npm whoami --registry=https://your-registry.com
```

### Docker Build Failures
```bash
# Build with verbose output
docker build --no-cache --progress=plain \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  -t saga-rest-api:debug \
  -f apps/examples/rest-api/Dockerfile .
```