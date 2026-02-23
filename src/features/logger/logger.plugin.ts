import { DefaultLogger } from './default-logger';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
  GraphQLRequestContextDidEncounterErrors,
} from 'apollo-server-plugin-base';

export class LoggerPlugin implements ApolloServerPlugin {
  constructor(private logger: DefaultLogger) {
    logger.setContext('LoggerPlugin');
  }

  async requestDidStart(
    requestContext: GraphQLRequestContext<any>,
  ): Promise<GraphQLRequestListener<any>> {
    const logger = this.logger;
    return {
      async didEncounterErrors(context: GraphQLRequestContextDidEncounterErrors<any>) {
        logger.error('GraphQL Error', context.errors.toString());
      },
    };
  }
}