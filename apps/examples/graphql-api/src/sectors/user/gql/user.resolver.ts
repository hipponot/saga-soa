import { Query, Resolver, Arg, Mutation } from 'type-graphql';
import { inject } from 'inversify';
import { GQLControllerBase } from '@saga/soa-core-api/gql-controller';
import type { ILogger } from '@saga/soa-logger';
import { User } from './user.type.js';
import { UserInput } from './user.input.js';
import { users, createUser, getUserById } from './user.data.js';
import { v4 as uuidv4 } from 'uuid';

@Resolver(() => User)
export class UserResolver extends GQLControllerBase {
  readonly sectorName = 'user';

  constructor(@inject('ILogger') logger: ILogger) {
    super(logger);
  }

  @Query(() => [User])
  allUsers() {
    return users;
  }

  @Query(() => User, { nullable: true })
  user(@Arg('id') id: string) {
    return getUserById(id);
  }

  @Mutation(() => User)
  addUser(@Arg('input') input: UserInput) {
    const user = Object.assign(new User(), input, { id: uuidv4() });
    return createUser(user);
  }
} 