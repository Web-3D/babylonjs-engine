# CLAUDE.md — Babylon.js Engine

> Tầng này quản lý: Babylon.js stack, module patterns, skills, build order, Living Index.
> KHÔNG can thiệp: ecosystem decisions, Three.js rules, asset structure (assets ở `../assets/`).
> ← Tầng trên: `../CLAUDE.md` (ecosystem overview)

---

## Session opener chuẩn

Câu đầu tiên khi mở BABYLONJS session:

```
Đọc CLAUDE.md + ../SYNC.md + c:\Projects\studio-3D\STATUS.md rồi báo cáo trạng thái.
```

---

## Workspace layout (engine scope)

```
BABYLONJS/
├── ARCHITECTURE.md      ← workspace architecture + file registry
├── CLAUDE.md            ← engine rules + Living Index (auto-updated)
├── ROADMAP.md           ← phase plan
├── validate.js          ← quality gate: kiểm tra module + asset
├── update-index.js      ← cập nhật Living Index tự động
├── check-imports.js     ← kiểm tra import path trong src/
├── decisions/           ← ADR — lý do đằng sau quyết định kiến trúc
├── deferred/            ← tính năng đã nghiên cứu, chưa build
│
├── 00-Babylon/          ← project chính (Vite + TS + Babylon.js) — tạo khi Phase A bắt đầu
│
└── babylon-modules/     ← KHO VẬT LIỆU — module tái sử dụng
    ├── shaders/         ← Node Material JSON + custom ShaderMaterial GLSL
    ├── utils/           ← utility classes
    ├── components/      ← Babylon scene components
    └── effects/         ← VFX effects
```

Assets dùng chung: `../assets/[category]/[name]/production/` — không nằm trong thư mục này.

---

## Stack cố định

- Babylon.js **8.x** — verify API trong `node_modules/@babylonjs/core/` trước khi dùng
- TypeScript **strict mode** — Babylon.js viết native TS, type definitions đầy đủ; không dùng `any`, không dùng `!` non-null assertion
- Shader: **Node Material Editor (visual) > ShaderMaterial (GLSL)** — KHÔNG dùng TSL (Three.js only); engine tự lo WebGL↔WebGPU conversion
- Vite 6, ESLint, Husky commit gate
- Physics: **Havok** (built-in default) hoặc Rapier (WASM) — không cần lib ngoài

---

## Babylon.js vs Three.js — Khác biệt kiến trúc cốt lõi

| Khía cạnh | Babylon.js | Three.js |
|---|---|---|
| Triết lý | "Engine-as-a-Service" — batteries-included | Thư viện gốc — tự kết hợp |
| WebGPU | Tự động (v5.0+), không cần đổi code | TSL, đang thử nghiệm |
| Shader | Node Material Editor, ShaderMaterial (GLSL/HLSL nội bộ) | TSL → WGSL/GLSL |
| Debug | Inspector tích hợp (Scene tree, material, profiling) | Không có built-in |
| Physics | Havok/Cannon/Rapier built-in | Cần tích hợp ngoài |
| Bundle | ~1MB+ (nhiều tính năng sẵn) | <200KB core |
| TypeScript | Native TS, types hoàn chỉnh | JS + type defs |

---

## 3 Quy tắc không ngoại lệ

**1. Dispose pattern** — mọi class có GPU resource (`Mesh`, `Material`, `Texture`, `RenderTargetTexture`, `Effect`) phải gọi `.dispose()` đầy đủ. Babylon.js quản lý resource qua Scene — gọi `scene.dispose()` để dọn toàn bộ.

**2. Performance budget** — draw calls < 100, triangles < 500k, texture ≤ 2048×2048. Dùng Babylon **Inspector → Statistics panel** để monitor live. RuntimeGuard bắt buộc trong mọi World class có render loop.

**3. Honest-Uncertain** — khi không chắc API tồn tại ở version 8.x, nói rõ trước khi dùng. Không tự bịa method name. Verify trong `node_modules/@babylonjs/core/`.

