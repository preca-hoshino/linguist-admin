---
description: "Guidelines for writing Node.js and TypeScript code with Vitest testing"
applyTo: '**/*.ts, **/*.tsx, **/*.js, **/*.jsx'
---

# Code Generation Guidelines

## Coding standards
- Use TypeScript with ESM modules (type: module)
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Do not add comments unless absolutely necessary, the code should be self-explanatory
- Never use `null`, always use `undefined` for optional values
- Prefer functions over classes

## Testing
- Use **Vitest** for testing
- Write tests for all new features and bug fixes
- Ensure tests cover edge cases and error handling
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is
- Test files should be co-located with source files (`*.test.ts` / `*.test.tsx`)

## Documentation
- When adding new features or making significant changes, update the README.md file where necessary

## User interactions
- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Always answer in the same language as the question, but use english for the generated content like code, comments or docs
