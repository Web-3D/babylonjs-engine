---
name: dispose-pattern
description: PLACEHOLDER — chưa implement. Sẽ build khi THREEJS Phase A hoàn thành và BABYLONJS Phase A bắt đầu. Do NOT trigger this skill yet.
---

## Status: Placeholder

> Build khi: THREEJS Phase A xong + `00-Babylon/` project tạo xong.

Skill này sẽ cover dispose pattern cho Babylon.js resources:
- `Mesh.dispose()`
- `Material.dispose()`
- `Texture.dispose()`
- `Engine.dispose()` — tự gọi `scene.dispose()` bên trong

Babylon.js khác Three.js: `scene.dispose()` dọn toàn bộ scene tree.
Pattern sẽ khác `dispose-pattern` của Three.js ở chỗ Scene là container chính.

---

_Tham chiếu: Three.js `dispose-pattern` để biết cấu trúc skill cần build._
