/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Build Verification', () => {
  const distPath = path.join(__dirname, '../../dist')
  const htmlPath = path.join(distPath, 'index.html')
  let htmlContent: string

  beforeAll(() => {
    // Check if build output exists
    if (!fs.existsSync(distPath)) {
      throw new Error('Build output directory does not exist. Run "npm run build" first.')
    }
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error('index.html does not exist in dist directory. Run "npm run build" first.')
    }

    htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  })

  it('should generate only a single HTML file', () => {
    const files = fs.readdirSync(distPath)
    expect(files).toEqual(['index.html'])
  })

  it('should have all CSS inlined', () => {
    // Should not have external CSS references
    expect(htmlContent).not.toMatch(/<link[^>]*rel="stylesheet"[^>]*href=/i)
    
    // Should have inline styles
    expect(htmlContent).toMatch(/<style[^>]*>/i)
  })

  it('should have all JavaScript inlined', () => {
    // Should not have external JS references
    expect(htmlContent).not.toMatch(/<script[^>]*src=/i)
    
    // Should have inline JavaScript
    expect(htmlContent).toMatch(/<script[^>]*>.*<\/script>/s)
  })

  it('should not have external asset references', () => {
    // Should not reference external images, fonts, or other assets
    expect(htmlContent).not.toMatch(/href="[^"]*\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)"/i)
    expect(htmlContent).not.toMatch(/src="[^"]*\.(js|png|jpg|jpeg|gif|svg)"/i)
  })

  it('should have proper HTML structure', () => {
    expect(htmlContent).toMatch(/<!doctype html>/i)
    expect(htmlContent).toMatch(/<html[^>]*>/i)
    expect(htmlContent).toMatch(/<head[^>]*>/i)
    expect(htmlContent).toMatch(/<body[^>]*>/i)
    expect(htmlContent).toMatch(/<div[^>]*id="root"[^>]*>/i)
  })

  it('should have the correct title', () => {
    expect(htmlContent).toMatch(/<title>Rubik's Cube Algorithm Visualizer<\/title>/)
  })

  it('should be a reasonable size (not empty, not too large)', () => {
    const stats = fs.statSync(htmlPath)
    const sizeInKB = stats.size / 1024
    
    // Should be at least 100KB (has substantial content)
    expect(sizeInKB).toBeGreaterThan(100)
    
    // Should be less than 5MB (reasonable for a single file)
    expect(sizeInKB).toBeLessThan(5000)
  })

  it('should contain algorithm data', () => {
    // Should contain embedded algorithm data
    expect(htmlContent).toMatch(/edge.*algorithms|corner.*algorithms/i)
    
    // Should contain some algorithm notations (Japanese characters or algorithm patterns)
    expect(htmlContent).toMatch(/[ア-ン]|[A-Z][a-z]|[UDLRFB]/i)
  })

  it('should contain React and Three.js code', () => {
    // Should contain React code
    expect(htmlContent).toMatch(/react/i)
    
    // Should contain Three.js code
    expect(htmlContent).toMatch(/three|THREE/i)
    
    // Should contain React Three Fiber code
    expect(htmlContent).toMatch(/fiber|canvas|mesh/i)
  })

  it('should be valid HTML', () => {
    // Basic HTML validation - should have matching tags
    const openTags = (htmlContent.match(/<[^/][^>]*>/g) || []).length
    const closeTags = (htmlContent.match(/<\/[^>]*>/g) || []).length
    const selfClosingTags = (htmlContent.match(/<[^>]*\/>/g) || []).length
    
    // Self-closing tags don't need closing tags
    expect(openTags - selfClosingTags).toBeGreaterThanOrEqual(closeTags - 5) // Allow some tolerance
  })
})