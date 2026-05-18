/**
 * VỊ TRÍ   — babylon-modules/utils/RuntimeGuard/example.ts
 * VAI TRÒ  — Standalone demo: tạo scene đơn giản + RuntimeGuard monitoring
 * LIÊN HỆ  — Chạy trong 00-Babylon/ sau khi copy module vào src/
 *
 * CÁCH DÙNG: import từ 00-Babylon/src/, mount canvas vào #app
 * DISPOSE: engine.dispose() khi unmount
 */

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { RuntimeGuard } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 5, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  MeshBuilder.CreateBox('box', { size: 1 }, scene)

  const guard = new RuntimeGuard(scene)

  engine.runRenderLoop(() => {
    scene.render()
    guard.check()
  })

  window.addEventListener('resize', () => engine.resize())

  return () => {
    guard.dispose()
    engine.dispose()
  }
}
