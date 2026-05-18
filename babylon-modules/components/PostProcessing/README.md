# PostProcessing

Post-processing pipeline dùng `DefaultRenderingPipeline` — bloom, FXAA, tone mapping qua một API duy nhất.

## Usage

```typescript
import { PostProcessingManager } from './PostProcessing'

const pp = new PostProcessingManager({
  scene,
  camera,
  bloomStrength: 1.2,
  bloomRadius: 0.4,
  bloomThreshold: 0.85,
})

// Không cần gọi gì thêm — pipeline tự áp dụng khi scene.render()
engine.runRenderLoop(() => scene.render())

// Cleanup
pp.dispose()
```

## Notes

- Port từ `THREEJS PostProcessing` (`PostProcessing` + TSL `pass()` + `bloom()`) → Babylon `DefaultRenderingPipeline`
- **Khác biệt lớn:** Three.js cần `pp.render()` thay `renderer.render()` — Babylon tự xử lý qua pipeline attach vào camera
- `bloomWeight` = bloomStrength, `bloomScale` = bloomRadius (naming khác trong Babylon API)
- `hdr: true` — HDR textures cho bloom chính xác hơn
- `bloomKernel = 64` — default, có thể override qua `pipeline.bloomKernel` trực tiếp
