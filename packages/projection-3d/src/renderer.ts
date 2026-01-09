import type { Vec3, Model3D, RendererConfig, TransformParams } from "./types";
import { depthScale, transformPoint } from "./math";

/**
 * Default renderer configuration.
 */
export const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  pointSize: 20,
  strokeWidth: 6,
  pointColor: "green",
  lineColor: "green",
};

/**
 * Clears the entire canvas.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Draws the FPS counter on the canvas.
 */
export function drawFps(
  ctx: CanvasRenderingContext2D,
  secondsPassed: number
): void {
  const fps = Math.round(1 / secondsPassed);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 200, 100);
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("FPS: " + fps, 10, 20);
}

/**
 * Draws a point at the given screen coordinates with depth-based scaling.
 */
export function drawPoint(
  ctx: CanvasRenderingContext2D,
  p: Vec3,
  config: RendererConfig
): void {
  ctx.fillStyle = config.pointColor;
  ctx.beginPath();
  ctx.arc(p.x, p.y, config.pointSize * depthScale(p.z), 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Draws a line between two points with depth-based stroke width.
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: Vec3,
  p2: Vec3,
  config: RendererConfig
): void {
  ctx.beginPath();
  ctx.lineWidth = config.strokeWidth * depthScale((p1.z + p2.z) / 2);
  ctx.strokeStyle = config.lineColor;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

/**
 * Transforms all vertices of a model using the given transform parameters.
 */
export function transformModel(
  model: Model3D,
  params: TransformParams,
  canvasWidth: number,
  canvasHeight: number
): Vec3[] {
  return model.vertices.map((p) =>
    transformPoint(
      p,
      params.rotationAxisV1,
      params.rotationAxisV2,
      params.angle,
      params.offset,
      canvasWidth,
      canvasHeight
    )
  );
}

/**
 * Renders a 3D model to the canvas.
 *
 * @param ctx - Canvas 2D rendering context
 * @param model - The 3D model to render
 * @param params - Transform parameters (rotation, offset, etc.)
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param config - Renderer configuration (colors, sizes)
 */
export function renderModel(
  ctx: CanvasRenderingContext2D,
  model: Model3D,
  params: TransformParams,
  canvasWidth: number,
  canvasHeight: number,
  config: RendererConfig = DEFAULT_RENDERER_CONFIG
): void {
  const transformed = transformModel(model, params, canvasWidth, canvasHeight);

  // Draw all points
  for (const p of transformed) {
    drawPoint(ctx, p, config);
  }

  // Draw all face edges
  for (const face of model.faces) {
    for (let i = 0; i < face.length; i++) {
      const p1 = transformed[face[i]];
      const p2 = transformed[face[(i + 1) % face.length]];
      drawLine(ctx, p1, p2, config);
    }
  }
}

/**
 * Options for the animation loop.
 */
export interface AnimationLoopOptions {
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D;
  /** Function to get the current model */
  getModel: () => Model3D;
  /** Function to get rotation axis v1 */
  getRotationAxisV1: () => Vec3;
  /** Function to get rotation axis v2 */
  getRotationAxisV2: () => Vec3;
  /** Function to get the Z offset value */
  getOffsetZ: () => number;
  /** Function to check if auto-offset animation is enabled */
  getAutoOffset: () => boolean;
  /** Function to get canvas width */
  getCanvasWidth: () => number;
  /** Function to get canvas height */
  getCanvasHeight: () => number;
  /** Renderer configuration */
  config?: RendererConfig;
  /** Rotation speed in radians per second (defaults to PI/2) */
  rotationSpeed?: number;
  /** Offset animation speed (defaults to 1) */
  offsetSpeed?: number;
}

/**
 * Creates an animation loop that renders the model with automatic rotation.
 *
 * @param options - Animation loop configuration
 * @returns A function to stop the animation loop
 */
export function createAnimationLoop(options: AnimationLoopOptions): () => void {
  const {
    ctx,
    getModel,
    getRotationAxisV1,
    getRotationAxisV2,
    getOffsetZ,
    getAutoOffset,
    getCanvasWidth,
    getCanvasHeight,
    config = DEFAULT_RENDERER_CONFIG,
    rotationSpeed = (1 / 2) * Math.PI,
    offsetSpeed = 1,
  } = options;

  let lastTs = 0;
  let angle = 0;
  let animatedOffsetZ = getOffsetZ();
  let animationId: number;
  let running = true;

  const render = (ts: number) => {
    if (!running) return;

    if (!lastTs) {
      lastTs = ts;
    }
    const dt = Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;

    // Update offset if auto-animating, otherwise use slider value
    if (getAutoOffset()) {
      animatedOffsetZ += offsetSpeed * dt;
    } else {
      animatedOffsetZ = getOffsetZ();
    }

    angle += rotationSpeed * dt;

    const width = getCanvasWidth();
    const height = getCanvasHeight();

    clearCanvas(ctx, width, height);
    drawFps(ctx, dt);

    renderModel(
      ctx,
      getModel(),
      {
        rotationAxisV1: getRotationAxisV1(),
        rotationAxisV2: getRotationAxisV2(),
        angle,
        offset: { x: 0, y: 0, z: animatedOffsetZ },
      },
      width,
      height,
      config
    );

    animationId = requestAnimationFrame(render);
  };

  animationId = requestAnimationFrame(render);

  return () => {
    running = false;
    cancelAnimationFrame(animationId);
  };
}
