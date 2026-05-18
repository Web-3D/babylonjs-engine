/**
 * VỊ TRÍ   — babylon-modules/shaders/InteriorMapping
 * VAI TRÒ  — ShaderMaterial: giả lập phòng nội thất bên trong building window — ray parallax trick
 * LIÊN HỆ  — Port từ THREEJS InteriorMapping (TSL) → GLSL ShaderMaterial
 *
 * CÁCH DÙNG:
 *   const im = new InteriorMapping(scene, { map: roomTex })
 *   windowMesh.material = im.getMaterial()
 *   engine.runRenderLoop(() => { scene.render(); im.update(scene.activeCamera) })
 *   im.dispose()
 *
 * DISPOSE: material.dispose() — texture KHÔNG dispose (caller sở hữu)
 */

import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import type { Texture } from '@babylonjs/core/Materials/Textures/texture'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Scene } from '@babylonjs/core/scene'

const VERTEX_SRC = `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  uniform mat4 world;
  uniform mat4 worldViewProjection;
  varying vec2 vUV;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vUV          = uv;
    vWorldPos    = (world * vec4(position, 1.0)).xyz;
    vWorldNormal = normalize(mat3(world) * normal);
    gl_Position  = worldViewProjection * vec4(position, 1.0);
  }
`

// dFdx/dFdy: WebGL2 built-in (standard) — compute tangent frame from derivatives
const FRAGMENT_SRC = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform sampler2D uMap;
  uniform vec3 uCameraPos;
  uniform float uTiling;
  uniform float uDepth;
  varying vec2 vUV;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  float hash1(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    // Per-room UV tiling
    vec2 tiledUV = vUV * uTiling;
    vec2 roomUV  = fract(tiledUV);
    vec2 roomIdx = floor(tiledUV);

    // Per-room variation: random horizontal flip + vertical offset
    float seed   = fract(sin(roomIdx.x + roomIdx.y * 137.0) * 43758.5);
    float flipX  = step(0.5, seed);
    float offsetY = (fract(sin(roomIdx.x * 59.0 + roomIdx.y * 83.0) * 21341.5) - 0.5) * 0.3;

    vec2 variedUV = vec2(
      mix(roomUV.x, 1.0 - roomUV.x, flipX),
      clamp(roomUV.y + offsetY, 0.0, 1.0)
    );

    // Tangent frame via UV derivatives (không cần mesh tangent attribute)
    vec3 dPos1 = dFdx(vWorldPos);
    vec3 dPos2 = dFdy(vWorldPos);
    vec2 dUV1  = dFdx(vUV);
    vec2 dUV2  = dFdy(vUV);
    float det  = dUV1.x * dUV2.y - dUV1.y * dUV2.x;
    vec3 T = normalize((dPos1 * dUV2.y - dPos2 * dUV1.y) / det);
    vec3 B = normalize((dPos2 * dUV1.x - dPos1 * dUV2.x) / det);

    // Parallax: project view direction onto tangent space
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float tComp  = dot(viewDir, T);
    float bComp  = dot(viewDir, B);
    float nComp  = abs(dot(viewDir, vWorldNormal)) + 0.001;

    vec2 parallax = -vec2(tComp, bComp) / nComp * uDepth;
    vec2 finalUV  = clamp(variedUV + parallax, 0.0, 1.0);

    gl_FragColor = texture2D(uMap, finalUV);
  }
`

export interface InteriorMappingOptions {
  map: Texture
  /** Number of rooms tiled horizontally/vertically. Default: 3 */
  tiling?: number
  /** Parallax depth — higher = more depth effect. Default: 0.5 */
  depth?: number
}

export class InteriorMapping {
  private mat: ShaderMaterial
  private isDisposed = false

  constructor(scene: Scene, opts: InteriorMappingOptions) {
    this.mat = new ShaderMaterial(
      'interiorMappingMat',
      scene,
      { vertexSource: VERTEX_SRC, fragmentSource: FRAGMENT_SRC },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: ['world', 'worldViewProjection', 'uCameraPos', 'uTiling', 'uDepth'],
        samplers: ['uMap'],
      }
    )

    this.mat.setTexture('uMap',   opts.map)
    this.mat.setFloat('uTiling',  Math.max(1, Math.round(opts.tiling ?? 3)))
    this.mat.setFloat('uDepth',   Math.max(0.01, opts.depth ?? 0.5))
    this.mat.setVector3('uCameraPos', { x: 0, y: 0, z: 0 } as any)
  }

  /** Gọi mỗi frame để cập nhật camera position */
  update(camera: Camera): void {
    if (this.isDisposed) return
    const p = camera.globalPosition
    this.mat.setVector3('uCameraPos', p)
  }

  setDepth(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uDepth', Math.max(0.01, value))
  }

  setTiling(value: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uTiling', Math.max(1, Math.round(value)))
  }

  getMaterial(): ShaderMaterial {
    if (this.isDisposed) throw new Error('InteriorMapping: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
    // opts.map KHÔNG dispose — caller sở hữu
  }
}
