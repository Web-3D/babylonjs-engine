/**
 * VỊ TRÍ   — babylon-modules/shaders/VATShader
 * VAI TRÒ  — ShaderMaterial: đọc animation baked trong float texture, reconstruct position trên GPU
 * LIÊN HỆ  — CharacterPool dùng material này; positionTexture baked bởi Houdini/Blender VAT exporter
 *
 * CÁCH DÙNG:
 *   const vat = new VATShader(scene, { positionTexture, frameCount: 30, frameRate: 24 })
 *   mesh.material = vat.getMaterial()
 *   engine.runRenderLoop(() => { scene.render(); vat.update(performance.now() / 1000) })
 *   vat.dispose()
 *
 * DISPOSE: material.dispose() — positionTexture + normalTexture KHÔNG dispose (caller sở hữu)
 */

import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import type { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import type { Scene } from '@babylonjs/core/scene'

// gl_VertexID: WebGL2 built-in — Babylon.js 8.x dùng WebGL2 by default
const VERTEX_SRC = `
  #version 300 es
  precision highp float;
  precision highp sampler2D;

  in vec3 position;
  in vec3 normal;
  in vec2 uv;

  uniform mat4 worldViewProjection;
  uniform mat4 world;
  uniform sampler2D uPosTex;
  uniform sampler2D uNorTex;
  uniform float uFrame;
  uniform float uTexW;
  uniform float uTexH;
  uniform float uHasNormal;

  out vec3 vNormal;
  out vec2 vUV;

  void main() {
    float vid  = float(gl_VertexID);
    vec2 vatUV = vec2((vid + 0.5) / uTexW, (uFrame + 0.5) / uTexH);

    vec3 vatPos = texture(uPosTex, vatUV).xyz;
    vUV = uv;

    if (uHasNormal > 0.5) {
      // Normal baked [-1,1] packed vào [0,1] trong texture
      vNormal = normalize(texture(uNorTex, vatUV).xyz * 2.0 - 1.0);
    } else {
      vNormal = normalize(mat3(world) * normal);
    }

    gl_Position = worldViewProjection * vec4(vatPos, 1.0);
  }
`

const FRAGMENT_SRC = `
  #version 300 es
  precision highp float;
  in vec3 vNormal;
  in vec2 vUV;
  out vec4 fragColor;
  void main() {
    // Diffuse-only shading từ normal — caller có thể replace với PBR material
    float diffuse = max(dot(normalize(vNormal), vec3(0.577, 0.577, 0.577)), 0.0) * 0.8 + 0.2;
    fragColor = vec4(vec3(diffuse), 1.0);
  }
`

export interface VATShaderOptions {
  /** RawTexture: width = vertexCount, height = frameCount, RGBA32Float */
  positionTexture: RawTexture
  /** Optional — same dimensions. Nếu không có, dùng geometry normal (flat shading). */
  normalTexture?: RawTexture
  /** Tổng số frame đã bake vào texture */
  frameCount: number
  /** FPS playback. Default: 24 */
  frameRate?: number
}

export class VATShader {
  private mat: ShaderMaterial
  private readonly frameCount: number
  private readonly frameRate: number
  private isDisposed = false

  constructor(scene: Scene, opts: VATShaderOptions) {
    this.frameCount = opts.frameCount
    this.frameRate  = opts.frameRate ?? 24

    const texW = opts.positionTexture.getSize().width
    const texH = opts.positionTexture.getSize().height

    this.mat = new ShaderMaterial(
      'vatMat',
      scene,
      { vertexSource: VERTEX_SRC, fragmentSource: FRAGMENT_SRC },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: ['worldViewProjection', 'world', 'uFrame', 'uTexW', 'uTexH', 'uHasNormal'],
        samplers: ['uPosTex', 'uNorTex'],
      }
    )

    this.mat.setTexture('uPosTex',    opts.positionTexture)
    this.mat.setTexture('uNorTex',    opts.normalTexture ?? opts.positionTexture)
    this.mat.setFloat('uTexW',        texW)
    this.mat.setFloat('uTexH',        texH)
    this.mat.setFloat('uFrame',       0)
    this.mat.setFloat('uHasNormal',   opts.normalTexture ? 1.0 : 0.0)
  }

  /** Advance animation theo elapsed time. Gọi mỗi frame. */
  update(time: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uFrame', Math.floor(time * this.frameRate) % this.frameCount)
  }

  /** Nhảy trực tiếp đến frame index [0, frameCount-1] */
  setFrame(frame: number): void {
    if (this.isDisposed) return
    this.mat.setFloat('uFrame', Math.max(0, Math.min(this.frameCount - 1, Math.floor(frame))))
  }

  getMaterial(): ShaderMaterial {
    if (this.isDisposed) throw new Error('VATShader: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
    // positionTexture + normalTexture KHÔNG dispose — caller sở hữu
  }
}
