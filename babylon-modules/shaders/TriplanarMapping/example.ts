/**
 * VỊ TRÍ   — babylon-modules/shaders/TriplanarMapping/example.ts
 * VAI TRÒ  — Standalone demo: sphere với triplanar rock texture
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
import { TriplanarMapping } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 4, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  // Sphere để thấy rõ triplanar không bị seam ở pole
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene)

  const rockTex = new Texture('https://playground.babylonjs.com/textures/floor.png', scene)
  const triplanar = new TriplanarMapping(scene, { map: rockTex, sharpness: 6 })
  sphere.material = triplanar.getMaterial()

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    triplanar.dispose()
    rockTex.dispose()
    engine.dispose()
  }
}
