/**
 * VỊ TRÍ   — babylon-modules/shaders/InteriorMapping/example.ts
 * VAI TRÒ  — Standalone demo: plane với tiled room interiors
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
import { InteriorMapping } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  const camera = new ArcRotateCamera('cam', -Math.PI / 4, Math.PI / 3, 5, Vector3.Zero(), scene)
  camera.attachControl(canvas, true)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const plane = MeshBuilder.CreatePlane('wall', { width: 3, height: 2 }, scene)

  const roomTex = new Texture('https://playground.babylonjs.com/textures/floor.png', scene)
  const im = new InteriorMapping(scene, { map: roomTex, tiling: 4, depth: 0.4 })
  plane.material = im.getMaterial()

  engine.runRenderLoop(() => {
    scene.render()
    if (scene.activeCamera) im.update(scene.activeCamera)
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    im.dispose()
    roomTex.dispose()
    engine.dispose()
  }
}
