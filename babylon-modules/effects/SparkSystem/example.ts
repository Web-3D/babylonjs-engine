/**
 * VỊ TRÍ   — babylon-modules/effects/SparkSystem/example.ts
 * VAI TRÒ  — Standalone demo: spark emitter tại origin
 * LIÊN HỆ  — Chạy trong 00-Babylon/ sau khi copy module vào src/
 *
 * CÁCH DÙNG: import mountExample, truyền canvas element
 * DISPOSE: cleanup() khi unmount
 */

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { SparkSystem } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)
  scene.clearColor = new Color4(0.05, 0.05, 0.05, 1)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 6, Vector3.Zero(), scene)
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  light.diffuse = new Color3(0.3, 0.3, 0.3)

  const sparks = new SparkSystem(scene, {
    count: 350,
    lifetime: 1.4,
    speed: 4.5,
    gravity: 5.0,
    turbulence: true,
    colorHot:  new Color4(1.0, 0.92, 0.5, 1.0),
    colorCold: new Color4(0.8, 0.1, 0.0, 0.0),
  })
  sparks.start()

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    sparks.dispose()
    engine.dispose()
  }
}
