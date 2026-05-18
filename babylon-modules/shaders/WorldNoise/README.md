# WorldNoise

Node Material với built-in `SimplexPerlin3DBlock` — animated world-space Simplex noise, lerp giữa 2 màu.

## Usage

```typescript
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { WorldNoise } from './WorldNoise'

const noise = new WorldNoise(scene, {
  speed: 0.5,
  scale: 2.0,
  color1: new Color3(0.1, 0.05, 0),   // dark brown
  color2: new Color3(0.8, 0.7, 0.5),  // sand
})

mesh.material = noise.getMaterial()

// Runtime control
noise.setScale(3)
noise.setSpeed(0.3)
noise.setColors(new Color3(0, 0, 0.2), new Color3(0.3, 0.6, 1))

// Cleanup
noise.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `speed` | `number` | `1.0` | Tốc độ animation — nhân với thời gian thực |
| `scale` | `number` | `1.0` | World-space scale — lớn hơn = feature noise nhỏ hơn |
| `color1` | `Color3` | `(0,0,0)` | Màu tại noise minimum |
| `color2` | `Color3` | `(1,1,1)` | Màu tại noise maximum |

## Node graph

```
posAttr → TransformBlock(world) → xyz → ScaleBlock(scale) ──┐
                                                              AddBlock(seed)
time(RealTime) → ScaleBlock(speed) → VectorMergerBlock ─────┘
                                                              SimplexPerlin3DBlock
color1 ─────────────────────────────────────────────────────┐
color2 ─────────────────────────────────────────────────────┤ LerpBlock → FragmentOutputBlock
                                          noiseOutput ───────┘
```

## Notes

- **Không cần gọi `update(time)`** — `AnimatedInputBlockTypes.RealTime` tự động cập nhật từ engine
- Port từ `THREEJS/threejs-modules/shaders/foundation/WorldNoise` — TSL `triNoise3D` → Babylon `SimplexPerlin3DBlock`
- Babylon Simplex noise ≠ Three.js `triNoise3D` (khác thuật toán), nhưng visual result tương đương
- `setScale()` và `setSpeed()` hoạt động runtime không cần rebuild material
