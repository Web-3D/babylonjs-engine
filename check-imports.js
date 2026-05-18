#!/usr/bin/env node
/**
 * VỊ TRÍ   — c:\Web-3D\BABYLONJS\check-imports.js
 * VAI TRÒ  — Đảm bảo 00-Babylon/src/ chỉ import assets từ production/
 * LIÊN HỆ  — Tương đương THREEJS/check-imports.js
 *
 * CÁCH DÙNG: node check-imports.js
 * DISPOSE: N/A
 */

const fs   = require('fs')
const path = require('path')

const ROOT    = __dirname
const SRC_DIR = path.join(ROOT, '00-Babylon', 'src')

if (!fs.existsSync(SRC_DIR)) {
  console.log('⚠  00-Babylon/src/ chưa tạo — skip')
  process.exit(0)
}

let errors = 0

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) { scanDir(full); continue }
    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.js')) continue

    const lines = fs.readFileSync(full, 'utf-8').split('\n')
    lines.forEach((line, i) => {
      // Import từ assets/ nhưng không qua production/
      if (line.includes('assets/') && !line.includes('/production/') && /^\s*(import|from)/.test(line)) {
        console.log(`✗  ${path.relative(ROOT, full)}:${i + 1}`)
        console.log(`   ${line.trim()}`)
        console.log(`   → Import assets phải qua /production/\n`)
        errors++
      }
    })
  }
}

scanDir(SRC_DIR)

if (errors === 0) {
  console.log('✓  check-imports PASS — không có import sai')
} else {
  console.log(`✗  ${errors} vi phạm — fix trước khi commit`)
  process.exit(1)
}
