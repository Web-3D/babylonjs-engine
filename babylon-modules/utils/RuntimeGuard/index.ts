/**
 * VỊ TRÍ   — babylon-modules/utils/RuntimeGuard
 * VAI TRÒ  — Per-frame performance budget checker: cảnh báo khi draw calls / triangles vượt ngưỡng hoặc có memory leak
 * LIÊN HỆ  — Dùng trong World class, gọi guard.check() bên trong engine.runRenderLoop()
 *
 * CÁCH DÙNG:
 *   const guard = new RuntimeGuard(scene)
 *   engine.runRenderLoop(() => { scene.render(); guard.check() })
 *   // cleanup:
 *   guard.dispose()
 *
 * DISPOSE: instrumentation.dispose() — huỷ SceneInstrumentation đính kèm scene
 */

import type { Scene } from '@babylonjs/core/scene'
import { SceneInstrumentation } from '@babylonjs/core/Instrumentation/sceneInstrumentation'

interface GuardOptions {
  drawCallLimit: number
  triangleLimit: number
}

export class RuntimeGuard {
  private options: GuardOptions
  private instrumentation: SceneInstrumentation
  private prevMeshes = 0
  private meshLeakFrames = 0
  private prevTextures = 0
  private textureLeakFrames = 0
  private isDisposed = false

  constructor(
    private scene: Scene,
    options?: Partial<GuardOptions>
  ) {
    this.options = {
      drawCallLimit: options?.drawCallLimit ?? 100,
      triangleLimit: options?.triangleLimit ?? 500_000,
    }
    this.instrumentation = new SceneInstrumentation(scene)
  }

  check(): void {
    if (this.isDisposed) return

    const drawCalls = this.instrumentation.drawCallsCounter.current
    const triangles = this.scene.totalActiveIndicesPerfCounter.current / 3
    const meshCount = this.scene.meshes.length
    const textureCount = this.scene.textures.length

    if (drawCalls > this.options.drawCallLimit)
      console.warn(`[Budget] Draw calls: ${drawCalls}/${this.options.drawCallLimit}`)

    if (triangles > this.options.triangleLimit)
      console.warn(`[Budget] Triangles: ${Math.round(triangles)}/${this.options.triangleLimit}`)

    if (meshCount > this.prevMeshes) {
      this.meshLeakFrames++
      if (this.meshLeakFrames >= 3)
        console.warn(`[Budget] Mesh leak? Count rising: ${meshCount} (${this.meshLeakFrames} frames)`)
    } else {
      this.meshLeakFrames = 0
    }
    this.prevMeshes = meshCount

    if (textureCount > this.prevTextures) {
      this.textureLeakFrames++
      if (this.textureLeakFrames >= 3)
        console.warn(`[Budget] Texture leak? Count rising: ${textureCount} (${this.textureLeakFrames} frames)`)
    } else {
      this.textureLeakFrames = 0
    }
    this.prevTextures = textureCount
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.instrumentation.dispose()
  }
}

export type { GuardOptions }
