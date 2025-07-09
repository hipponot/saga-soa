import { Query, Resolver, Arg, Mutation } from 'type-graphql';
import { Session } from './session.type.js';
import { SessionInput } from './session.input.js';
import { sessions, createSession, getSessionById } from './session.data.js';
import { v4 as uuidv4 } from 'uuid';

@Resolver(() => Session)
export class SessionResolver {
  @Query(() => [Session])
  allSessions() {
    return sessions;
  }

  @Query(() => Session, { nullable: true })
  session(@Arg('id') id: string) {
    return getSessionById(id);
  }

  @Mutation(() => Session)
  addSession(@Arg('input') input: SessionInput) {
    const session = Object.assign(new Session(), input, { id: uuidv4() });
    return createSession(session);
  }
} 