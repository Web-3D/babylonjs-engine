/**
 * VỊ TRÍ   — babylon-modules/shaders/WorldNoise
 * VAI TRÒ  — Node Material với SimplexPerlin3DBlock: noise animate theo world-space position
 * LIÊN HỆ  — Port từ THREEJS WorldNoise (TSL triNoise3D) → Babylon NME SimplexPerlin3DBlock
 *
 * CÁCH DÙNG:
 *   const noise = new WorldNoise(scene)
 *   mesh.material = noise.getMaterial()
 *   // KHÔNG cần gọi update(time) — engine tự cập nhật RealTime input
 *   noise.setScale(2)
 *   noise.setSpeed(0.5)
 *   // cleanup:
 *   noise.dispose()
 *
 * DISPOSE: material.dispose() — không có external resource nào
 */

import { NodeMaterial } from '@babylonjs/core/Materials/Node/nodeMaterial'
import { InputBlock } from '@babylonjs/core/Materials/Node/Blocks/Input/inputBlock'
import { TransformBlock } from '@babylonjs/core/Materials/Node/Blocks/transformBlock'
import { ScaleBlock } from '@babylonjs/core/Materials/Node/Blocks/scaleBlock'
import { AddBlock } from '@babylonjs/core/Materials/Node/Blocks/addBlock'
import { VectorMergerBlock } from '@babylonjs/core/Materials/Node/Blocks/vectorMergerBlock'
import { SimplexPerlin3DBlock } from '@babylonjs/core/Materials/Node/Blocks/simplexPerlin3DBlock'
import { LerpBlock } from '@babylonjs/core/Materials/Node/Blocks/lerpBlock'
import { VertexOutputBlock } from '@babylonjs/core/Materials/Node/Blocks/Vertex/vertexOutputBlock'
import { FragmentOutputBlock } from '@babylonjs/core/Materials/Node/Blocks/Fragment/fragmentOutputBlock'
import { NodeMaterialSystemValues } from '@babylonjs/core/Materials/Node/Enums/nodeMaterialSystemValues'
import { NodeMaterialBlockConnectionPointTypes } from '@babylonjs/core/Materials/Node/Enums/nodeMaterialBlockConnectionPointTypes'
import { AnimatedInputBlockTypes } from '@babylonjs/core/Materials/Node/Blocks/Input/animatedInputBlockTypes'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'

export interface WorldNoiseOptions {
  /** Animation speed multiplier. Default: 1.0 */
  speed?: number
  /** World-space scale — larger value = smaller noise features. Default: 1.0 */
  scale?: number
  /** Color at noise minimum. Default: black */
  color1?: Color3
  /** Color at noise maximum. Default: white */
  color2?: Color3
}

export class WorldNoise {
  private mat: NodeMaterial
  private scaleBlock: InputBlock
  private speedBlock: InputBlock
  private color1Block: InputBlock
  private color2Block: InputBlock
  private isDisposed = false

  constructor(scene: Scene, opts: WorldNoiseOptions = {}) {
    this.mat = new NodeMaterial('worldNoiseMat', scene)

    // ── Vertex: position → clip space + world space ────────────────────────────
    const posAttr = new InputBlock('position', undefined, NodeMaterialBlockConnectionPointTypes.Vector3)
    posAttr.setAsAttribute('position')

    const worldMat = new InputBlock('world')
    worldMat.setAsSystemValue(NodeMaterialSystemValues.World)

    const wvpMat = new InputBlock('worldViewProjection')
    wvpMat.setAsSystemValue(NodeMaterialSystemValues.WorldViewProjection)

    const worldPosTransform = new TransformBlock('worldPos')
    posAttr.output.connectTo(worldPosTransform.vector)
    worldMat.output.connectTo(worldPosTransform.transform)

    const clipPosTransform = new TransformBlock('clipPos')
    posAttr.output.connectTo(clipPosTransform.vector)
    wvpMat.output.connectTo(clipPosTransform.transform)

    const vertexOut = new VertexOutputBlock('vertexOutput')
    clipPosTransform.output.connectTo(vertexOut.vector)

    // ── Scale world position ───────────────────────────────────────────────────
    this.scaleBlock = new InputBlock('scale', undefined, NodeMaterialBlockConnectionPointTypes.Float)
    this.scaleBlock.value = opts.scale ?? 1.0

    const scaledPos = new ScaleBlock('scaledPos')
    worldPosTransform.xyz.connectTo(scaledPos.input)
    this.scaleBlock.output.connectTo(scaledPos.factor)

    // ── Time animation: RealTime * speed → vec3(t, t, t) ──────────────────────
    // RealTime = seconds since engine init, auto-updated by engine (no update() call needed)
    const timeBlock = new InputBlock('time', undefined, NodeMaterialBlockConnectionPointTypes.Float)
    timeBlock.animationType = AnimatedInputBlockTypes.RealTime

    this.speedBlock = new InputBlock('speed', undefined, NodeMaterialBlockConnectionPointTypes.Float)
    this.speedBlock.value = opts.speed ?? 1.0

    const timeScaled = new ScaleBlock('timeScaled')
    timeBlock.output.connectTo(timeScaled.input)
    this.speedBlock.output.connectTo(timeScaled.factor)

    // Pack scalar time offset into vec3 to add to Vector3 seed
    const timeVec = new VectorMergerBlock('timeVec')
    timeScaled.output.connectTo(timeVec.x)
    timeScaled.output.connectTo(timeVec.y)
    timeScaled.output.connectTo(timeVec.z)

    const animatedSeed = new AddBlock('animatedSeed')
    scaledPos.output.connectTo(animatedSeed.left)
    timeVec.xyzOut.connectTo(animatedSeed.right)

    // ── Simplex noise ──────────────────────────────────────────────────────────
    const noiseBlock = new SimplexPerlin3DBlock('noise')
    animatedSeed.output.connectTo(noiseBlock.seed)

    // ── Color lerp ─────────────────────────────────────────────────────────────
    this.color1Block = new InputBlock('color1', undefined, NodeMaterialBlockConnectionPointTypes.Color3)
    this.color1Block.value = opts.color1 ?? new Color3(0, 0, 0)

    this.color2Block = new InputBlock('color2', undefined, NodeMaterialBlockConnectionPointTypes.Color3)
    this.color2Block.value = opts.color2 ?? new Color3(1, 1, 1)

    const colorLerp = new LerpBlock('colorLerp')
    this.color1Block.output.connectTo(colorLerp.left)
    this.color2Block.output.connectTo(colorLerp.right)
    noiseBlock.output.connectTo(colorLerp.gradient)

    const fragOut = new FragmentOutputBlock('fragOutput')
    colorLerp.output.connectTo(fragOut.rgb)

    this.mat.addOutputNode(vertexOut)
    this.mat.addOutputNode(fragOut)
    this.mat.build()
  }

  setScale(value: number): void {
    if (this.isDisposed) return
    this.scaleBlock.value = Math.max(0.001, value)
  }

  setSpeed(value: number): void {
    if (this.isDisposed) return
    this.speedBlock.value = Math.max(0, value)
  }

  setColors(color1: Color3, color2: Color3): void {
    if (this.isDisposed) return
    this.color1Block.value = color1
    this.color2Block.value = color2
  }

  getMaterial(): NodeMaterial {
    if (this.isDisposed) throw new Error('WorldNoise: already disposed')
    return this.mat
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.mat.dispose()
  }
}
