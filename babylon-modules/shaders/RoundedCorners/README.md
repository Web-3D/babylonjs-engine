# RoundedCorners

ShaderMaterial với UV-space SDF (Signed Distance Field) — vẽ hình chữ nhật bo góc, anti-aliased, transparent ngoài boundary.

## Usage

```typescript
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { RoundedCorners } from './RoundedCorners'

const rc = new RoundedCorners(scene, {
  radius: 0.15,
  fillColor: new Color3(0.2, 0.5, 1.0),
  edgeSoftness: 0.005,
})

const plane = MeshBuilder.CreatePlane('card', { width: 1, height: 1 }, scene)
plane.material = rc.getMaterial()

// Runtime control
rc.setRadius(0.2)
rc.setColor(new Color3(1, 0.3, 0.3))

// Cleanup
rc.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `radius` | `number` | `0.1` | Corner radius — fraction of panel half-size [0, 0.5] |
| `fillColor` | `Color3` | white | Fill color |
| `edgeSoftness` | `number` | `0.005` | Anti-alias width trong UV space |

## Notes

- Port từ `THREEJS/threejs-modules/shaders/fragment/RoundedCorners` — TSL SDF → GLSL
- Dùng ShaderMaterial (GLSL) thay NME vì SDF formula cần quá nhiều blocks để wire tay
- Babylon.js engine tự convert GLSL → WGSL khi chạy WebGPU — không cần viết WGSL
- `transparencyMode = 2` (ALPHABLEND) + `backFaceCulling = false` để plane hiển thị đúng
- SDF formula: `q = abs(p) - b + r`, `sdf = length(max(q,0)) + min(max(q.x,q.y),0) - r`
