import { injectable, inject } from 'inversify';
import type { GQLServerConfig } from './gql-server-schema.js';
import type { ILogger } from '@saga-soa/logger';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import type { Application } from 'express';

@injectable()
export class GQLServer {
  private apolloServer?: ApolloServer;

  constructor(
    @inject('GQLServerConfig') private config: GQLServerConfig,
    @inject('ILogger') private logger: ILogger
  ) {}

  public async init(container: any, resolvers: Array<new (...args: any[]) => any>): Promise<void> {
    // Ensure we have at least one resolver
    if (resolvers.length === 0) {
      throw new Error('At least one resolver is required');
    }

    // Build TypeGraphQL schema with dynamically loaded resolvers
    const schema = await buildSchema({
      resolvers: resolvers as unknown as [Function, ...Function[]],
    });

    // Set up ApolloServer v4+ with playground configuration
    this.apolloServer = new ApolloServer({
      schema,
      introspection: this.config.enablePlayground,
      // Disable landing page if playground is disabled
      plugins: this.config.enablePlayground
        ? []
        : [
            {
              async serverWillStart() {
                return {
                  async drainServer() {
                    // Disable landing page
                  },
                };
              },
            },
          ],
    });
    await this.apolloServer.start();
  }

  public mountToApp(app: Application, basePath?: string): void {
    if (!this.apolloServer) {
      throw new Error('GQLServer must be initialized before mounting to app');
    }

    // Calculate the full mount path by combining basePath and mountPoint
    const fullMountPath = basePath
      ? `${basePath}${this.config.mountPoint}`
      : this.config.mountPoint;

    // Mount Apollo middleware at the calculated mount point
    // @ts-expect-error Apollo Server v4+ middleware type mismatch with Express
    app.use(fullMountPath, expressMiddleware(this.apolloServer, { context: async () => ({}) }));

    this.logger.info(`GraphQL server '${this.config.name}' mounted at '${fullMountPath}'`);

    // Log playground status
    if (this.config.enablePlayground) {
      this.logger.info(`GraphQL playground enabled and accessible at '${fullMountPath}'`);
    } else {
      this.logger.info(`GraphQL playground disabled for '${this.config.name}'`);
    }
  }

  public async stop(): Promise<void> {
    if (this.apolloServer) {
      await this.apolloServer.stop();
      this.logger.info(`GraphQL server '${this.config.name}' stopped.`);
    }
  }

  public getApolloServer(): ApolloServer | undefined {
    return this.apolloServer;
  }
}
