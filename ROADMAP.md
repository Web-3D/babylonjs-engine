# ROADMAP.md — Babylon.js Engine Phases

> Source of truth cho toàn bộ hệ thống module của BABYLONJS engine.
> Bắt đầu sau khi THREEJS Phase A hoàn thành.
> Mục tiêu: rebuild cùng module để so sánh trực tiếp 2 engine.

---

## Phase A — Environment Foundation _(✅ điều kiện đạt — sẵn sàng build)_

Mục tiêu: rebuild Phase A của THREEJS bằng Babylon.js API để so sánh trực tiếp.

> `GlobalUniforms` bị loại — pattern đó là TSL-specific (Three.js `uniform()` node), không có equivalent trong Babylon.js.
> Shader trong Babylon.js nhận time qua `ShaderMaterial.setFloat("uTime", t)` mỗi frame — không cần shared uniform node.

| #   | Module            | Category | Status       | Three.js counterpart | Ghi chú adapt |
| --- | ----------------- | -------- | ------------ | -------------------- | ------------- |
| 1   | `RuntimeGuard`    | utils    | ✅ unit-pass | `RuntimeGuard`       | Dùng `SceneInstrumentation.drawCallsCounter`, `scene.totalActiveIndicesPerfCounter` |
| 2   | `TriplanarMapping`| shaders  | ✅ unit-pass | `TriplanarMapping`   | NME: `TriPlanarBlock` built-in + `TransformBlock` world pos/normal |
| 3   | `WorldNoise`      | shaders  | ✅ unit-pass | `WorldNoise`         | NME: SimplexPerlin3DBlock + RealTime auto-animate (không cần update()) |
| 4   | `RoundedCorners`  | shaders  | ✅ unit-pass | `RoundedCorners`     | ShaderMaterial GLSL: SDF formula, engine convert WGSL tự động |

---

## Phase B — Advanced Environment & Splats _(chờ Phase A)_

| #   | Module               | Category   | Status       | Three.js counterpart |
| --- | -------------------- | ---------- | ------------ | -------------------- |
| 1   | `LODSystem`          | utils      | ✅ unit-pass | `LODSystem`          |
| 2   | `ProceduralFracture` | shaders    | ✅ unit-pass | `ProceduralFracture` |
| 3   | `InteriorMapping`    | shaders    | ✅ unit-pass | `InteriorMapping`    |
| 4   | `SparkSystem`        | effects    | ✅ unit-pass | `SparkSystem`        |

---

## Phase C — Character Pipeline _(chờ Phase B)_

| #   | Module          | Category   | Status       | Three.js counterpart |
| --- | --------------- | ---------- | ------------ | -------------------- |
| 1   | `VATShader`     | shaders    | ✅ unit-pass | `VATShader`          |
| 2   | `LODBillboard`  | components | ✅ unit-pass | `LODBillboard`       |
| 3   | `CharacterPool` | utils      | ✅ unit-pass | `CharacterPool`      |

---

## Phase D — Polish & Deploy _(✅ hoàn thành)_

| #   | Module           | Category   | Status       | Three.js counterpart | Ghi chú adapt |
| --- | ---------------- | ---------- | ------------ | -------------------- | ------------- |
| 1   | `PostProcessing` | components | ✅ unit-pass | `PostProcessing`     | DefaultRenderingPipeline: auto-apply qua scene.render(), không cần pp.render() |
| 2   | `WindAnimation`  | shaders    | ✅ unit-pass | `WindAnimation`      | TSL triNoise3D → GLSL value noise 3D; object-space + worldViewProjection |
| 3   | `DayNightCycle`  | utils      | ✅ unit-pass | `DayNightCycle`      | AmbientLight → HemisphericLight; light.direction thay position; Color3.Lerp() |

---

## Phase E — High Fidelity Rendering _(feasibility study — chưa implement)_

> Mục tiêu: thu hẹp gap visual giữa Babylon.js web và Unreal Engine.
> Không phải module library — là kỹ thuật rendering áp vào scene thực.
> Xem xét khả thi sau khi Phase A-D hoàn thành.

### E1 — Lighting Quality (thay thế hardware ray tracing)

