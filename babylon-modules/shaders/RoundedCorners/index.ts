/**
 * VỊ TRÍ   — babylon-modules/shaders/RoundedCorners
 * VAI TRÒ  — ShaderMaterial với UV-space SDF: hình chữ nhật bo góc, transparent ngoài boundary
 * LIÊN HỆ  — Port từ THREEJS RoundedCorners (TSL SDF math) → Babylon ShaderMaterial (GLSL)
 *
 * CÁCH DÙNG:
 *   const rc = new RoundedCorners(scene, { radius: 0.15 })
 *   plane.material = rc.getMaterial()
 *   // cleanup:
 *   rc.dispose()
 *
 * DISPOSE: material.dispose() — không có texture nào
 */

import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'

// GLSL inline — engine tự convert sang WGSL khi chạy WebGPU
const VERTEX_SRC = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 worldViewProjection;
  varying vec2 vUV;
  void main() {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`

const FRAGMENT_SRC = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uRadius;
  uniform float uSoftness;
  varying vec2 vUV;

  void main() {
    // UV [0,1] → center tại (0,0), range [-0.5, 0.5]
    vec2 p = vUV - 0.5;
    float r = uRadius;

    // SDF rounded rectangle: q = abs(p) - (0.5 - r) + r
    vec2 b = vec2(0.5 - r);
    vec2 q = abs(p) - b + r;
    float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;

    // Alpha: 1 bên trong, smooth transition tại boundary, 0 bên ngoài
    float alpha = 1.0 - smoothstep(-uSoftness, uSoftness, sdf);

    gl_FragColor = vec4(uColor, alpha);
  }
`

export interface RoundedCornersOptions {
  /** Corner radius as fraction of panel half-size [0, 0.5]. Default: 0.1 */
  radius?: number
  /** Fill color. Default: white */
  fillColor?: Color3
  /** SDF edge anti-alias width in UV space. Default: 0.005 */
  edgeSoftness?: number
}

export class RoundedCorners {
  private mat: ShaderMaterial
  private isDisposed = false

  constructor(scene: Scene, opts: RoundedCornersOptions = {}) {
    const r        = Math.min(0.5, Math.max(0, opts.radius ?? 0.1))
    const softness = Math.max(0.001, opts.edgeSoftness ?? 0.005)
    const fill     = opts.fillColor ?? new Color3(1, 1, 1)

    this.mat = new ShaderMaterial(
      'roundedCornersMat',
      scene,
      { vertexSource: VERTEX_SRC, fragmentSource: FRAGMENT_SRC },
      { attributes: ['position', 'uv'], uniforms: ['worldViewProjection', 'uColor', 'uRadius', 'uSoftness'] }
    )

    this.mat.setColor3('uColor', fill)
    this.mat.setFloat('uRadius', r)
    this.mat.setFloat('uSoftness', softness)
    this.mat.transparencyMode = 2  // ALPHABLEND
    this.mat.backFaceCulling   = false
  }

  setRadius(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uRadius', Math.min(0.5, Math.max(0, value)))
  }

  setColor(color: Color3): void {
    if (this.isDisposed) return
    this.mat.setColor3('uColor', color)
  }

  getMaterial(): ShaderMaterial {
    if (this.isDisposed) throw new Error('RoundedCorners: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
  }
}
