# ProceduralFracture

ShaderMaterial với vertex displacement dọc theo world normal theo value noise 3D — giả lập vết nứt / fracture động.

## Usage

```typescript
import { ProceduralFracture } from './ProceduralFracture'

const frac = new ProceduralFracture(scene, {
  intensity: 0.15,
  scale: 3.0,
  speed: 0.2,
})

mesh.material = frac.getMaterial()

engine.runRenderLoop(() => {
  scene.render()
  frac.update(performance.now() / 1000)
})

frac.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `intensity` | `number` | `0.1` | Displacement magnitude dọc normal |
| `scale` | `number` | `2.0` | World-space noise scale |
| `speed` | `number` | `0.3` | Animation speed |
| `color1` | `Color3` | near-black | Màu fracture (vùng thấp) |
| `color2` | `Color3` | mid-grey | Màu surface (vùng cao) |

## Notes

- Port từ `THREEJS ProceduralFracture` (TSL `triNoise3D` + `positionNode`) → GLSL vertex shader
- Dùng ShaderMaterial thay NME vì vertex displacement cần `viewProjection` riêng sau khi offset worldPos
- Noise: value noise 3D tự viết (không cần extension WebGL) — khác `triNoise3D` nhưng visual tương đương
- Cần gọi `update(time)` mỗi frame để animate (khác WorldNoise dùng RealTime auto-update)
- `viewProjection` = `view * projection` — không phải `worldViewProjection` (vì world đã dùng để tính displacement)
