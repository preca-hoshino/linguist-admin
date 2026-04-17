/// <reference types="vitest" />

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

const pkg = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf8')) as { version: string };

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // 尝试读取上级目录的 .env 获取真实的后端 PORT
  let parentPort;
  try {
    const parentEnvPath = path.resolve(process.cwd(), '../.env');
    if (fs.existsSync(parentEnvPath)) {
      const content = fs.readFileSync(parentEnvPath, 'utf8');
      const match = /^PORT=(\d+)/m.exec(content);
      if (match) parentPort = match[1];
    }
  } catch {
    // Ignore
  }

  const rawUiBase = env['VITE_UI_BASE'];
  const uiBase = rawUiBase !== undefined && rawUiBase !== '' ? rawUiBase : '/dash/';
  const rawApiTarget = env['VITE_API_TARGET'];
  let apiTarget = 'http://127.0.0.1:3622';
  if (rawApiTarget !== undefined && rawApiTarget !== '') {
    apiTarget = rawApiTarget;
  } else if (parentPort !== undefined) {
    apiTarget = `http://127.0.0.1:${parentPort}`;
  }

  return {
    base: uiBase,
    define: {
      __UI_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: './src/router',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'clover', 'json'],
        include: ['src/**/*.{ts,tsx}'],
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5202, // Avoid conflict with ui/ which is on 5200
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
