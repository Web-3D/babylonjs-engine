# TriplanarMapping

Node Material dùng built-in `TriPlanarBlock` của Babylon.js — sample texture theo world-space position + normal, tránh seam khi UV bị stretch (terrain, rock, irregular mesh).

## Usage

```typescript
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { TriplanarMapping } from './TriplanarMapping'

const rockTex = new Texture('rock.jpg', scene)
const triplanar = new TriplanarMapping(scene, { map: rockTex, sharpness: 6 })

mesh.material = triplanar.getMaterial()

// Runtime update
triplanar.setSharpness(8) // blend sắc nét hơn

// Cleanup
triplanar.dispose()
rockTex.dispose() // caller dispose texture
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `map` | `Texture` | required | Texture áp lên cả 3 mặt phẳng |
| `sharpness` | `number` | `4` | Blend transition — cao hơn = transition sắc nét hơn giữa các mặt |

## Node graph

```
position (attr) ──→ TransformBlock (world)         ──→ TriPlanarBlock.position
normal   (attr) ──→ TransformBlock (world, dir=0)  ──→ TriPlanarBlock.normal
sharpness (uniform) ──────────────────────────────→ TriPlanarBlock.sharpness
position (attr) ──→ TransformBlock (wvp)           ──→ VertexOutputBlock
TriPlanarBlock.rgb ──────────────────────────────→ FragmentOutputBlock
```

## Notes

- Port từ `THREEJS/threejs-modules/shaders/fragment/TriplanarMapping` — TSL `triplanarTextures()` → `TriPlanarBlock` NME
- Babylon.js có `TriPlanarBlock` built-in — không cần viết GLSL thủ công
- `TransformBlock.complementW = 0` → transform normal as direction (W=0), không phải point (W=1)
- Texture caller quản lý — `dispose()` chỉ huỷ NodeMaterial, không huỷ texture
