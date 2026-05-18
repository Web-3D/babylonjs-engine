# VATShader

ShaderMaterial (GLSL ES3) đọc animation baked trong `RawTexture` — reconstruct vertex positions trên GPU qua `gl_VertexID`.

## Usage

```typescript
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import { Engine } from '@babylonjs/core/Engines/engine'
import { VATShader } from './VATShader'

// posData: Float32Array, shape = [frameCount * vertexCount * 4] (RGBA)
const posTex = RawTexture.CreateRGBATexture(
  posData, vertexCount, frameCount, scene,
  false, false, Engine.TEXTURE_NEAREST_NEAREST, Engine.TEXTURETYPE_FLOAT
)

const vat = new VATShader(scene, { positionTexture: posTex, frameCount: 30, frameRate: 24 })
mesh.material = vat.getMaterial()

engine.runRenderLoop(() => {
  scene.render()
  vat.update(performance.now() / 1000)
})

vat.dispose()
posTex.dispose()  // caller dispose texture
```

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `positionTexture` | `RawTexture` | required | width=vertexCount, height=frameCount, RGBA32Float |
| `normalTexture` | `RawTexture` | undefined | Same dims. Nếu không có → geometry normal (flat shading) |
| `frameCount` | `number` | required | Tổng frame baked |
| `frameRate` | `number` | `24` | Playback FPS |

## Notes

- Port từ `THREEJS VATShader` (TSL `vertexIndex` + `texture()`) → GLSL ES3 ShaderMaterial
- Dùng `gl_VertexID` (WebGL2 built-in) — Babylon.js 8.x dùng WebGL2 by default
- `#version 300 es` — GLSL ES3 syntax (`in/out` thay `attribute/varying`)
- Normal texture packed `[0,1]` → decode `* 2 - 1` về `[-1,1]`
- Fragment shader: diffuse-only shading — thay bằng PBR nếu cần
- `positionTexture` và `normalTexture` KHÔNG dispose trong module — caller sở hữu
