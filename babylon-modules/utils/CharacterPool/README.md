# CharacterPool

Generic object pool cho `TransformNode` — pre-allocate, acquire/release zero-allocation, cảnh báo khi utilization cao.

## Usage

```typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { CharacterPool } from './CharacterPool'

const pool = new CharacterPool({
  factory: () => {
    const m = MeshBuilder.CreateBox('char', { size: 0.5 }, scene)
    m.setEnabled(false)
    return m
  },
  poolSize: 50,
  warnThreshold: 0.85,
  disposer: (m) => { m.dispose() },
})

// Spawn character
const slot = pool.acquire()
if (slot) {
  slot.position.set(x, y, z)
  slot.setEnabled(true)
}

// Return to pool
if (slot) {
  slot.setEnabled(false)
  pool.release(slot)
}

// Stats
console.log(pool.getActiveCount(), '/', pool.getPoolSize())

// Cleanup
pool.dispose()
```

## Notes

- Port từ `THREEJS CharacterPool` (`THREE.Object3D`) → Babylon `TransformNode`
- **Khác biệt API:** Three.js `item.parent?.remove(item)` → Babylon `item.parent = null`
- Logic pool (acquire/release, utilization warning) giữ nguyên 100%
- Caller quản lý `setEnabled(false)` trước khi `release()` — pool không toggle visibility
- `disposer` callback nhận toàn bộ cleanup responsibility — pool chỉ set `parent = null`
