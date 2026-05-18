# InteriorMapping

ShaderMaterial giả lập phòng nội thất trong cửa sổ building via ray parallax — 1 texture thay thế hàng trăm mesh.

## Usage

```typescript
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { InteriorMapping } from './InteriorMapping'

const roomTex = new Texture('room.jpg', scene)
const im = new InteriorMapping(scene, { map: roomTex, tiling: 4, depth: 0.4 })

windowMesh.material = im.getMaterial()

engine.runRenderLoop(() => {
  scene.render()
  im.update(scene.activeCamera!)  // cập nhật camera position mỗi frame
})

im.dispose()
roomTex.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `map` | `Texture` | required | Room interior texture (ảnh phòng chụp từ trên xuống) |
| `tiling` | `number` | `3` | Số phòng tiled theo mỗi chiều |
| `depth` | `number` | `0.5` | Parallax depth — cao hơn = hiệu ứng depth mạnh hơn |

## Notes

- Port từ `THREEJS InteriorMapping` (TSL) → GLSL ShaderMaterial
- **Cần gọi `update(camera)`** mỗi frame — Three.js `cameraPosition` auto-provided, Babylon ShaderMaterial phải set thủ công
- Tangent frame computed từ UV derivatives (`dFdx/dFdy`) — không cần mesh tangent attribute
- Per-room variation: hash từ room index → horizontal flip + vertical offset
- `#extension GL_OES_standard_derivatives` — built-in WebGL2, không cần setup thêm