| Kỹ thuật | Mô tả | Đánh đổi |
|---|---|---|
| **Baked Lightmap** | Blender/Houdini render GI → bake texture → Babylon load | Static — đèn không di chuyển được |
| **Light Probe** | Sample lighting tại điểm chiến lược → interpolate cho dynamic object | Ít probe → banding artifact |
| **SSGI** (Screen-space GI) | Approximate bounce light từ những gì camera thấy | Mất accuracy khi object ra ngoài màn hình |

Pipeline: Blender bake lightmap → KTX2 → Babylon.js `LightmapTexture` → assign vào mesh.

---

### E2 — Memory Management (giới hạn 2-4GB browser tab)

| Kỹ thuật | Mô tả | Kết quả |
|---|---|---|
| **KTX2 / Basis Universal** | Compress texture trước khi upload GPU | 2K PNG 16MB → KTX2 2-4MB (4-8× nhỏ hơn) |
| **LOD + unload** | Dispose geometry ngoài frustum/xa, reload khi cần | Giữ VRAM thấp cho scene lớn |
| **Draco / Meshopt** | Compress geometry khi download | 50MB mesh → 5MB download, giải nén nhanh |

Babylon.js có `SceneOptimizer` và `AssetsManager` built-in — ít code hơn Three.js.

---

### E3 — Texture Streaming (thay thế Unreal streaming)

| Kỹ thuật | Mô tả | Đánh đổi |
|---|---|---|
| **Progressive mipmap** | Load mip thấp (128px) ngay → background load mip cao (2K) → swap | KTX2 hỗ trợ native, cần asset pipeline |
| **Tile-based streaming** | Chia texture lớn (terrain 8K) → 64 tile 1K → load tile visible | Phức tạp hơn, cần implement manual |

---

### E4 — Unreal → Babylon.js Workflow

Babylon.js **Node Material Editor** tương đồng với **Unreal Material Graph** — artist quen Unreal có thể chuyển sang mà không cần học lại tư duy.

```
Unreal Material Graph (offline reference)
  ↓ workflow transfer
Babylon.js Node Material Editor (web runtime)
  → export NodeMaterial JSON
  → load trong code: NodeMaterial.ParseFromFileAsync(...)
```

Asset pipeline shared với Three.js:
```
Blender bake → KTX2 texture → dùng được cả Two.js lẫn Babylon.js
Houdini VAT  → texture data → cần viết riêng shader mỗi engine
```

---

### E5 — Character Quality (skin + hair)

| Module | Kỹ thuật | So với Three.js |
|---|---|---|
| `SkinShader` | PBR + SSS via Node Material | Babylon có built-in SSS parameter trong PBR material — ít code hơn |
| `HairCardSystem` | Alpha card + wind animation | Tương đương — cùng alpha card technique |

Babylon.js `PBRMaterial` có `subSurface.isScatteringEnabled` built-in — không cần custom shader như Three.js `MeshPhysicalNodeMaterial`.

---

## Changelog

| Ngày       | Thay đổi                                                  |
| ---------- | --------------------------------------------------------- |
| 2026-05-18 | Phase A: bỏ `GlobalUniforms` (TSL-specific), thêm `RuntimeGuard` |
| 2026-05-18 | `RuntimeGuard` unit-pass ✅ — `SceneInstrumentation` + `totalActiveIndicesPerfCounter` |
| 2026-05-18 | **Phase A ✅ hoàn thành** — 4/4 modules: RuntimeGuard, TriplanarMapping, WorldNoise, RoundedCorners |
| 2026-05-18 | **Phase B ✅ hoàn thành** — 4/4 modules: LODSystem, ProceduralFracture, InteriorMapping, SparkSystem |
| 2026-05-18 | **Phase C ✅ hoàn thành** — 3/3 modules: VATShader (GLSL ES3 + gl_VertexID), LODBillboard (BILLBOARDMODE_ALL), CharacterPool (TransformNode pool) |
| 2026-05-18 | **Phase D ✅ hoàn thành** — 3/3 modules: PostProcessing (DefaultRenderingPipeline), WindAnimation (GLSL noise3D object-space), DayNightCycle (DirectionalLight + HemisphericLight) |
| 2026-05-17 | Thêm Phase E — High Fidelity Rendering (feasibility study) |
| 2026-05-12 | Tạo file — mirror structure từ `THREEJS/ROADMAP.md`       |
