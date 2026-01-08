import { defineConfig } from 'vite';

export default defineConfig({
  base: '/typescript-playground/',
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxInject: `import { jsx, Fragment } from '@repo/einblatt/jsx-runtime'`,
  },
});
