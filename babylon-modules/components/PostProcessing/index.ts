/**
 * VỊ TRÍ   — babylon-modules/components/PostProcessing/index.ts
 * VAI TRÒ  — Post-processing pipeline: bloom via DefaultRenderingPipeline
 * LIÊN HỆ  — Attach vào camera, tự chạy khi scene.render() — không cần gọi render() thủ công
 *
 * CÁCH DÙNG:
 *   const pp = new PostProcessingManager({ scene, camera })
 *   engine.runRenderLoop(() => scene.render())  // pipeline tự áp dụng
 *
 * DISPOSE: pp.dispose() — không dispose scene/camera, caller sở hữu
 */

import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Scene } from '@babylonjs/core/scene'

export interface PostProcessingOptions {
  scene: Scene
  camera: Camera
  /** Bloom intensity [0–3]. Default: 1.2 */
  bloomStrength?: number
  /** Bloom scale (blur radius). Default: 0.4 */
  bloomRadius?: number
  /** Luma threshold [0–1]. Default: 0.85 */
  bloomThreshold?: number
}

export class PostProcessingManager {
  private pipeline: DefaultRenderingPipeline | null = null
  private isDisposed = false

  constructor(opts: PostProcessingOptions) {
    const pipeline = new DefaultRenderingPipeline('ppDefault', true, opts.scene, [opts.camera])
    pipeline.bloomEnabled   = true
    pipeline.bloomWeight    = opts.bloomStrength  ?? 1.2
    pipeline.bloomScale     = opts.bloomRadius    ?? 0.4
    pipeline.bloomThreshold = opts.bloomThreshold ?? 0.85
    pipeline.bloomKernel    = 64
    this.pipeline = pipeline
  }

  /** Cập nhật bloom strength — có thể gọi bất cứ lúc nào */
  setBloomStrength(value: number): void {
    if (this.isDisposed || !this.pipeline) return
    this.pipeline.bloomWeight = Math.max(0, value)
  }

  dispose(): void {
    if (this.isDisposed) return
    this.pipeline?.dispose()
    this.pipeline = null
    this.isDisposed = true
    // scene/camera owned by caller — không dispose
  }
}
