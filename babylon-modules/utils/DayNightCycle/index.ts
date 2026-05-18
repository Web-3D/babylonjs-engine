/**
 * VỊ TRÍ   — babylon-modules/utils/DayNightCycle/index.ts
 * VAI TRÒ  — Chu kỳ ngày-đêm: drive DirectionalLight (mặt trời) và HemisphericLight (trời) theo thời gian
 * LIÊN HỆ  — Port từ THREEJS DayNightCycle. THREE.AmbientLight → Babylon HemisphericLight
 *
 * CÁCH DÙNG:
 *   const dayNight = new DayNightCycle({ sunLight, skyLight, speed: 0.05 })
 *   engine.runRenderLoop(() => { dayNight.update(engine.getDeltaTime() / 1000); scene.render() })
 *
 * DISPOSE: dayNight.dispose() — không dispose lights, caller sở hữu lights
 */

import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import type { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

export interface DayNightCycleOptions {
  /** DirectionalLight đại diện mặt trời */
  sunLight: DirectionalLight
  /** HemisphericLight cho sky scatter (thay thế THREE.AmbientLight) */
  skyLight: HemisphericLight
  /**
   * Tốc độ chu kỳ [cycles/giây].
   * 0.05 = 20 giây/chu kỳ. Default: 0.05
   */
  speed?: number
  /**
   * Thời điểm bắt đầu [0–1].
   * 0=nửa đêm, 0.25=bình minh, 0.5=giữa trưa, 0.75=hoàng hôn. Default: 0.25
   */
  startTime?: number
}

// Các mốc màu mặt trời
const NIGHT_SUN = Color3.FromHexString('#0a0a1a')
const DAWN_SUN  = Color3.FromHexString('#ff7043')
const NOON_SUN  = Color3.FromHexString('#fff8e1')
const DUSK_SUN  = Color3.FromHexString('#ff5722')
const NIGHT_AMB = Color3.FromHexString('#050510')
const DAY_AMB   = Color3.FromHexString('#8090b0')

export class DayNightCycle {
  private normalizedTime: number
  private readonly speed: number
  private readonly sunLight: DirectionalLight
  private readonly skyLight: HemisphericLight
  private isDisposed = false

  constructor(opts: DayNightCycleOptions) {
    this.sunLight      = opts.sunLight
    this.skyLight      = opts.skyLight
    this.speed         = opts.speed     ?? 0.05
    this.normalizedTime = opts.startTime ?? 0.25
    this.applyLighting()
  }

  /**
   * Advance time mỗi frame.
   * deltaTime = engine.getDeltaTime() / 1000 (seconds)
   */
  update(deltaTime: number): void {
    if (this.isDisposed) return
    this.normalizedTime = (this.normalizedTime + deltaTime * this.speed) % 1.0
    this.applyLighting()
  }

  /**
   * Seek trực tiếp đến thời điểm trong ngày.
   * 0 = nửa đêm, 0.25 = bình minh, 0.5 = giữa trưa, 0.75 = hoàng hôn
   */
  setNormalizedTime(t: number): void {
    if (this.isDisposed) return
    this.normalizedTime = ((t % 1.0) + 1.0) % 1.0
    this.applyLighting()
  }

  getNormalizedTime(): number {
    return this.normalizedTime
  }

  private applyLighting(): void {
    const t = this.normalizedTime
    // Angle: 0=midnight (bottom), 0.25=east horizon, 0.5=zenith, 0.75=west horizon
    const angle = t * Math.PI * 2 - Math.PI / 2
    const sunX = Math.cos(angle)
    const sunY = Math.sin(angle)

    // Babylon DirectionalLight dùng direction (ngược chiều so với Three.js position → origin)
    this.sunLight.direction = new Vector3(-sunX, -sunY, -0.3).normalize()

    // sunY trong [-1,1] — chỉ chiếu sáng khi trên đường chân trời (sunY > 0)
    const elevation = Math.max(0, sunY)
    this.sunLight.intensity = elevation * 2.5

    // Màu mặt trời: lạnh về đêm → ấm ở chân trời → trắng ở giữa trưa
    const isRising = t < 0.5
    const horizonColor = isRising ? DAWN_SUN : DUSK_SUN
    if (elevation < 0.2) {
      this.sunLight.diffuse = Color3.Lerp(NIGHT_SUN, horizonColor, elevation / 0.2)
    } else {
      this.sunLight.diffuse = Color3.Lerp(horizonColor, NOON_SUN, (elevation - 0.2) / 0.8)
    }

    // Sky light: tối về đêm, sáng ban ngày
    this.skyLight.diffuse    = Color3.Lerp(NIGHT_AMB, DAY_AMB, elevation)
    this.skyLight.intensity  = 0.2 + elevation * 0.8
  }

  dispose(): void {
    // Lights owned by caller — không dispose, chỉ đánh dấu
    this.isDisposed = true
  }
}
