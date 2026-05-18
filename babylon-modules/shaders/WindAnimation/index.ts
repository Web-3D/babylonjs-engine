/**
 * VỊ TRÍ   — babylon-modules/shaders/WindAnimation/index.ts
 * VAI TRÒ  — ShaderMaterial: vertex displacement XZ giả lập gió dùng value noise 3D
 * LIÊN HỆ  — Port từ THREEJS WindAnimation (TSL triNoise3D + positionNode) → GLSL object-space
 *
 * CÁCH DÙNG:
 *   const wind = new WindAnimation(scene, { strength: 0.3, frequency: 0.8 })
 *   mesh.material = wind.getMaterial()
 *   engine.runRenderLoop(() => { scene.render(); wind.update(performance.now() / 1000) })
 *
 * DISPOSE: wind.dispose() — chỉ dispose material, không dispose geometry
 */

import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'

const VERTEX_SRC = `
  precision highp float;
  attribute vec3 position;
  uniform mat4 worldViewProjection;
  uniform float uTime;
  uniform float uStrength;
  uniform float uFreq;
  uniform float uSpeed;

  float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i),              hash3(i + vec3(1,0,0)), u.x),
          mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), u.x),
          mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), u.x), u.y), u.z
    );
  }

  void main() {
    vec3 scaledPos = position * uFreq;
    float t = uTime * uSpeed;
    // Hai sample độc lập — offset cố định để tránh correlation
    float n1 = noise3D(scaledPos + vec3(0.0, 0.0, t));
    float n2 = noise3D(scaledPos + vec3(17.3, 5.7, 11.9) + vec3(0.0, 0.0, t));
    float dx = (n1 - 0.5) * uStrength;
    float dz = (n2 - 0.5) * uStrength;
    // Chuyển động dọc nhỏ — tránh trông như vật thể bay
    float dy = ((n1 + n2) * 0.5 - 0.5) * uStrength * 0.3;
    gl_Position = worldViewProjection * vec4(position + vec3(dx, dy, dz), 1.0);
  }
`

const FRAGMENT_SRC = `
  precision highp float;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`

export interface WindAnimationOptions {
  /** Displacement amplitude in object units. Default: 0.3 */
  strength?: number
  /** Noise spatial frequency — larger = finer turbulence. Default: 0.8 */
  frequency?: number
  /** Animation speed multiplier. Default: 1.0 */
  speed?: number
  /** Base color for the material. Default: green */
  baseColor?: Color3
}

export class WindAnimation {
  private mat: ShaderMaterial
  private isDisposed = false

  constructor(scene: Scene, opts: WindAnimationOptions = {}) {
    this.mat = new ShaderMaterial(
      'windAnimMat',
      scene,
      { vertexSource: VERTEX_SRC, fragmentSource: FRAGMENT_SRC },
      {
        attributes: ['position'],
        uniforms: ['worldViewProjection', 'uTime', 'uStrength', 'uFreq', 'uSpeed', 'uColor'],
      }
    )

    this.mat.setFloat('uStrength', opts.strength  ?? 0.3)
    this.mat.setFloat('uFreq',     opts.frequency ?? 0.8)
    this.mat.setFloat('uSpeed',    opts.speed     ?? 1.0)
    this.mat.setFloat('uTime',     0)
    this.mat.setColor3('uColor', opts.baseColor ?? new Color3(0.267, 0.667, 0.267))
  }

  /** Gọi mỗi frame — time = performance.now() / 1000 */
  update(time: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uTime', time)
  }

  setStrength(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uStrength', Math.max(0, value))
  }

  setFrequency(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uFreq', Math.max(0.001, value))
  }

  getMaterial(): ShaderMaterial {
    if (this.isDisposed) throw new Error('WindAnimation: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
  }
}
