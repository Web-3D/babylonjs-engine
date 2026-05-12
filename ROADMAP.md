# ROADMAP.md — Babylon.js Engine Phases

> Source of truth cho toàn bộ hệ thống module của BABYLONJS engine.
> Bắt đầu sau khi THREEJS Phase A hoàn thành.
> Mục tiêu: rebuild cùng module để so sánh trực tiếp 2 engine.

---

## Phase A — Environment Foundation _(chờ THREEJS Phase A xong)_

Mục tiêu: rebuild Phase A của THREEJS bằng Babylon.js API để so sánh trực tiếp.

> Lưu ý Babylon.js: shader dùng Node Material Editor (visual) thay vì TSL.
> RuntimeGuard có thể dùng Inspector built-in thay vì viết class riêng.

| #   | Module            | Category | Status       | Three.js counterpart |
| --- | ----------------- | -------- | ------------ | -------------------- |
| 1   | `GlobalUniforms`  | utils    | ⏳ chưa code | `GlobalUniforms`     |
| 2   | `TriplanarMapping`| shaders  | ⏳ chưa code | `TriplanarMapping`   |
| 3   | `WorldNoise`      | shaders  | ⏳ chưa code | `WorldNoise`         |
| 4   | `RoundedCorners`  | shaders  | ⏳ chưa code | `RoundedCorners`     |

---

## Phase B — Advanced Environment & Splats _(chờ Phase A)_

| #   | Module               | Category   | Status       | Three.js counterpart |
| --- | -------------------- | ---------- | ------------ | -------------------- |
| 1   | `LODSystem`          | utils      | ⏳ chưa code | `LODSystem`          |
| 2   | `ProceduralFracture` | shaders    | ⏳ chưa code | `ProceduralFracture` |
| 3   | `InteriorMapping`    | shaders    | ⏳ chưa code | `InteriorMapping`    |
| 4   | `SparkSystem`        | components | ⏳ chưa code | `SparkSystem`        |

---

## Phase C — Character Pipeline _(chờ Phase B)_

| #   | Module          | Category   | Status       | Three.js counterpart |
| --- | --------------- | ---------- | ------------ | -------------------- |
| 1   | `VATShader`     | shaders    | ⏳ chưa code | `VATShader`          |
| 2   | `LODBillboard`  | components | ⏳ chưa code | `LODBillboard`       |
| 3   | `CharacterPool` | utils      | ⏳ chưa code | `CharacterPool`      |

---

## Phase D — Polish & Deploy _(chờ Phase C)_

| #   | Module           | Category   | Status       | Three.js counterpart |
| --- | ---------------- | ---------- | ------------ | -------------------- |
| 1   | `PostProcessing` | components | ⏳ chưa code | `PostProcessing`     |
| 2   | `WindAnimation`  | shaders    | ⏳ chưa code | `WindAnimation`      |
| 3   | `DayNightCycle`  | utils      | ⏳ chưa code | `DayNightCycle`      |

---

## Changelog

| Ngày       | Thay đổi                                                  |
| ---------- | --------------------------------------------------------- |
| 2026-05-12 | Tạo file — mirror structure từ `THREEJS/ROADMAP.md`       |
