import { describe, it, expect } from 'vitest';
import { parseRouterFile } from '../src/parsers/router-parser.js';

describe('Router Parser Debug', () => {
  it('should debug router parsing', () => {
    const routerContent = `
      export class UserController {
        readonly sectorName = 'user';
        
        createRouter() {
          const t = this.createProcedure();
          return router({
            getUser: t.procedure
              .input(GetUserSchema)
              .query(() => ({})),
            
            createUser: t.procedure
              .input(CreateUserSchema)
              .mutation(() => ({})),
            
            updateUser: t.procedure
              .input(UpdateUserSchema)
              .mutation(() => ({})),
            
            deleteUser: t.procedure
              .input(DeleteUserSchema)
              .mutation(() => ({})),
            
            listUsers: t.procedure
              .input(ListUsersSchema)
              .query(() => ({}))
          });
        }
      }
    `;
    
    const parsingConfig = {
      endpointPattern: /(\w+):\s*t\.procedure\s*(?:\n\s*\.input\((\w+Schema)\))?\s*\n\s*\.(query|mutation)\(/g,
      routerMethodPattern: /createRouter\(\s*\)\s*\{[\s\S]*?return\s+router\(\s*\{([\s\S]*?)\}\s*\)\s*;?\s*\}/
    };
    
    // Test the router method pattern first
    const createRouterMatch = routerContent.match(parsingConfig.routerMethodPattern);
    console.log('Router method match:', createRouterMatch);
    
    if (createRouterMatch) {
      const routerObjectContent = createRouterMatch[1];
      console.log('Router object content:', routerObjectContent);
      
      // Test the endpoint pattern
      const endpointPattern = new RegExp(parsingConfig.endpointPattern.source, parsingConfig.endpointPattern.flags);
      let match;
      const matches = [];
      while ((match = endpointPattern.exec(routerObjectContent)) !== null) {
        matches.push(match);
      }
      console.log('Endpoint matches:', matches);
    }
    
    const endpoints = parseRouterFile(routerContent, parsingConfig);
    console.log('Parsed endpoints:', endpoints);
    
    expect(endpoints.length).toBeGreaterThan(0);
  });
});
