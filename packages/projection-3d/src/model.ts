import type { Model3D } from "./types";

/**
 * Default cube model with vertices and faces.
 */
export const DEFAULT_CUBE: Model3D = {
  vertices: [
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
  ],
  faces: [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
  ],
};

/**
 * Parses an OBJ file text content into a Model3D structure.
 *
 * @param text - Raw OBJ file content
 * @returns Parsed model with vertices and faces
 */
export function parseOBJ(text: string): Model3D {
  return text.split("\n").reduce(
    (acc, line) => {
      const l = line.trim();
      if (l.startsWith("v ")) {
        const [, x, y, z] = l.split(/\s+/).map(Number);
        acc.vertices.push({ x, y, z });
      } else if (l.startsWith("f ")) {
        const idxs = l
          .split(/\s+/)
          .slice(1)
          .map((v) => parseInt(v) - 1);
        acc.faces.push(idxs);
      }
      return acc;
    },
    { vertices: [], faces: [] } as Model3D
  );
}
