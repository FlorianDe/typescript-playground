import type { Vec3 } from "./types";

/**
 * Projects a 3D point onto a 2D plane using perspective projection.
 * Divides x and y by z to simulate depth (pinhole camera model).
 *
 * @param p - 3D point to project
 * @returns 2D projected point with original depth preserved
 * @see https://en.wikipedia.org/wiki/3D_projection#Weak_perspective_projection
 */
export function perspectiveProject(p: Vec3): Vec3 {
  return {
    x: p.x / p.z,
    y: p.y / p.z,
    z: p.z,
  };
}

/**
 * Converts normalized device coordinates (NDC) to screen coordinates.
 * Maps x and y from [-1, 1] to [0, width] and [0, height], flipping Y for canvas.
 *
 * @param p - Point in NDC space
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Point in screen space with original depth
 */
export function viewport(p: Vec3, width: number, height: number): Vec3 {
  return {
    x: ((p.x + 1) / 2) * width,
    y: (1 - (p.y + 1) / 2) * height,
    z: p.z,
  };
}

/**
 * Rotates a 3D point around an arbitrary axis defined by two points using Rodrigues' rotation formula.
 *
 * @param p - The point to rotate.
 * @param a - First point defining the rotation axis.
 * @param b - Second point defining the rotation axis.
 * @param t - Rotation angle in radians.
 * @returns The rotated point in 3D space.
 *
 * @see https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
 */
export function rotate(p: Vec3, a: Vec3, b: Vec3, t: number): Vec3 {
  let x = p.x - a.x,
    y = p.y - a.y,
    z = p.z - a.z;
  let u = b.x - a.x,
    v = b.y - a.y,
    w = b.z - a.z;
  const L = Math.hypot(u, v, w);
  u /= L;
  v /= L;
  w /= L;
  const ct = Math.cos(t),
    st = Math.sin(t),
    dot = u * x + v * y + w * z;
  return {
    x: a.x + u * dot * (1 - ct) + x * ct + (-w * y + v * z) * st,
    y: a.y + v * dot * (1 - ct) + y * ct + (w * x - u * z) * st,
    z: a.z + w * dot * (1 - ct) + z * ct + (-v * x + u * y) * st,
  };
}

/**
 * Translates a 3D point by a given vector.
 *
 * @param p - The original point.
 * @param v - The translation vector.
 * @returns The translated point.
 */
export function translatePoint(p: Vec3, v: Vec3): Vec3 {
  return { x: p.x + v.x, y: p.y + v.y, z: p.z + v.z };
}

/**
 * Calculates a depth-based scale factor for visual effects.
 * Objects further away appear smaller.
 *
 * @param depth - The z-coordinate depth value
 * @returns Scale factor based on depth
 */
export function depthScale(depth: number): number {
  return 1 / Math.max(0.5, depth);
}

/**
 * Transforms a 3D point through the full pipeline: rotate, translate, project, viewport.
 *
 * @param p - The original 3D point
 * @param rotationAxisV1 - First point of rotation axis
 * @param rotationAxisV2 - Second point of rotation axis
 * @param angle - Rotation angle in radians
 * @param offset - Translation offset
 * @param canvasWidth - Canvas width for viewport transform
 * @param canvasHeight - Canvas height for viewport transform
 * @returns The transformed point in screen coordinates
 */
export function transformPoint(
  p: Vec3,
  rotationAxisV1: Vec3,
  rotationAxisV2: Vec3,
  angle: number,
  offset: Vec3,
  canvasWidth: number,
  canvasHeight: number
): Vec3 {
  const rotated = rotate(p, rotationAxisV1, rotationAxisV2, angle);
  const translated = translatePoint(rotated, offset);
  const projected = perspectiveProject(translated);
  return viewport(projected, canvasWidth, canvasHeight);
}
