/**
 * VỊ TRÍ   — babylon-modules/utils/LODSystem
 * VAI TRÒ  — Wrap Mesh.addLODLevel: quản lý swap mesh theo khoảng cách camera
 * LIÊN HỆ  — Port từ THREEJS LODSystem (THREE.LOD) → Babylon Mesh built-in LOD
 *
 * CÁCH DÙNG:
 *   const lod = new LODSystem({ baseMesh: highDetailMesh, levels: [
 *     { mesh: medMesh, distance: 50 },
 *     { mesh: lowMesh, distance: 100 },
 *     { mesh: null,    distance: 200 },  // null = ẩn khi xa
 *   ]})
 *   // Không cần gọi update() — Babylon tự cập nhật mỗi frame
 *   lod.dispose()
 *
 * DISPOSE: xóa tất cả LOD levels + dispose mesh geometry/material của từng level
 */

import type { Mesh } from '@babylonjs/core/Meshes/mesh'

export interface LODLevel {
  /** Mesh hiển thị tại khoảng cách này. null = ẩn mesh khi xa */
  mesh: Mesh | null
  /** Khoảng cách camera để kích hoạt level này */
  distance: number
}

export interface LODSystemOptions {
  /** Mesh độ chi tiết cao nhất — là base mesh, các LOD level được gắn vào đây */
  baseMesh: Mesh
  levels: LODLevel[]
}

export class LODSystem {
  private baseMesh: Mesh
  private levels: LODLevel[]
  private isDisposed = false

  constructor(opts: LODSystemOptions) {
    this.baseMesh = opts.baseMesh
    this.levels   = opts.levels

    // Babylon LOD: addLODLevel trên base mesh — engine tự swap khi camera đến đúng distance
    for (const level of opts.levels) {
      this.baseMesh.addLODLevel(level.distance, level.mesh)
    }
  }

  /** Base mesh (high-detail) — add vào scene */
  getMesh(): Mesh {
    if (this.isDisposed) throw new Error('LODSystem: already disposed')
    return this.baseMesh
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true

    for (const level of this.levels) {
      this.baseMesh.removeLODLevel(level.mesh)
      if (level.mesh) {
        level.mesh.geometry?.dispose()
        const mat = level.mesh.material
        if (mat) {
          if (Array.isArray(mat)) mat.forEach(m => m.dispose())
          else mat.dispose()
        }
      }
    }
    // baseMesh KHÔNG dispose ở đây — caller sở hữu
  }
}
