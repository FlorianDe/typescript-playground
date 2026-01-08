# TypeScript Playground

[![Validate](https://github.com/FlorianDe/typescript-playground/actions/workflows/validate.yml/badge.svg)](https://github.com/FlorianDe/typescript-playground/actions/workflows/validate.yml)

Personal sandbox for TypeScript experimentation and custom library development.

## What's Inside

This monorepo contains various TypeScript projects and experiments:

### **Einblatt** - Minimal SPA Framework
Custom reactive single-page application framework built on TC39-compliant signals. Features type-safe routing, JSX support, and async data handling.

[View Documentation](packages/einblatt/README.md)

### **3D Graphics Engine**
From-scratch implementation of 3D-to-2D perspective projection. Renders vertices, meshes, and supports .obj file loading with interactive controls.

### **Type Experiments**
Collection of advanced TypeScript patterns and utility types for pushing the type system's boundaries.

## Getting Started

```bash
# Install dependencies
npm install

# Run the demo app
npm run dev:gh-pages

# Build everything
npm run build

# Run tests
npm run test

# Lint all packages
npm run lint
```

## Structure

```
typescript-playground/
├── apps/
│   └── gh-pages/          # Demo site showcasing projects
└── packages/
    ├── einblatt/          # Reactive SPA framework
    ├── browser/graphics/  # 3D rendering engine
    ├── core/              # Core utilities
    └── node/              # Node utilities
```

## Requirements

- Node.js (see `.nvmrc`)
- npm 11+
