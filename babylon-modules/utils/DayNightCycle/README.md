# DayNightCycle

Chu kỳ ngày-đêm: drive `DirectionalLight` (mặt trời) và `HemisphericLight` (sky scatter) theo normalized time [0–1].

## Usage

```typescript
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DayNightCycle } from './DayNightCycle'

const sun = new DirectionalLight('sun', new Vector3(0, -1, 0), scene)
const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)

const dayNight = new DayNightCycle({
  sunLight: sun,
  skyLight: sky,
  speed: 0.05,    // 20 giây/chu kỳ
  startTime: 0.25 // bắt đầu từ bình minh
})

engine.runRenderLoop(() => {
  dayNight.update(engine.getDeltaTime() / 1000)
  scene.render()
})

// Seek đến buổi trưa
dayNight.setNormalizedTime(0.5)
```

## Notes

- Port từ `THREEJS DayNightCycle` — `THREE.AmbientLight` → `HemisphericLight` (khác biệt API quan trọng nhất)
- **Khác biệt:** Three.js `sunLight.position.set(x,y,z)` → Babylon `sunLight.direction = normalize(-x,-y,-z)` (Babylon dùng direction, không position)
- `light.color` → `light.diffuse` (Babylon naming)
- `Color3.Lerp(a, b, t)` thay vì Three.js mutate-in-place `.copy().lerp()`
- `engine.getDeltaTime()` trả về milliseconds → chia 1000 trước khi truyền `update()`
- DayNightCycle không dispose lights — caller sở hữu
