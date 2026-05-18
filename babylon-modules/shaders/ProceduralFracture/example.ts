/**
 * VỊ TRÍ   — babylon-modules/shaders/ProceduralFracture/example.ts
 * VAI TRÒ  — Standalone demo: sphere với animated vertex fracture
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
import { ProceduralFracture } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 4, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 48 }, scene)

  const frac = new ProceduralFracture(scene, {
    intensity: 0.12,
    scale: 2.5,
    speed: 0.25,
    color1: new Color3(0.08, 0.05, 0.02),
    color2: new Color3(0.6, 0.5, 0.35),
  })
  sphere.material = frac.getMaterial()

  engine.runRenderLoop(() => {
    scene.render()
    frac.update(performance.now() / 1000)
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    frac.dispose()
    engine.dispose()
  }
}
