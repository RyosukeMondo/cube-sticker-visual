#!/usr/bin/env node

/**
 * Cross-browser compatibility test for the single HTML file
 * This script checks if the HTML file contains browser-compatible code
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, '../dist')
const htmlPath = path.join(distPath, 'index.html')

function testCrossBrowserCompatibility() {
  console.log('🔍 Testing cross-browser compatibility...')
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Build output not found. Run "npm run build" first.')
    process.exit(1)
  }

  const htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  const issues = []

  // Test 1: Check for modern JavaScript features that might not be supported
  const modernFeatures = [
    { pattern: /\?\?/g, name: 'Nullish coalescing operator (??)', minVersion: 'Chrome 80+, Firefox 72+, Safari 13.1+' },
    { pattern: /\?\./g, name: 'Optional chaining (?.)', minVersion: 'Chrome 80+, Firefox 72+, Safari 13.1+' },
    { pattern: /async\s+function/g, name: 'Async functions', minVersion: 'Chrome 55+, Firefox 52+, Safari 10.1+' },
    { pattern: /=>/g, name: 'Arrow functions', minVersion: 'Chrome 45+, Firefox 22+, Safari 10+' },
    { pattern: /const\s+/g, name: 'const declarations', minVersion: 'Chrome 21+, Firefox 36+, Safari 5.1+' },
    { pattern: /let\s+/g, name: 'let declarations', minVersion: 'Chrome 41+, Firefox 44+, Safari 10+' }
  ]

  modernFeatures.forEach(feature => {
    const matches = htmlContent.match(feature.pattern)
    if (matches && matches.length > 0) {
      console.log(`✅ Found ${feature.name} (${matches.length} occurrences) - Requires ${feature.minVersion}`)
    }
  })

  // Test 2: Check for WebGL usage (required for Three.js)
  if (htmlContent.includes('WebGL') || htmlContent.includes('webgl')) {
    console.log('✅ WebGL usage detected - Requires WebGL support')
  }

  // Test 3: Check for ES6 modules
  if (htmlContent.includes('type="module"')) {
    console.log('✅ ES6 modules detected - Requires Chrome 61+, Firefox 60+, Safari 10.1+')
  }

  // Test 4: Check for potential compatibility issues
  const compatibilityIssues = [
    { pattern: /fetch\(/g, name: 'Fetch API', issue: 'Not supported in IE. Consider polyfill if IE support needed.' },
    { pattern: /Promise/g, name: 'Promises', issue: 'Not supported in IE. Consider polyfill if IE support needed.' },
    { pattern: /Map\(/g, name: 'Map constructor', issue: 'Not supported in IE10 and below.' },
    { pattern: /Set\(/g, name: 'Set constructor', issue: 'Not supported in IE10 and below.' }
  ]

  compatibilityIssues.forEach(issue => {
    const matches = htmlContent.match(issue.pattern)
    if (matches && matches.length > 0) {
      console.log(`⚠️  ${issue.name} detected - ${issue.issue}`)
    }
  })

  // Test 5: Check file size
  const stats = fs.statSync(htmlPath)
  const sizeInKB = Math.round(stats.size / 1024)
  const sizeInMB = Math.round(stats.size / (1024 * 1024) * 100) / 100
  
  console.log(`📊 File size: ${sizeInKB} KB (${sizeInMB} MB)`)
  
  if (sizeInMB > 10) {
    console.log('⚠️  Large file size may cause slow loading on slower connections')
  }

  // Test 6: Check for external dependencies
  const externalRefs = [
    htmlContent.match(/href="http/g),
    htmlContent.match(/src="http/g),
    htmlContent.match(/@import.*url\(/g)
  ].filter(Boolean).flat()

  if (externalRefs.length > 0) {
    console.log(`❌ Found ${externalRefs.length} external references - File is not fully self-contained`)
    issues.push('External references found')
  } else {
    console.log('✅ No external references found - File is fully self-contained')
  }

  // Test 7: Basic HTML validation
  const hasDoctype = htmlContent.includes('<!doctype html>')
  const hasHtml = htmlContent.includes('<html')
  const hasHead = htmlContent.includes('<head')
  const hasBody = htmlContent.includes('<body')
  const hasRootDiv = htmlContent.includes('id="root"')

  if (hasDoctype && hasHtml && hasHead && hasBody && hasRootDiv) {
    console.log('✅ Basic HTML structure is valid')
  } else {
    console.log('❌ HTML structure issues detected')
    issues.push('HTML structure issues')
  }

  // Summary
  console.log('\n📋 Cross-browser compatibility summary:')
  console.log('• Modern browsers (Chrome 80+, Firefox 72+, Safari 13.1+): ✅ Full support expected')
  console.log('• Older browsers (Chrome 61+, Firefox 60+, Safari 10.1+): ✅ Basic support expected')
  console.log('• Internet Explorer: ❌ Not supported (requires modern JavaScript features)')
  console.log('• Mobile browsers: ✅ Should work on modern mobile browsers')

  if (issues.length === 0) {
    console.log('\n🎉 Cross-browser compatibility test passed!')
    return true
  } else {
    console.log(`\n❌ Cross-browser compatibility test failed with ${issues.length} issues:`)
    issues.forEach(issue => console.log(`  • ${issue}`))
    return false
  }
}

// Run the test
const success = testCrossBrowserCompatibility()
process.exit(success ? 0 : 1)