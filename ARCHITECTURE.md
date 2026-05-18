# ARCHITECTURE — BABYLONJS Workspace

## Workspace layout

```
BABYLONJS/                       ← Engine workspace (git: babylonjs-engine)
├── ARCHITECTURE.md              ← file này — workspace architecture + file registry
├── CLAUDE.md                    ← engine rules + Living Index (auto-updated)
├── ROADMAP.md                   ← phase plan (Phase A–E)
├── validate.js                  ← quality gate: kiểm tra module + asset
├── check-imports.js             ← kiểm tra import path trong src/
├── update-index.js              ← cập nhật Living Index tự động
├── decisions/                   ← ADR — lý do đằng sau quyết định kiến trúc
├── deferred/                    ← tính năng đã nghiên cứu, chưa build
│
├── 00-Babylon/                  ← project chính (Vite + TS + Babylon.js) — tạo khi Phase A bắt đầu
│   ├── src/                     ← source code (world/, shaders/, utils/)
│   ├── vite.config.js
│   └── CLAUDE.md
│
└── babylon-modules/             ← KHO VẬT LIỆU — module tái sử dụng
    ├── shaders/                 ← Node Material JSON + custom ShaderMaterial GLSL
    ├── utils/                   ← utility classes
    ├── components/              ← Babylon scene components
    └── effects/                 ← VFX effects
```

**Shared (ecosystem level — không nằm trong thư mục này):**
- Skills: `../../.claude/skills/` — dùng chung cho tất cả engines
- Assets: `../assets/` — 3D asset library
- Sync log: `../SYNC.md`

---

## File Registry

### Root scripts

| Script | Vai trò | Khi chạy |
|---|---|---|
| `validate.js` | Quality gate: kiểm tra structure module, meta.json fields; exit 1 nếu FAIL | Sau mỗi thêm/sửa module hoặc asset |
| `check-imports.js` | Quét `00-Babylon/src/` phát hiện import sai path (không qua production/) | Sau khi copy module vào project |
| `update-index.js` | Tái tạo Living Index (Scripts / Modules / Assets) trong CLAUDE.md | SessionStart + sau validate PASS |

### Root docs

| File | Vai trò | Khi đọc |
|---|---|---|
| `CLAUDE.md` | Engine rules + coding style + Living Index | Đầu mỗi session |
| `ROADMAP.md` | Phase plan với checklist task | Khi bắt đầu phase mới hoặc check progress |
| `ARCHITECTURE.md` | File này | Khi cần hiểu workspace structure |
| `decisions/` | ADR — lý do kiến trúc | Trước khi thay đổi pattern lớn |
| `deferred/` | Tính năng hoãn | Trước khi đề xuất implement mới |

---

## Module structure (babylon-modules/)

### Categories

| Folder | Chứa gì | Babylon tương đương Three.js |
|---|---|---|
| `shaders/` | Node Material JSON + ShaderMaterial GLSL | `threejs-modules/shaders/` |
| `utils/` | Utility classes (RuntimeGuard, pool...) | `threejs-modules/utils/` |
| `components/` | Scene components (LOD, Billboard...) | `threejs-modules/components/` |
| `effects/` | VFX (particle, post-process) | `threejs-modules/effects/` |

### Module anatomy — mỗi module là 1 folder

```
babylon-modules/utils/RuntimeGuard/
├── index.ts         ← export class + types
├── meta.json        ← metadata
├── README.md        ← doc + usage example
└── example.ts       ← standalone example (optional)
```

### meta.json chuẩn

```json
{
  "name": "RuntimeGuard",
  "category": "utils",
  "babylon-version-verified": "8.x",
  "status": "ready",
  "description": "...",
  "created": "2026-xx-xx",
  "dependencies": []
}
```

**Khác với THREEJS:** field là `babylon-version-verified` (không phải `three-version-verified`).

---

## Khác biệt kiến trúc so với THREEJS

| Khía cạnh | THREEJS | BABYLONJS |
|---|---|---|
| Shader system | TSL node graph → WGSL/GLSL | Node Material JSON + ShaderMaterial GLSL |
| Verify API | `node_modules/three/src/` | `node_modules/@babylonjs/core/` |
| meta.json version field | `three-version-verified` | `babylon-version-verified` |
| Debug | Không có built-in | Inspector: `scene.debugLayer.show()` |
| Physics | Tích hợp ngoài | Havok/Rapier built-in |
| Script lint | Enforce TSL, ban ShaderMaterial | Enforce NME JSON, allow ShaderMaterial |

---

## Workflow 2 AI

| AI | Vai trò |
|---|---|
| **Claude Code** | Build module trong `babylon-modules/`, validate, tích hợp `00-Babylon/` |
| **Gemini** | Tìm/copy module từ `babylon-modules/` → project, viết `SUMMARY.md` |

Không sửa file trong `src/imported/[name]/` — giữ nguyên để diff.
