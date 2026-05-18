/**
 * VỊ TRÍ   — babylon-modules/shaders/TriplanarMapping
 * VAI TRÒ  — Node Material với TriPlanarBlock: sample texture theo world-space position + normal
 * LIÊN HỆ  — Port từ THREEJS TriplanarMapping (TSL) → Babylon Node Material programmatic wiring
 *
 * CÁCH DÙNG:
 *   const triplanar = new TriplanarMapping(scene, { map: new Texture("rock.jpg", scene) })
 *   mesh.material = triplanar.getMaterial()
 *   triplanar.setSharpness(6)
 *   // cleanup:
 *   triplanar.dispose()
 *
 * DISPOSE: material.dispose() — texture KHÔNG bị dispose (caller sở hữu)
 */

import { NodeMaterial } from '@babylonjs/core/Materials/Node/nodeMaterial'
import { InputBlock } from '@babylonjs/core/Materials/Node/Blocks/Input/inputBlock'
import { TransformBlock } from '@babylonjs/core/Materials/Node/Blocks/transformBlock'
import { TriPlanarBlock } from '@babylonjs/core/Materials/Node/Blocks/triPlanarBlock'
import { VertexOutputBlock } from '@babylonjs/core/Materials/Node/Blocks/Vertex/vertexOutputBlock'
import { FragmentOutputBlock } from '@babylonjs/core/Materials/Node/Blocks/Fragment/fragmentOutputBlock'
import { NodeMaterialSystemValues } from '@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues'
import { NodeMaterialBlockConnectionPointTypes } from '@babylonjs/core/Materials/Node/Enums/nodeMaterialBlockConnectionPointTypes'
import type { Texture } from '@babylonjs/core/Materials/Textures/texture'
import type { Scene } from '@babylonjs/core/scene'

export interface TriplanarMappingOptions {
  map: Texture
  /** Blend sharpness giữa các mặt phẳng. Giá trị cao = transition sắc nét hơn. Default: 4 */
  sharpness?: number
}

export class TriplanarMapping {
  private mat: NodeMaterial
  private triBlock: TriPlanarBlock
  private sharpnessBlock: InputBlock
  private isDisposed = false

  constructor(scene: Scene, opts: TriplanarMappingOptions) {
    this.mat = new NodeMaterial('triplanarMat', scene)

    // ── Vertex: position attribute → world space → vertex output ──────────────
    const posAttr = new InputBlock('position', undefined, NodeMaterialBlockConnectionPointTypes.Vector3)
    posAttr.setAsAttribute('position')

    const worldMat = new InputBlock('world')
    worldMat.setAsSystemValue(NodeMaterialSystemValues.World)

    const wvpMat = new InputBlock('worldViewProjection')
    wvpMat.setAsSystemValue(NodeMaterialSystemValues.WorldViewProjection)

    // world position (xyz) — dùng cho TriPlanarBlock.position
    const worldPosTransform = new TransformBlock('worldPos')
    posAttr.output.connectTo(worldPosTransform.vector)
    worldMat.output.connectTo(worldPosTransform.transform)

    // clip-space position — dùng cho vertex output
    const clipPosTransform = new TransformBlock('clipPos')
    posAttr.output.connectTo(clipPosTransform.vector)
    wvpMat.output.connectTo(clipPosTransform.transform)

    const vertexOut = new VertexOutputBlock('vertexOutput')
    clipPosTransform.output.connectTo(vertexOut.vector)

    // ── Vertex: normal attribute → world space ─────────────────────────────────
    const normalAttr = new InputBlock('normal', undefined, NodeMaterialBlockConnectionPointTypes.Vector3)
    normalAttr.setAsAttribute('normal')

    const worldNormalTransform = new TransformBlock('worldNormal')
    // complementW = 0 → transform as direction (normal, không phải point)
    worldNormalTransform.complementW = 0
    normalAttr.output.connectTo(worldNormalTransform.vector)
    worldMat.output.connectTo(worldNormalTransform.transform)

    // ── Sharpness uniform ──────────────────────────────────────────────────────
    this.sharpnessBlock = new InputBlock('sharpness', undefined, NodeMaterialBlockConnectionPointTypes.Float)
    this.sharpnessBlock.value = opts.sharpness ?? 4

    // ── TriPlanarBlock ─────────────────────────────────────────────────────────
    this.triBlock = new TriPlanarBlock('triplanar')
    this.triBlock.texture = opts.map
    worldPosTransform.xyz.connectTo(this.triBlock.position)
    worldNormalTransform.xyz.connectTo(this.triBlock.normal)
    this.sharpnessBlock.output.connectTo(this.triBlock.sharpness)

    // ── Fragment output ────────────────────────────────────────────────────────
    const fragOut = new FragmentOutputBlock('fragOutput')
    this.triBlock.rgb.connectTo(fragOut.rgb)

    // Register blocks
    this.mat.addOutputNode(vertexOut)
    this.mat.addOutputNode(fragOut)
    this.mat.build()
  }

  /** Thay đổi blend sharpness runtime — không cần rebuild material */
  setSharpness(value: number): void {
    if (this.isDisposed) return
    this.sharpnessBlock.value = Math.max(1, value)
  }

  getMaterial(): NodeMaterial {
    if (this.isDisposed) throw new Error('TriplanarMapping: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
    // opts.map KHÔNG dispose ở đây — caller sở hữu texture
  }
}
