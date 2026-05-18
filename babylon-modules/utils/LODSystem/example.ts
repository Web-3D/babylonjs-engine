/**
 * VỊ TRÍ   — babylon-modules/utils/LODSystem/example.ts
 * VAI TRÒ  — Standalone demo: sphere với 3 LOD levels
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
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { LODSystem } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene)
  camera.lowerRadiusLimit = 2
  camera.upperRadiusLimit = 300
  camera.attachControl(canvas, true)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const mkMat = (color: Color3) => {
    const m = new StandardMaterial('m', scene)
    m.diffuseColor = color
    return m
  }

  // 3 detail levels — wire color để dễ nhận ra swap
  const hi  = MeshBuilder.CreateSphere('hi',  { segments: 32, diameter: 2 }, scene)
  hi.material = mkMat(new Color3(0.2, 0.6, 1))

  const med = MeshBuilder.CreateSphere('med', { segments: 12, diameter: 2 }, scene)
  med.material = mkMat(new Color3(0.4, 1, 0.4))
  med.setEnabled(false)

  const low = MeshBuilder.CreateSphere('low', { segments: 4,  diameter: 2 }, scene)
  low.material = mkMat(new Color3(1, 0.5, 0.2))
  low.setEnabled(false)

  const lod = new LODSystem({
    baseMesh: hi,
    levels: [
      { mesh: med, distance: 30  },
      { mesh: low, distance: 80  },
      { mesh: null, distance: 200 },
    ],
  })

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    lod.dispose()
    hi.dispose()
    engine.dispose()
  }
}
