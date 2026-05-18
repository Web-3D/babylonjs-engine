/**
 * VỊ TRÍ   — babylon-modules/shaders/WindAnimation/example.ts
 * VAI TRÒ  — Demo: grass field + stalks chia sẻ cùng wind material
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
import { WindAnimation } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)
  scene.clearColor = new Color4(0.1, 0.1, 0.18, 1)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 4, 10, new Vector3(0, 0.5, 0), scene)
    .attachControl(canvas, true)
  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 0.6

  const wind = new WindAnimation(scene, {
    strength: 0.2,
    frequency: 0.5,
    speed: 1.0,
    baseColor: new Color3(0.18, 0.54, 0.30),
  })

  // Ground plane — nhiều subdivisions để vertex displacement rõ
  const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 6, subdivisions: 40 }, scene)
  ground.material = wind.getMaterial()

  // Grass stalks — dùng chung wind material, chuyển động đồng bộ
  const stalkPositions: [number, number, number][] = [
    [-2.5, 0.75, -1],
    [-1, 0.75, 0.5],
    [0.5, 0.75, -0.8],
    [2, 0.75, 0.3],
    [-0.5, 0.75, 1.5],
    [1.5, 0.75, 1.2],
  ]
  for (const [x, y, z] of stalkPositions) {
    const stalk = MeshBuilder.CreateCylinder('stalk', {
      diameterTop: 0.04, diameterBottom: 0.08, height: 1.5, tessellation: 5, subdivisions: 6,
    }, scene)
    stalk.position = new Vector3(x, y, z)
    stalk.material = wind.getMaterial()
  }

  engine.runRenderLoop(() => {
    wind.update(performance.now() / 1000)
    scene.render()
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    wind.dispose()
    engine.dispose()
  }
}
