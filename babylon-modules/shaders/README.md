# shaders — Babylon.js Shader Modules

Hai dạng shader trong Babylon.js:

| Dạng | Khi dùng | File |
|---|---|---|
| Node Material JSON | Visual shader, export từ Node Material Editor | `[Name]/[name].json` + `index.ts` |
| ShaderMaterial GLSL | Custom shader cần precision cao | `[Name]/[name].glsl` + `index.ts` |

Babylon.js tự convert GLSL → WGSL khi chạy WebGPU. Không cần viết WGSL tay.

## Modules

_Chưa có module nào. Phase A bắt đầu từ `TriplanarMapping`._
