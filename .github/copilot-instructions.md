# Linguist Admin Dashboard Guidelines

## Overview
Linguist-Admin is a Vite + React 19 Frontend Dashboard. Based on `shadcn-admin`. Includes light/dark mode, RTL layout, and responsive interfaces. See [`README.md`](../README.md) for deeper overview.

## Build and Code Quality
- **Install**: `pnpm install` / `npm install`
- **Run dev**: `npm run dev` (starts Vite)
- **Check suite**: `npm run check` (Formats, lints, checks types, deps, and vitest runs). 
- Always ensure all checks pass before opening a PR. Tests can be independently run with `npm run check:test`.

## Architecture & Code Style
- **Framework & State**: React 19, TypeScript, TanStack Router for type-safe routing, Zustand, TanStack Query (`@tanstack/react-query`).
- **Styling**: Tailwind CSS v4, initialized with Lucide React and limited Tabler Icons. Form validation backed by React Hook Form & Zod.
- **RTL & Shadcn Modified Components**:
  - *CRITICAL*: Do **not** blindly run `npx shadcn@latest add <component>` for modified components as they contain RTL customizations.
  - The modified list includes `alert-dialog`, `calendar`, `command`, `dialog`, `dropdown-menu`, `select`, `table`, `sheet`, `sidebar`, `switch` and others directly in [`README.md`'s specific features breakdown](../README.md). Always merge manually.

## Conventions
- Leverage the formatting standard enforced by `npm run check:format` (Biome) and `npm run check:lint` (ESLint). If linting errors occur, fix automatically via `npm run lint:fix`.
