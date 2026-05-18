/**
 * VỊ TRÍ   — babylon-modules/shaders/VATShader/example.ts
 * VAI TRÒ  — Standalone demo: synthetic VAT data (bouncing sphere positions)
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
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { VATShader } from './index'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 4, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  // Synthetic VAT: 1 vertex (vertexCount=1), 60 frames — bouncing Y position
  const vertexCount = 1
  const frameCount  = 60
  const posData     = new Float32Array(vertexCount * frameCount * 4)

  for (let f = 0; f < frameCount; f++) {
    const t = f / frameCount
    const y = Math.abs(Math.sin(t * Math.PI * 2)) * 1.5 - 0.75
    const idx = f * vertexCount * 4
    posData[idx + 0] = 0   // x
    posData[idx + 1] = y   // y
    posData[idx + 2] = 0   // z
    posData[idx + 3] = 1   // w (unused)
  }

  // Single-vertex mesh (degenerate — for demo only; real use has full mesh vertex count)
  const mesh = MeshBuilder.CreateSphere('vatMesh', { diameter: 0.5, segments: 8 }, scene)

  const posTex = RawTexture.CreateRGBATexture(
    posData, vertexCount, frameCount, scene,
    false, false, Engine.TEXTURE_NEAREST_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT
  )

  const vat = new VATShader(scene, { positionTexture: posTex, frameCount, frameRate: 24 })
  mesh.material = vat.getMaterial()

  engine.runRenderLoop(() => {
    scene.render()
    vat.update(performance.now() / 1000)
  })
  window.addEventListener('resize', () => engine.resize())

  return () => {
    vat.dispose()
    posTex.dispose()
    engine.dispose()
  }
}
