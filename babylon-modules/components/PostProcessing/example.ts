/**
 * VỊ TRÍ   — babylon-modules/components/PostProcessing/example.ts
 * VAI TRÒ  — Demo: emissive spheres quay + bloom pipeline
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
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { PostProcessingManager } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)
  scene.clearColor = new Color4(0.02, 0.02, 0.02, 1)

  const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 4, 8, Vector3.Zero(), scene)
  camera.attachControl(canvas, true)

  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 0.1
  const sun = new DirectionalLight('sun', new Vector3(3, 5, 4), scene)
  sun.intensity = 1

  // Emissive spheres — bloom làm rõ "glow" vùng sáng mạnh
  const emissiveColors = [
    new Color3(1, 0.27, 0.27),
    new Color3(0.27, 0.67, 1),
    new Color3(1, 0.8, 0),
    new Color3(0.27, 1, 0.53),
  ]
  const baseAngles = emissiveColors.map((_, i) => (i / emissiveColors.length) * Math.PI * 2)

  const spheres = emissiveColors.map((emissive, i) => {
    const sphere = MeshBuilder.CreateSphere('sphere' + i, { diameter: 1, segments: 16 }, scene)
    const mat = new PBRMaterial('mat' + i, scene)
    mat.emissiveColor = emissive
    mat.emissiveIntensity = 2.5
    mat.albedoColor = new Color3(0.13, 0.13, 0.13)
    mat.metallic = 0
    mat.roughness = 1
    sphere.material = mat
    sphere.position = new Vector3(Math.cos(baseAngles[i]) * 2.5, 0, Math.sin(baseAngles[i]) * 2.5)
    return sphere
  })

  const pp = new PostProcessingManager({
    scene,
    camera,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.8,
  })

  let elapsed = 0
  engine.runRenderLoop(() => {
    elapsed += engine.getDeltaTime() / 1000
    for (let i = 0; i < spheres.length; i++) {
      const a = baseAngles[i] + elapsed * 0.3
      spheres[i].position.x = Math.cos(a) * 2.5
      spheres[i].position.z = Math.sin(a) * 2.5
    }
    scene.render()
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    pp.dispose()
    engine.dispose()
  }
}
