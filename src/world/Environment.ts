import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';

export function createGround(scene: Scene): void {
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 80, height: 80, subdivisions: 32 },
    scene
  );

  const groundMat = new PBRMaterial('groundMat', scene);
  groundMat.albedoColor = new Color3(0.28, 0.42, 0.22);
  groundMat.metallic = 0;
  groundMat.roughness = 0.95;
  ground.material = groundMat;
  ground.receiveShadows = true;

  // Dirt path
  const path = MeshBuilder.CreateGround('path', { width: 4, height: 60, subdivisions: 4 }, scene);
  const pathMat = new PBRMaterial('pathMat', scene);
  pathMat.albedoColor = new Color3(0.45, 0.35, 0.22);
  pathMat.roughness = 0.9;
  path.material = pathMat;
  path.position.y = 0.01;
  path.receiveShadows = true;

  // Scatter some rock markers
  for (let i = 0; i < 12; i++) {
    const rock = MeshBuilder.CreatePolyhedron(
      `rock${i}`,
      { type: 1, size: 0.3 + Math.random() * 0.5 },
      scene
    );
    rock.position.set(
      (Math.random() - 0.5) * 60,
      0.15,
      (Math.random() - 0.5) * 60
    );
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    const rockMat = new PBRMaterial(`rockMat${i}`, scene);
    rockMat.albedoColor = new Color3(0.4, 0.38, 0.35);
    rockMat.roughness = 0.85;
    rock.material = rockMat;
    rock.receiveShadows = true;
  }
}

export function setupLighting(scene: Scene): ShadowGenerator {
  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0.2), scene);
  hemi.intensity = 0.55;
  hemi.groundColor = new Color3(0.15, 0.2, 0.12);
  hemi.diffuse = new Color3(0.85, 0.82, 0.75);

  const sun = new DirectionalLight('sun', new Vector3(-0.8, -1.5, 0.6), scene);
  sun.intensity = 1.1;
  sun.diffuse = new Color3(1, 0.95, 0.85);

  const shadowGen = new ShadowGenerator(2048, sun);
  shadowGen.useBlurExponentialShadowMap = true;
  shadowGen.blurKernel = 32;
  shadowGen.darkness = 0.35;

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.008;
  scene.fogColor = new Color3(0.65, 0.72, 0.82);

  return shadowGen;
}

export function createSkybox(scene: Scene): void {
  const sky = MeshBuilder.CreateBox('skyBox', { size: 200 }, scene);
  const skyMat = new PBRMaterial('skyMat', scene);
  skyMat.albedoColor = new Color3(0.55, 0.68, 0.88);
  skyMat.emissiveColor = new Color3(0.35, 0.45, 0.65);
  skyMat.backFaceCulling = false;
  skyMat.disableLighting = true;
  sky.material = skyMat;
  sky.infiniteDistance = true;
}
