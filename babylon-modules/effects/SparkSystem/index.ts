/**
 * VỊ TRÍ   — babylon-modules/effects/SparkSystem
 * VAI TRÒ  — GPU particle sparks: cone emitter, color/size gradient over lifetime, optional noise texture
 * LIÊN HỆ  — Port từ THREEJS SparkSystem (GPUParticleSystem custom builder) → Babylon GPUParticleSystem
 *
 * CÁCH DÙNG:
 *   const sparks = new SparkSystem(scene, { count: 300 })
 *   sparks.start()
 *   // Không cần gọi update() — Babylon particle system tự update
 *   sparks.setPosition(new Vector3(0, 1, 0))
 *   sparks.stop()
 *   sparks.dispose()
 *
 * DISPOSE: system.dispose() — không có external resource nào ngoài NoiseProceduralTexture nếu turbulence bật
 */

import { GPUParticleSystem } from '@babylonjs/core/Particles/gpuParticleSystem'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { NoiseProceduralTexture } from '@babylonjs/core/Materials/Textures/Procedurals/noiseProceduralTexture'
import type { Scene } from '@babylonjs/core/scene'

export interface SparkSystemOptions {
  count?: number
  lifetime?: number
  speed?: number
  gravity?: number
  spread?: number
  sizeMin?: number
  sizeMax?: number
  colorHot?: Color4
  colorCold?: Color4
  turbulence?: boolean
}

export class SparkSystem {
  private system: GPUParticleSystem
  private noiseTexture: NoiseProceduralTexture | null = null
  private isDisposed = false

  constructor(scene: Scene, opts: SparkSystemOptions = {}) {
    const count    = opts.count    ?? 300
    const lifetime = opts.lifetime ?? 1.5
    const speed    = opts.speed    ?? 4.0
    const gravity  = opts.gravity  ?? 4.0
    const spread   = opts.spread   ?? Math.PI / 4

    this.system = new GPUParticleSystem('sparks', { capacity: count }, scene)

    // Emitter: cone shape
    this.system.emitter = Vector3.Zero()
    const cone = this.system.createConeEmitter(0.1, spread)
    void cone  // used by system internally

    // Lifetime + speed
    this.system.minLifeTime = lifetime
    this.system.maxLifeTime = lifetime
    this.system.minEmitPower = speed * 0.8
    this.system.maxEmitPower = speed * 1.2
    this.system.emitRate     = count / lifetime

    // Gravity (downward)
    this.system.gravity = new Vector3(0, -gravity, 0)

    // Color gradient: hot → cold over lifetime
    const colorHot  = opts.colorHot  ?? new Color4(1.0, 0.93, 0.53, 1.0)
    const colorCold = opts.colorCold ?? new Color4(0.8, 0.13, 0.0,  0.0)
    this.system.addColorGradient(0,   colorHot)
    this.system.addColorGradient(1,   colorCold)

    // Size gradient: grow → shrink (bell shape approximation)
    const sizeMin = opts.sizeMin ?? 0.02
    const sizeMax = opts.sizeMax ?? 0.06
    this.system.addSizeGradient(0,    sizeMin)
    this.system.addSizeGradient(0.3,  sizeMax)
    this.system.addSizeGradient(1,    sizeMin * 0.5)

    // Turbulence via noise texture
    if (opts.turbulence ?? false) {
      this.noiseTexture = new NoiseProceduralTexture('sparkNoise', 256, scene)
      this.noiseTexture.animationSpeedFactor = 5
      this.noiseTexture.persistence          = 2
      this.noiseTexture.brightness           = 0.5
      this.noiseTexture.octaves              = 2
      this.system.noiseTexture  = this.noiseTexture
      this.system.noiseStrength = new Vector3(2, 2, 2)
    }
  }

  start(): void {
    if (this.isDisposed) return
    this.system.start()
  }

  stop(): void {
    if (this.isDisposed) return
    this.system.stop()
  }

  setPosition(pos: Vector3): void {
    if (this.isDisposed) return
    this.system.emitter = pos
  }

  setGravity(value: number): void {
    if (this.isDisposed) return
    this.system.gravity = new Vector3(0, -Math.max(0, value), 0)
  }

  getSystem(): GPUParticleSystem {
    if (this.isDisposed) throw new Error('SparkSystem: already disposed')
    return this.system
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.system.dispose()
    this.noiseTexture?.dispose()
  }
}
