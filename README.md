# MBVoxel — Medieval Adventurer Character Comparison

A Babylon.js demo comparing **high-detail voxel** and **polygon** medieval adventurer characters for a Mount & Blade–style game prototype.

## Features

- **Voxel character** — Thousands of small voxels (2 cm units) with per-voxel color, facial detail, hair, tunic, cape, and leather gear
- **Polygon character** — Matching PBR stylized mesh with the same proportions and equipment slots
- **Interchangeable armor** — Helmet, chest plate, pauldrons, gauntlets, greaves, and armored boots (toggle on/off)
- **Medieval weapons** — Sword, battle axe, mace, longbow, and shield
- **Full animation** — Idle, walk, run, and attack cycles via procedural skeletal rig
- **Combat sandbox** — Walk on a 3D terrain, spawn procedural enemies, and fight to compare feel

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

## Controls

| Input | Action |
|-------|--------|
| `W A S D` | Move |
| `Shift` | Run |
| `Space` | Attack |
| Mouse drag | Orbit camera |
| Mouse wheel | Zoom |

Use the UI panels to switch between **Voxel** and **Polygon** characters, toggle armor pieces, change weapons, spawn enemies, and rest to heal.

## Project Structure

```
src/
  voxel/          Voxel mesh builder, character parts, voxel character
  polygon/        Polygon mesh character with matching equipment
  animation/      Procedural skeletal animation
  combat/         Enemy AI and spawn manager
  game/           Main game loop, player controller
  world/          Ground, lighting, skybox
  ui/             HTML overlay and input handling
```

## Comparison Notes

Both characters share the same rig, animation system, equipment slots, and combat stats so you can evaluate visual style and performance side by side. The voxel version emphasizes stylized pixel-sculpt detail; the polygon version uses smooth PBR surfaces and higher mesh counts on curved armor.
