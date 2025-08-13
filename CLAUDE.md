## Safety Rules
- Always ask for confirmation before running any file write or delete command (e.g., `rm`, modifying files).
- If unsure, ask me explicitly before proceeding.
- Exception: pnpm and turbo commands are always allowed, even if they contain rm/delete operations

## Allowed Commands  
- its always okay to run any pnpm commands in the saga-soa context (including clean commands)
- its always okay to run any turbo commands in the saga-soa context (including clean commands) 

## Coding Preferences
- Use 4-space indentation only.
- Write tests for every new feature.
- All packages in this mono-repo MUST use pnpm commands only, never npm commands in package.json scripts or anywhere else.
