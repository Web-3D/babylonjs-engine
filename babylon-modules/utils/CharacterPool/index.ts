/**
 * VỊ TRÍ   — babylon-modules/utils/CharacterPool
 * VAI TRÒ  — Generic object pool: pre-allocate slots, acquire/release không tạo mới GPU resource
 * LIÊN HỆ  — Dùng cho crowd (LODBillboard, VATShader mesh); RuntimeGuard pattern cho warnThreshold
 *
 * CÁCH DÙNG:
 *   const pool = new CharacterPool({ factory: () => MeshBuilder.CreateBox('c', {}, scene), poolSize: 50 })
 *   const slot = pool.acquire()
 *   if (slot) { slot.position.set(x, y, z); slot.setEnabled(true) }
 *   pool.release(slot)
 *   pool.dispose()
 *
 * DISPOSE: gọi disposer(item) cho mọi slot — caller nên dispose geometry/material riêng qua disposer
 */

import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'

export interface CharacterPoolOptions<T extends TransformNode> {
  /** Factory tạo một slot — gọi đúng poolSize lần khi khởi tạo */
  factory: () => T
  /** Tổng số slot pre-allocated */
  poolSize: number
  /**
   * Cảnh báo khi (active / total) vượt ngưỡng [0–1]. Default: 0.9
   * Tương tự RuntimeGuard.check() nhưng theo pool utilization.
   */
  warnThreshold?: number
  /** Gọi khi dispose() xóa từng slot — cleanup geometry/material bên trong */
  disposer?: (item: T) => void
}

export class CharacterPool<T extends TransformNode> {
  private free: T[]
  private readonly active: Set<T> = new Set()
  private readonly warnThreshold: number
  private readonly disposer: ((item: T) => void) | undefined
  private isDisposed = false

  constructor(opts: CharacterPoolOptions<T>) {
    this.warnThreshold = opts.warnThreshold ?? 0.9
    this.disposer      = opts.disposer
    // Pre-allocate tất cả slots ngay trong constructor — zero allocation sau đó
    this.free = Array.from({ length: opts.poolSize }, opts.factory)
  }

  /**
   * Lấy một slot từ pool.
   * Trả về null nếu pool cạn — caller phải handle.
   * Caller chịu trách nhiệm setEnabled(true) và positioning.
   */
  acquire(): T | null {
    if (this.isDisposed) return null
    const item = this.free.pop()
    if (item === undefined) {
      console.warn('[CharacterPool] Pool exhausted — ' + this.active.size + ' active, 0 free')
      return null
    }
    this.active.add(item)
    const total       = this.active.size + this.free.length
    const utilization = this.active.size / total
    if (utilization >= this.warnThreshold) {
      console.warn(
        '[CharacterPool] High utilization: ' + this.active.size + '/' + total +
        ' (' + Math.round(utilization * 100) + '%)'
      )
    }
    return item
  }

  /**
   * Trả slot về pool.
   * Caller phải gọi setEnabled(false) trước — pool không quản lý visibility.
   */
  release(item: T): void {
    if (this.isDisposed) return
    if (!this.active.has(item)) return
    this.active.delete(item)
    this.free.push(item)
  }

  getActiveCount(): number { return this.active.size }
  getFreeCount():   number { return this.free.length }
  getPoolSize():    number { return this.active.size + this.free.length }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    for (const item of this.active) {
      item.parent = null
      this.disposer?.(item)
    }
    for (const item of this.free) {
      this.disposer?.(item)
    }
    this.active.clear()
    this.free = []
  }
}
