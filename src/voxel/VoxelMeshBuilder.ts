import {
  Mesh,
  Scene,
  VertexData,
  Vector3,
} from '@babylonjs/core';
import { VOXEL_SIZE, Voxel, colorToColor4 } from '../shared/types';

const FACE_INDICES = [
  [0, 1, 2, 0, 2, 3], // front
  [5, 4, 7, 5, 7, 6], // back
  [4, 0, 3, 4, 3, 7], // left
  [1, 5, 6, 1, 6, 2], // right
  [3, 2, 6, 3, 6, 7], // top
  [4, 5, 1, 4, 1, 0], // bottom
];

const FACE_NORMALS = [
  [0, 0, 1],
  [0, 0, -1],
  [-1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
];

export function buildVoxelMesh(
  scene: Scene,
  name: string,
  voxels: Voxel[],
  parent: Mesh | null = null
): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  const half = VOXEL_SIZE / 2;

  for (const voxel of voxels) {
    const cx = voxel.x * VOXEL_SIZE;
    const cy = voxel.y * VOXEL_SIZE;
    const cz = voxel.z * VOXEL_SIZE;
    const c4 = colorToColor4(voxel.color);

    const corners = [
      [-half, -half, half],
      [half, -half, half],
      [half, half, half],
      [-half, half, half],
      [-half, -half, -half],
      [half, -half, -half],
      [half, half, -half],
      [-half, half, -half],
    ];

    for (let f = 0; f < 6; f++) {
      const faceIdx = FACE_INDICES[f];
      const normal = FACE_NORMALS[f];

      for (const vi of faceIdx) {
        const corner = corners[vi];
        positions.push(cx + corner[0], cy + corner[1], cz + corner[2]);
        normals.push(normal[0], normal[1], normal[2]);
        colors.push(c4.r, c4.g, c4.b, c4.a);
      }

      indices.push(
        vertexOffset,
        vertexOffset + 1,
        vertexOffset + 2,
        vertexOffset,
        vertexOffset + 2,
        vertexOffset + 3
      );
      vertexOffset += 4;
    }
  }

  const mesh = new Mesh(name, scene);
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.normals = normals;
  vertexData.colors = colors;
  vertexData.indices = indices;
  vertexData.applyToMesh(mesh);

  mesh.convertToUnIndexedMesh();
  mesh.createNormals(true);
  mesh.useVertexColors = true;
  mesh.parent = parent;
  mesh.receiveShadows = true;

  return mesh;
}

export function offsetVoxels(voxels: Voxel[], ox: number, oy: number, oz: number): Voxel[] {
  return voxels.map((v) => ({
    x: v.x + ox,
    y: v.y + oy,
    z: v.z + oz,
    color: v.color,
  }));
}

export function getVoxelBounds(voxels: Voxel[]): {
  min: Vector3;
  max: Vector3;
  center: Vector3;
} {
  if (voxels.length === 0) {
    return {
      min: Vector3.Zero(),
      max: Vector3.Zero(),
      center: Vector3.Zero(),
    };
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const v of voxels) {
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    minZ = Math.min(minZ, v.z);
    maxX = Math.max(maxX, v.x);
    maxY = Math.max(maxY, v.y);
    maxZ = Math.max(maxZ, v.z);
  }

  const s = VOXEL_SIZE;
  const min = new Vector3(minX * s, minY * s, minZ * s);
  const max = new Vector3((maxX + 1) * s, (maxY + 1) * s, (maxZ + 1) * s);
  return {
    min,
    max,
    center: min.add(max).scale(0.5),
  };
}
