/**
 * VỊ TRÍ   — babylon-modules/components/LODBillboard/example.ts
 * VAI TRÒ  — Standalone demo: cylinder tree với billboard LOD
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
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { LODBillboard } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene)
  camera.lowerRadiusLimit = 1
  camera.upperRadiusLimit = 60
  camera.attachControl(canvas, true)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const tree3D  = MeshBuilder.CreateCylinder('tree3d', { height: 2, diameter: 0.3, tessellation: 8 }, scene)
  const billTex = new Texture('https://playground.babylonjs.com/textures/grass.png', scene)

  const lodb = new LODBillboard(scene, {
    mesh: tree3D,
    billboardMap: billTex,
    billboardScale: 2,
    threshold: 15,
  })

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    lodb.dispose()
    tree3D.dispose()
    billTex.dispose()
    engine.dispose()
  }
}
