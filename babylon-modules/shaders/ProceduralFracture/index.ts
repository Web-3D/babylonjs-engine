/**
 * VỊ TRÍ   — babylon-modules/shaders/ProceduralFracture
 * VAI TRÒ  — ShaderMaterial: vertex displacement dọc normal theo noise — giả lập vết nứt/fracture
 * LIÊN HỆ  — Port từ THREEJS ProceduralFracture (TSL triNoise3D + positionNode) → GLSL vertex shader
 *
 * CÁCH DÙNG:
 *   const frac = new ProceduralFracture(scene)
 *   mesh.material = frac.getMaterial()
 *   engine.runRenderLoop(() => { scene.render(); frac.update(performance.now() / 1000) })
 *   frac.dispose()
 *
 * DISPOSE: material.dispose()
 */

import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'

// Value noise 3D — không cần extension, chạy WebGL1+
const VERTEX_SRC = `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 world;
  uniform mat4 viewProjection;
  uniform float uScale;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSpeed;
  varying float vNoise;

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
      mix(mix(hash3(i),             hash3(i + vec3(1,0,0)), u.x),
          mix(hash3(i + vec3(0,1,0)),hash3(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash3(i + vec3(0,0,1)),hash3(i + vec3(1,0,1)), u.x),
          mix(hash3(i + vec3(0,1,1)),hash3(i + vec3(1,1,1)), u.x), u.y), u.z
    );
  }

  void main() {
    vec3 worldPos    = (world * vec4(position, 1.0)).xyz;
    vec3 worldNormal = normalize(mat3(world) * normal);
    float n = noise3D(worldPos * uScale + vec3(0.0, 0.0, uTime * uSpeed));
    vNoise = n;
    vec3 displaced = worldPos + worldNormal * n * uIntensity;
    gl_Position = viewProjection * vec4(displaced, 1.0);
  }
`

const FRAGMENT_SRC = `
  precision highp float;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying float vNoise;
  void main() {
    gl_FragColor = vec4(mix(uColor1, uColor2, vNoise), 1.0);
  }
`

export interface ProceduralFractureOptions {
  /** Displacement intensity along normal. Default: 0.1 */
  intensity?: number
  /** World-space noise scale. Default: 2.0 */
  scale?: number
  /** Animation speed. Default: 0.3 */
  speed?: number
  /** Dark fracture color. Default: near-black */
  color1?: Color3
  /** Light surface color. Default: mid-grey */
  color2?: Color3
}

export class ProceduralFracture {
  private mat: ShaderMaterial
  private isDisposed = false

  constructor(scene: Scene, opts: ProceduralFractureOptions = {}) {
    this.mat = new ShaderMaterial(
      'proceduralFractureMat',
      scene,
      { vertexSource: VERTEX_SRC, fragmentSource: FRAGMENT_SRC },
      {
        attributes: ['position', 'normal'],
        uniforms: ['world', 'viewProjection', 'uScale', 'uIntensity', 'uTime', 'uSpeed', 'uColor1', 'uColor2'],
      }
    )

    this.mat.setFloat('uIntensity', opts.intensity ?? 0.1)
    this.mat.setFloat('uScale',     opts.scale     ?? 2.0)
    this.mat.setFloat('uSpeed',     opts.speed     ?? 0.3)
    this.mat.setFloat('uTime',      0)
    this.mat.setColor3('uColor1', opts.color1 ?? new Color3(0.13, 0.13, 0.13))
    this.mat.setColor3('uColor2', opts.color2 ?? new Color3(0.53, 0.53, 0.53))
  }

  /** Gọi mỗi frame — time = performance.now() / 1000 */
  update(time: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uTime', time)
  }

  setIntensity(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uIntensity', Math.max(0, value))
  }

  setScale(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uScale', Math.max(0.001, value))
  }

  setSpeed(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uSpeed', Math.max(0, value))
  }

  getMaterial(): ShaderMaterial {
    if (this.isDisposed) throw new Error('ProceduralFracture: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
  }
}
