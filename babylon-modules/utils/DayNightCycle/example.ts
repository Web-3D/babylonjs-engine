/**
 * VỊ TRÍ   — babylon-modules/utils/DayNightCycle/example.ts
 * VAI TRÒ  — Demo: 3 buildings + ground chạy qua chu kỳ ngày-đêm
 * LIÊN HỆ  — Chạy trong 00-Babylon/ sau khi copy module vào src/
 *
 * CÁCH DÙNG: import mountExample, truyền canvas element
 * DISPOSE: cleanup() khi unmount
 */

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { DayNightCycle } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)
  scene.clearColor = new Color4(0.02, 0.02, 0.06, 1)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 4, 12, new Vector3(0, 0.5, 0), scene)
    .attachControl(canvas, true)

  // Lights — DayNightCycle sẽ điều khiển cả hai
  const sun = new DirectionalLight('sun', new Vector3(0, -1, 0), scene)
  sun.intensity = 0

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = 0.2

  // Ground
  const ground = MeshBuilder.CreateGround('ground', { width: 14, height: 10 }, scene)
  const groundMat = new StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new Color3(0.165, 0.251, 0.125)
  ground.material = groundMat

  // Buildings
  const buildingMat = new StandardMaterial('buildingMat', scene)
  buildingMat.diffuseColor = new Color3(0.54, 0.54, 0.60)

  const buildingConfigs: [number, number, number, number][] = [
    [-2.5, 2, -2, 1.0],
    [0, 3, -3, 1.0],
    [2.5, 2, -1.5, 0.9],
  ]
  for (const [x, h, z, sy] of buildingConfigs) {
    const b = MeshBuilder.CreateBox('building', { width: 1, height: h, depth: 1 }, scene)
    b.position = new Vector3(x, h / 2, z)
    b.scaling.y = sy
    b.material = buildingMat
  }

  // DayNightCycle — bắt đầu bình minh, 10s mỗi chu kỳ
  const dayNight = new DayNightCycle({
    sunLight: sun,
    skyLight: sky,
    speed: 0.1,
    startTime: 0.2,
  })

  engine.runRenderLoop(() => {
    dayNight.update(engine.getDeltaTime() / 1000)
    scene.render()
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    dayNight.dispose()
    groundMat.dispose()
    buildingMat.dispose()
    engine.dispose()
  }
}
