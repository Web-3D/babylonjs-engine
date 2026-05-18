# SparkSystem

GPU particle sparks dùng Babylon.js `GPUParticleSystem` — cone emitter, color/size gradient over lifetime, optional noise turbulence.

## Usage

```typescript
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { SparkSystem } from './SparkSystem'

const sparks = new SparkSystem(scene, {
  count: 400,
  lifetime: 1.2,
  speed: 5.0,
  gravity: 4.0,
  turbulence: true,
  colorHot:  new Color4(1.0, 0.9, 0.4, 1.0),
  colorCold: new Color4(0.9, 0.1, 0.0, 0.0),
})

sparks.setPosition(new Vector3(0, 0.5, 0))
sparks.start()

// Runtime control
sparks.setGravity(6)

// Cleanup
sparks.stop()
sparks.dispose()
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `count` | `number` | `300` | Max particle count (capacity) |
| `lifetime` | `number` | `1.5` | Particle lifetime (seconds) |
| `speed` | `number` | `4.0` | Emit power (±20%) |
| `gravity` | `number` | `4.0` | Downward gravity magnitude |
| `spread` | `number` | `π/4` | Cone half-angle (radians) |
| `sizeMin` | `number` | `0.02` | Min particle size |
| `sizeMax` | `number` | `0.06` | Max particle size (peak của bell) |
| `colorHot` | `Color4` | yellow | Color tại t=0 |
| `colorCold` | `Color4` | dark red | Color tại t=1 |
| `turbulence` | `boolean` | `false` | Bật NoiseProceduralTexture để thêm turbulence |

## Notes

- Port từ `THREEJS SparkSystem` (custom GPUParticleSystem builder) → Babylon `GPUParticleSystem`
- **Khác biệt API lớn nhất:** Three.js dùng custom `buildPosition/buildColor/buildSize` builder pattern (WebGPU compute); Babylon dùng gradient API + built-in emitter types
- Không cần gọi `update()` — Babylon particle system tự update trong engine render loop
- `turbulence: true` tạo `NoiseProceduralTexture` (disposed cùng SparkSystem)
- `getSystem()` trả về raw `GPUParticleSystem` để attach vào mesh emitter nếu cần
