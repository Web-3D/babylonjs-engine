# RuntimeGuard

Per-frame performance budget checker cho Babylon.js scene.

## Usage

```typescript
import { RuntimeGuard } from './RuntimeGuard'

const engine = new Engine(canvas, true)
const scene  = new Scene(engine)

const guard = new RuntimeGuard(scene)
// hoặc custom limits:
// const guard = new RuntimeGuard(scene, { drawCallLimit: 50, triangleLimit: 200_000 })

engine.runRenderLoop(() => {
  scene.render()
  guard.check() // gọi sau render để đọc stats của frame vừa xong
})

// Khi unmount
guard.dispose()
engine.dispose()
```

## Defaults

| Metric | Limit |
|---|---|
| Draw calls | 100 |
| Triangles | 500 000 |

## Warnings

```
[Budget] Draw calls: 120/100
[Budget] Triangles: 600000/500000
[Budget] Mesh leak? Count rising: 45 (3 frames)
[Budget] Texture leak? Count rising: 12 (3 frames)
```

## Notes

- Dùng `SceneInstrumentation` từ `@babylonjs/core` — không cần bật flag gì thêm
- `triangles` = `totalActiveIndicesPerfCounter.current / 3`
- Mesh leak detector: cảnh báo nếu `scene.meshes.length` tăng liên tục 3 frame (không reset)
- Port từ `THREEJS/threejs-modules/utils/RuntimeGuard` — logic giữ nguyên, API adapt cho Babylon
