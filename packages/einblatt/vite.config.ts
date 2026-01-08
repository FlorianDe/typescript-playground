import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "jsx",
    jsxFragment: "Fragment",
    jsxInject: `import { jsx, Fragment } from '/src/jsx/jsx-runtime'`,
  },
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Einblatt",
      fileName: "einblatt",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
