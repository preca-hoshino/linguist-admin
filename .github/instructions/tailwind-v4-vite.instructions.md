---
description: 'Tailwind CSS v4+ installation and configuration for Vite projects using the official @tailwindcss/vite plugin'
applyTo: 'vite.config.ts, vite.config.js, **/*.css, **/*.tsx, **/*.ts, **/*.jsx, **/*.js'
---

# Tailwind CSS v4+ Installation with Vite

Instructions for installing and configuring Tailwind CSS version 4 and above using the official Vite plugin. Tailwind CSS v4 introduces a simplified setup that eliminates the need for PostCSS configuration and tailwind.config.js in most cases.

## Key Changes in Tailwind CSS v4

- **No PostCSS configuration required** when using the Vite plugin
- **No tailwind.config.js required** - configuration is done via CSS
- **New @tailwindcss/vite plugin** replaces the PostCSS-based approach
- **CSS-first configuration** using `@theme` directive
- **Automatic content detection** - no need to specify content paths

## Installation Steps

### Step 1: Install Dependencies

Install `tailwindcss` and the `@tailwindcss/vite` plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

### Step 2: Configure Vite Plugin

Add the `@tailwindcss/vite` plugin to your Vite configuration file:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

### Step 3: Import Tailwind CSS

Add the Tailwind CSS import to your main CSS file:

```css
@import "tailwindcss";
```

### Step 4: Verify CSS Import in Entry Point

Ensure your main CSS file is imported in your application entry point:

```typescript
// src/main.tsx or src/main.ts
import './index.css'
```

## What NOT to Do in Tailwind v4

### Do NOT Create tailwind.config.js
```javascript
// ❌ NOT NEEDED in Tailwind v4
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### Do NOT Create postcss.config.js for Tailwind
```javascript
// ❌ NOT NEEDED when using @tailwindcss/vite
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

### Do NOT Use Old Directives
```css
/* ❌ OLD - Do not use in Tailwind v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ NEW - Use this in Tailwind v4 */
@import "tailwindcss";
```

## CSS-First Configuration

### Custom Theme Configuration
```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-lg: 0.75rem;
}
```

### Adding Custom Utilities
```css
@import "tailwindcss";

@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```
