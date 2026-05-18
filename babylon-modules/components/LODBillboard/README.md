# LODBillboard

Swap 3D mesh → billboard plane (BILLBOARDMODE_ALL) khi camera xa — dùng `Mesh.addLODLevel()`.

## Usage

```typescript
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { LODBillboard } from './LODBillboard'

const tree3D  = MeshBuilder.CreateCylinder('tree', { height: 2 }, scene)
const billTex = new Texture('tree_billboard.png', scene)

const lodb = new LODBillboard(scene, {
  mesh: tree3D,
  billboardMap: billTex,
  billboardScale: 2,
  threshold: 25,
})

// Không cần gọi update() — Babylon tự swap
lodb.dispose()
tree3D.dispose()
billTex.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `mesh` | `Mesh` | required | Mesh 3D hiển thị khi gần |
| `billboardMap` | `Texture` | required | Billboard texture (nên có alpha channel) |
| `billboardScale` | `number` | `1` | Kích thước billboard (world units) |
| `threshold` | `number` | `20` | Khoảng cách chuyển sang billboard |

## Notes

- Port từ `THREEJS LODBillboard` (`THREE.LOD` + `THREE.Sprite`) → `Mesh.addLODLevel` + `BILLBOARDMODE_ALL`
- **Khác biệt:** Three.js dùng `Sprite` (always-face-camera built-in); Babylon dùng `CreatePlane` + `billboardMode`
- Babylon tự handle LOD swap mỗi frame — không cần `update(camera)`
- `billboardMap` và base mesh KHÔNG dispose trong module — caller sở hữu
