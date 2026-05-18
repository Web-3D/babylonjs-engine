#!/usr/bin/env node
/**
 * VỊ TRÍ   — c:\Web-3D\BABYLONJS\validate.js
 * VAI TRÒ  — Quality gate: kiểm tra babylon-modules/ và assets/ sau mỗi thay đổi
 * LIÊN HỆ  — Tương đương THREEJS/validate.js nhưng dùng babylon-version-verified
 *
 * CÁCH DÙNG:
 *   node validate.js babylon-modules/utils/GlobalUniforms
 *   node validate.js ../assets/props/chair
 * DISPOSE: N/A
 */

const fs   = require('fs')
const path = require('path')

const ROOT   = __dirname
const target = process.argv[2]

if (!target) {
  console.error('Usage: node validate.js <path>')
  console.error('  babylon-modules/[category]/[Name]')
  console.error('  ../assets/[category]/[name]')
  process.exit(1)
}

const absTarget = path.resolve(ROOT, target)

if (!fs.existsSync(absTarget)) {
  console.error(`✗  Not found: ${absTarget}`)
  process.exit(1)
}

// ── Detect mode ────────────────────────────────────────────────────────────────

const norm = target.replace(/\\/g, '/')

if (norm.startsWith('babylon-modules/')) {
  validateModule(absTarget)
} else if (norm.includes('assets/')) {
  validateAsset(absTarget)
} else {
  console.error('✗  Unknown target. Must start with babylon-modules/ or contain assets/')
  process.exit(1)
}

// ── Module validation ──────────────────────────────────────────────────────────

function validateModule(dir) {
  const name   = path.basename(dir)
  const errors = []

  for (const file of ['index.ts', 'meta.json', 'README.md']) {
    if (!fs.existsSync(path.join(dir, file))) errors.push(`Missing: ${file}`)
  }

  const metaPath = path.join(dir, 'meta.json')
  if (fs.existsSync(metaPath)) {
    try {
      const meta     = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      const required = ['name', 'category', 'babylon-version-verified', 'status', 'description', 'created']
      for (const field of required) {
        if (!meta[field]) errors.push(`meta.json missing field: ${field}`)
      }
    } catch {
      errors.push('meta.json: parse error')
    }
  }

  report(name, errors)
}

// ── Asset validation ───────────────────────────────────────────────────────────

// Asset structure shared với THREEJS — same production/ layout

function validateAsset(dir) {
  const name   = path.basename(dir)
  const errors = []

  if (!fs.existsSync(path.join(dir, 'production'))) {
    errors.push('Missing: production/ folder')
  }

  const metaPath = path.join(dir, 'meta.json')
  if (!fs.existsSync(metaPath)) {
    errors.push('Missing: meta.json')
  } else {
    try {
      const meta     = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      const required = ['name', 'category', 'source-tool', 'status', 'description', 'created']
      for (const field of required) {
        if (!meta[field]) errors.push(`meta.json missing field: ${field}`)
      }
    } catch {
      errors.push('meta.json: parse error')
    }
  }

  report(name, errors)
}

// ── Reporter ───────────────────────────────────────────────────────────────────

function report(name, errors) {
  if (errors.length) {
    console.log(`\n✗  ${name} — FAIL\n`)
    for (const e of errors) console.log(`   · ${e}`)
    console.log()
    process.exit(1)
  }
  console.log(`\n✓  ${name} — PASS\n`)
}