---

## Babylon.js Engine lifecycle

```typescript
// Pattern chuẩn — không deviation
const engine = new Engine(canvas, true);       // antialias = true
const scene  = new Scene(engine);              // Scene là container chính
engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());

// Dispose khi unmount
engine.dispose();  // tự gọi scene.dispose() bên trong
```

---

## Shader workflow (Babylon.js — không dùng TSL)

```
Node Material Editor (visual, web tool)
    → Export → NodeMaterial JSON → load trong code

Custom shader → ShaderMaterial (GLSL)
    → Engine tự convert sang WGSL khi chạy WebGPU
    → Không cần viết WGSL tay
```

Babylon.js **ẩn WebGL/WebGPU** phía engine — dev chỉ viết 1 lần, chạy cả hai.

---

## Inspector (built-in debugger)

```typescript
// Bật Inspector trong dev
scene.debugLayer.show({ embedMode: true });

// Hoặc dùng keyboard shortcut: Shift+Ctrl+Alt+I (default)
```

Inspector cung cấp: Scene Explorer (cây node), Inspector panel (properties, material, shader), Statistics (draw calls, FPS, triangles), Profiler.

---

## Phase hiện tại

**Phase A ⏳ — Environment Foundation.** Chi tiết: [`ROADMAP.md`](ROADMAP.md)

> Mirror Phase A của THREEJS để so sánh trực tiếp 2 engine.
> Target: `babylon-modules/` (không phải `00-Babylon/src/` trực tiếp).

---

## Coding style

- Không comment trừ khi WHY không rõ từ code
- Không tạo file mới nếu có thể edit file hiện tại
- Không thêm error handling cho scenario không thể xảy ra
- Không add abstraction chưa cần — 3 dòng lặp tốt hơn abstraction sớm

---

## Shared AI Context

| File | Mục đích |
|---|---|
| `../SYNC.md` | Log quyết định + trạng thái workspace — **đọc đầu session**, ghi sau thay đổi lớn |
| `c:\Projects\studio-3D\STATUS.md` | Command center — active project, phase, blockers cross-repo |
| `../assets/REGISTRY.json` | Index assets đã validate — auto-generated, không sửa tay |

---

## Quick Lookup

| Câu hỏi | Đọc ở đây |
|---|---|
| API Babylon.js 8.x có method X không? | `node_modules/@babylonjs/core/` — grep trực tiếp |
| Shader workflow Babylon? | Node Material Editor docs (doc.babylonjs.com) |
| Debug scene? | Inspector: `scene.debugLayer.show()` |
| Module nào đã build xong? | Living Index → Modules bên dưới |
| Quyết định / context session trước? | `../SYNC.md` |
| Tại sao chọn pattern/stack này? | `decisions/` — ADR index |
| Tính năng đã nghiên cứu nhưng hoãn? | `deferred/README.md` |
| Architecture tổng quan? | `ARCHITECTURE.md` |

---

## Living Index

> Auto-generated bởi `update-index.js` — **không sửa tay** phần trong thẻ `<!-- INDEX -->`.
> Cập nhật: mỗi lần mở session (SessionStart hook) + sau mỗi validate PASS.

### Scripts

<!-- INDEX:scripts -->
| Script | Vai trò | Khi chạy |
|---|---|---|
| `validate.js` | Quality gate: module + asset | Sau mỗi thêm/sửa module |
| `check-imports.js` | Import path trong src/ | Sau copy module vào project |
| `update-index.js` | Tái tạo Living Index | SessionStart + sau validate PASS |
<!-- /INDEX:scripts -->

### Modules (babylon-modules/)

<!-- INDEX:modules -->
_Chưa có module nào._
<!-- /INDEX:modules -->

### Assets (assets/)

<!-- INDEX:assets -->
_assets/REGISTRY.json chưa có_
<!-- /INDEX:assets -->
