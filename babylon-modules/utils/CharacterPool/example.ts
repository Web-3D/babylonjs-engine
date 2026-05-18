/**
 * VỊ TRÍ   — babylon-modules/utils/CharacterPool/example.ts
 * VAI TRÒ  — Standalone demo: spawn/despawn 50 boxes qua pool
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
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CharacterPool } from './index'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'

export function mountExample(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true)
  const scene  = new Scene(engine)

  new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 20, Vector3.Zero(), scene)
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  const pool = new CharacterPool<Mesh>({
    factory: () => {
      const m = MeshBuilder.CreateBox('char', { size: 0.4 }, scene)
      m.setEnabled(false)
      return m
    },
    poolSize: 30,
    warnThreshold: 0.85,
    disposer: (m) => m.dispose(),
  })

  // Spawn 20 slots at random positions
  const active: Mesh[] = []
  for (let i = 0; i < 20; i++) {
    const slot = pool.acquire()
    if (!slot) break
    slot.position = new Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 10,
    )
    slot.setEnabled(true)
    active.push(slot)
  }

  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => engine.resize())

  return () => {
    active.forEach(m => { m.setEnabled(false); pool.release(m) })
    pool.dispose()
    engine.dispose()
  }
}
