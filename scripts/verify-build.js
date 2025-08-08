#!/usr/bin/env node

/**
 * Comprehensive build verification script
 * This script runs all build verification tests
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, '../dist')
const htmlPath = path.join(distPath, 'index.html')

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    const output = execSync(command, { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      stdio: 'pipe'
    })
    console.log(`✅ ${description} completed successfully`)
    return { success: true, output }
  } catch (error) {
    console.error(`❌ ${description} failed:`)
    console.error(error.stdout || error.message)
    return { success: false, error }
  }
}

function verifyBuildOutput() {
  console.log('🔍 Verifying build output...')
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build output directory does not exist')
    return false
  }

  // Check if index.html exists
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ index.html does not exist in dist directory')
    return false
  }

  // Check if only index.html exists (single file output)
  const files = fs.readdirSync(distPath)
  if (files.length !== 1 || files[0] !== 'index.html') {
    console.error(`❌ Expected only index.html, but found: ${files.join(', ')}`)
    return false
  }

  // Check file size
  const stats = fs.statSync(htmlPath)
  const sizeInKB = Math.round(stats.size / 1024)
  
  if (sizeInKB < 100) {
    console.error(`❌ File size too small (${sizeInKB} KB) - likely missing content`)
    return false
  }

  if (sizeInKB > 10000) {
    console.error(`❌ File size too large (${sizeInKB} KB) - may cause performance issues`)
    return false
  }

  console.log(`✅ Build output verified - Single file: ${sizeInKB} KB`)
  return true
}

function main() {
  console.log('🚀 Starting comprehensive build verification...')
  
  const tests = [
    {
      name: 'Build the project',
      command: 'npm run build',
      required: true
    },
    {
      name: 'Verify build output structure',
      fn: verifyBuildOutput,
      required: true
    },
    {
      name: 'Run build verification tests',
      command: 'npm run test:build',
      required: true
    },
    {
      name: 'Run algorithm data verification tests',
      command: 'npm run test:algorithms',
      required: true
    },
    {
      name: 'Test cross-browser compatibility',
      command: 'node scripts/test-cross-browser.js',
      required: true
    },
    {
      name: 'Run all unit tests',
      command: 'npm run test',
      required: false
    }
  ]

  let allPassed = true
  const results = []

  for (const test of tests) {
    let result
    
    if (test.fn) {
      // Custom function test
      try {
        const success = test.fn()
        result = { success, output: success ? 'Passed' : 'Failed' }
      } catch (error) {
        result = { success: false, error }
      }
    } else {
      // Command test
      result = runCommand(test.command, test.name)
    }

    results.push({ ...test, ...result })

    if (!result.success) {
      if (test.required) {
        console.error(`❌ Required test "${test.name}" failed`)
        allPassed = false
      } else {
        console.warn(`⚠️  Optional test "${test.name}" failed`)
      }
    }
  }

  // Summary
  console.log('\n📊 Build Verification Summary:')
  console.log('=' .repeat(50))
  
  results.forEach(result => {
    const status = result.success ? '✅' : (result.required ? '❌' : '⚠️ ')
    const type = result.required ? 'Required' : 'Optional'
    console.log(`${status} ${result.name} (${type})`)
  })

  console.log('=' .repeat(50))

  if (allPassed) {
    console.log('🎉 All required build verification tests passed!')
    console.log('✅ The single-file build is ready for deployment')
    
    // Display final build info
    if (fs.existsSync(htmlPath)) {
      const stats = fs.statSync(htmlPath)
      const sizeInKB = Math.round(stats.size / 1024)
      const sizeInMB = Math.round(stats.size / (1024 * 1024) * 100) / 100
      
      console.log(`\n📦 Final build: dist/index.html (${sizeInKB} KB / ${sizeInMB} MB)`)
      console.log('🌐 This file can be opened directly in any modern web browser')
      console.log('📱 Compatible with desktop and mobile browsers')
      console.log('🔒 Runs completely offline - no server required')
    }
    
    process.exit(0)
  } else {
    console.log('❌ Some required build verification tests failed')
    console.log('🔧 Please fix the issues above before deploying')
    process.exit(1)
  }
}

// Run the verification
main()