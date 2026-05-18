# WindAnimation

ShaderMaterial GLSL: vertex displacement giả lập gió dùng value noise 3D. Hai noise sample độc lập cho XZ — tạo chuyển động tự nhiên không đối xứng.

## Usage

```typescript
import { WindAnimation } from './WindAnimation'

const wind = new WindAnimation(scene, {
  strength: 0.3,
  frequency: 0.8,
  speed: 1.0,
  baseColor: new Color3(0.27, 0.67, 0.27),
})

mesh.material = wind.getMaterial()

engine.runRenderLoop(() => {
  wind.update(performance.now() / 1000)
  scene.render()
})

wind.dispose()
```

## Notes

- Port từ `THREEJS WindAnimation` (TSL `triNoise3D` + `positionLocal` positionNode) → GLSL ShaderMaterial
- **Khác biệt kỹ thuật:** Three.js dùng TSL `triNoise3D` built-in; Babylon dùng value noise 3D tự implement (hash-based, smooth)
- Object-space sampling → `worldViewProjection` cho transform (không cần `world` + `viewProjection` riêng)
- Caller phải gọi `wind.update(time)` mỗi frame — không có auto-animate như WorldNoise NME
- `strength` điều chỉnh trực tiếp amplitude — 0 = không gió
