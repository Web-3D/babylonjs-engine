#!/usr/bin/env node
/**
 * VỊ TRÍ   — c:\Web-3D\BABYLONJS\update-index.js
 * VAI TRÒ  — Tái tạo Living Index (Scripts / Modules / Assets) trong CLAUDE.md
 * LIÊN HỆ  — Tương đương THREEJS/update-index.js
 *
 * CÁCH DÙNG: node update-index.js (tự động qua SessionStart hook)
 * DISPOSE: N/A
 */

const fs   = require('fs')
const path = require('path')

const ROOT       = __dirname
const CLAUDE_MD  = path.join(ROOT, 'CLAUDE.md')
const MODULES_DIR = path.join(ROOT, 'babylon-modules')

// ── Scan modules ───────────────────────────────────────────────────────────────

function scanModules() {
  const categories = ['shaders', 'utils', 'components', 'effects']
  const modules    = []

  for (const cat of categories) {
    const catDir = path.join(MODULES_DIR, cat)
    if (!fs.existsSync(catDir)) continue

    for (const name of fs.readdirSync(catDir)) {
      const metaPath = path.join(catDir, name, 'meta.json')
      if (!fs.existsSync(metaPath)) continue
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        modules.push({ name: meta.name || name, category: cat, status: meta.status || '⏳' })
      } catch {}
    }
  }

  return modules
}

// ── Build section content ──────────────────────────────────────────────────────

function buildModuleTable(modules) {
  if (modules.length === 0) return '_Chưa có module nào._'
  const rows = modules.map(m => `| \`${m.name}\` | ${m.category} | ${m.status} |`)
  return `| Module | Category | Status |\n|---|---|---|\n${rows.join('\n')}`
}

function buildScriptsTable() {
  return [
    '| Script | Vai trò | Khi chạy |',
    '|---|---|---|',
    '| `validate.js` | Quality gate: module + asset | Sau mỗi thêm/sửa module |',
    '| `check-imports.js` | Import path trong src/ | Sau copy module vào project |',
    '| `update-index.js` | Tái tạo Living Index | SessionStart + sau validate PASS |',
  ].join('\n')
}

function buildAssetsNote() {
  const registryPath = path.join(ROOT, '..', 'assets', 'REGISTRY.json')
  return fs.existsSync(registryPath)
    ? '_Xem [assets/REGISTRY.json](../assets/REGISTRY.json)_'
    : '_assets/REGISTRY.json chưa có_'
}

// ── Update CLAUDE.md sections ──────────────────────────────────────────────────

function updateSection(content, tag, body) {
  const re = new RegExp(`<!-- INDEX:${tag} -->[\\s\\S]*?<!-- /INDEX:${tag} -->`, 'm')
  return content.replace(re, `<!-- INDEX:${tag} -->\n${body}\n<!-- /INDEX:${tag} -->`)
}

// ── Main ───────────────────────────────────────────────────────────────────────

const modules = scanModules()
let content   = fs.readFileSync(CLAUDE_MD, 'utf-8')

content = updateSection(content, 'scripts', buildScriptsTable())
content = updateSection(content, 'modules', buildModuleTable(modules))
content = updateSection(content, 'assets',  buildAssetsNote())

fs.writeFileSync(CLAUDE_MD, content, 'utf-8')
console.log(`✓  Living Index updated — ${modules.length} module(s)`)
