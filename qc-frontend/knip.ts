import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/main.tsx',
    'vite.config.ts',
    'vitest.config.ts',
    'eslint.config.js',
    'postcss.config.js',
    'tailwind.config.js',
  ],
  project: ['src/**/*.{ts,tsx}'],
  ignore: [
    'dist/**',
    'build/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.vite/**',
  ],
  ignoreDependencies: [
    '@tailwindcss/postcss',
    'autoprefixer',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    '@types/uuid',
    '@types/canvas-confetti',
    '@types/rails__actioncable',
    '@eslint/js',
    'globals',
    'typescript-eslint',
    '@vitejs/plugin-react',
  ],
}

export default config
