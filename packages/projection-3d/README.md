# @repo/projection-3d

A minimal 3D to 2D projection library using perspective projection and Rodrigues' rotation formula.

## Features

- Perspective projection (pinhole camera model)
- Arbitrary axis rotation via Rodrigues' formula
- OBJ file parsing
- Canvas 2D rendering with depth-based scaling
- Animation loop with configurable rotation/offset

## Usage

```ts
import {
  DEFAULT_CUBE,
  createAnimationLoop,
  parseOBJ,
} from "@repo/projection-3d";

const ctx = canvas.getContext("2d");

createAnimationLoop({
  ctx,
  getModel: () => DEFAULT_CUBE,
  getRotationAxisV1: () => ({ x: 0, y: 0, z: 0 }),
  getRotationAxisV2: () => ({ x: 1, y: 1, z: 0.5 }),
  getOffsetZ: () => 2,
  getAutoOffset: () => false,
  getCanvasWidth: () => canvas.width,
  getCanvasHeight: () => canvas.height,
});
```

## API

- `perspectiveProject(p)` - Project 3D point to 2D
- `rotate(p, a, b, t)` - Rotate point around axis defined by a→b
- `parseOBJ(text)` - Parse OBJ file to Model3D
- `createAnimationLoop(options)` - Start render loop
- `renderModel(ctx, model, params, w, h, config)` - Single frame render
