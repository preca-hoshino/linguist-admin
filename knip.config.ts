import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['src/components/ui/**'],
  ignoreDependencies: ["tailwindcss", "tw-animate-css", "@radix-ui/react-switch", "input-otp", "react-day-picker", "react18-json-view"],
  rules: {
    files: 'off',
    exports: 'off',
    types: 'off',
    nsExports: 'off',
    nsTypes: 'off',
    classMembers: 'off',
    enumMembers: 'off',
  }
};

export default config;