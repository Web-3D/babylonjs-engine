# LODSystem

Wrap `Mesh.addLODLevel` của Babylon.js — swap mesh theo khoảng cách camera, không cần gọi `update()`.

## Usage

```typescript
import { LODSystem } from './LODSystem'

const high = MeshBuilder.CreateSphere('hi', { segments: 32 }, scene)
const med  = MeshBuilder.CreateSphere('md', { segments: 16 }, scene)
const low  = MeshBuilder.CreateSphere('lo', { segments: 8 }, scene)

const lod = new LODSystem({
  baseMesh: high,
  levels: [
    { mesh: med,  distance: 50  },
    { mesh: low,  distance: 100 },
    { mesh: null, distance: 200 },  // ẩn khi xa > 200
  ],
})

scene.addMesh(lod.getMesh())

// Cleanup
lod.dispose()
high.dispose()  // baseMesh caller tự dispose
```

## Notes

- Port từ `THREEJS/threejs-modules/utils/LODSystem` (THREE.LOD) → Babylon `Mesh.addLODLevel()`
- **Khác biệt chính:** Three.js dùng đối tượng `LOD` riêng, Babylon LOD được gắn trực tiếp vào base mesh
- Không cần `update(camera)` — Babylon tự swap mỗi frame dựa trên `scene.activeCamera`
- `dispose()` xóa LOD levels và dispose geometry/material của các level mesh
- `baseMesh` (high-detail) **không** bị dispose — caller quản lý
- `null` mesh tại level cuối = ẩn object khi camera quá xa
