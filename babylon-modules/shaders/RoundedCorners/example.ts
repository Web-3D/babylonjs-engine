/**
 * VỊ TRÍ   — babylon-modules/shaders/RoundedCorners/example.ts
 * VAI TRÒ  — Standalone demo: plane với rounded corners card effect
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
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { RoundedCorners } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)
  scene.clearColor = new Color4(0.1, 0.1, 0.1, 1)

  new ArcRotateCamera('cam', 0, Math.PI / 4, 3, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const plane = MeshBuilder.CreatePlane('card', { width: 1.6, height: 1 }, scene)

  const rc = new RoundedCorners(scene, {
    radius: 0.12,
    fillColor: new Color3(0.15, 0.45, 0.9),
    edgeSoftness: 0.004,
  })

  plane.material = rc.getMaterial()

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    rc.dispose()
    engine.dispose()
  }
}
