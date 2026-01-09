/**
 * A 3D point or vector with x, y, z coordinates.
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * A 3D model consisting of vertices and faces.
 * Faces are arrays of vertex indices forming polygons.
 */
export interface Model3D {
  vertices: Vec3[];
  faces: number[][];
}

/**
 * Configuration for the 3D renderer.
 */
export interface RendererConfig {
  pointSize: number;
  strokeWidth: number;
  pointColor: string;
  lineColor: string;
}

/**
 * Parameters for the 3D transformation pipeline.
 */
export interface TransformParams {
  /** First point defining the rotation axis */
  rotationAxisV1: Vec3;
  /** Second point defining the rotation axis */
  rotationAxisV2: Vec3;
  /** Current rotation angle in radians */
  angle: number;
  /** Translation offset applied after rotation */
  offset: Vec3;
}
