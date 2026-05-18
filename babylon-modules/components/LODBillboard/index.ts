/**
 * VỊ TRÍ   — babylon-modules/components/LODBillboard
 * VAI TRÒ  — Swap 3D mesh → billboard plane khi camera xa — tiết kiệm draw call + triangle
 * LIÊN HỆ  — CharacterPool dùng module này cho mỗi instance trong crowd
 *
 * CÁCH DÙNG:
 *   const lodb = new LODBillboard(scene, { mesh, billboardMap: tex, threshold: 20 })
 *   scene.addMesh(lodb.getMesh())
 *   // Không cần gọi update() — Babylon tự swap mỗi frame
 *   lodb.dispose()
 *
 * DISPOSE: billboardMaterial.dispose() — mesh geometry/material và billboardMap KHÔNG dispose (caller sở hữu)
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Texture } from '@babylonjs/core/Materials/Textures/texture'
import type { Scene } from '@babylonjs/core/scene'

export interface LODBillboardOptions {
  /** Mesh 3D đầy đủ — hiển thị tại khoảng cách gần */
  mesh: Mesh
  /** Texture cho billboard — hiển thị tại khoảng cách xa */
  billboardMap: Texture
  /** Kích thước billboard (world units). Nên match chiều cao visual của mesh. Default: 1 */
  billboardScale?: number
  /** Khoảng cách chuyển từ mesh sang billboard. Default: 20 */
  threshold?: number
}

export class LODBillboard {
  private billboardMesh: Mesh
  private billboardMat: StandardMaterial
  private isDisposed = false

  constructor(scene: Scene, opts: LODBillboardOptions) {
    const threshold      = opts.threshold      ?? 20
    const billboardScale = opts.billboardScale ?? 1

    // Billboard = plane với BILLBOARDMODE_ALL (luôn quay về camera)
    this.billboardMesh = MeshBuilder.CreatePlane('billboard', {
      width:  billboardScale,
      height: billboardScale,
    }, scene)
    this.billboardMesh.billboardMode = AbstractMesh.BILLBOARDMODE_ALL
    this.billboardMesh.setEnabled(false)  // ẩn trước khi addLODLevel wire nó

    this.billboardMat = new StandardMaterial('billboardMat', scene)
    this.billboardMat.diffuseTexture          = opts.billboardMap
    this.billboardMat.useAlphaFromDiffuseTexture = true
    this.billboardMat.backFaceCulling         = false
    this.billboardMesh.material               = this.billboardMat

    // Level 0 (distance=0): mesh 3D → active khi gần
    // Level threshold: billboard → active khi xa
    opts.mesh.addLODLevel(threshold, this.billboardMesh)
  }

  /** Base mesh (high-detail) — thêm vào scene */
  getMesh(): Mesh {
    if (this.isDisposed) throw new Error('LODBillboard: already disposed')
    return this.billboardMesh.parent as Mesh
  }

  setBillboardScale(scale: number): void {
    if (this.isDisposed) return
    const s = Math.max(0.001, scale)
    this.billboardMesh.scaling.setAll(s)
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.billboardMat.dispose()
    this.billboardMesh.dispose()
    // opts.mesh và opts.billboardMap KHÔNG dispose — caller sở hữu
  }
}
