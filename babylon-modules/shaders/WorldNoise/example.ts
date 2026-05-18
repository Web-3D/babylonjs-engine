/**
 * VỊ TRÍ   — babylon-modules/shaders/WorldNoise/example.ts
 * VAI TRÒ  — Standalone demo: box với animated simplex noise material
 * LIÊN HỆ  — Chạy trong 00-Babylon/ sau khi copy module vào src/
 *
 * CÁCH DÙNG: import mountExample, truyền canvas element
 * DISPOSE: cleanup() khi unmount
 */

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { WorldNoise } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 4, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene)

  const noise = new WorldNoise(scene, {
    speed: 0.4,
    scale: 1.5,
    color1: new Color3(0.05, 0.02, 0.1),
    color2: new Color3(0.4, 0.7, 1.0),
  })

  sphere.material = noise.getMaterial()

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    noise.dispose()
    engine.dispose()
  }
}
