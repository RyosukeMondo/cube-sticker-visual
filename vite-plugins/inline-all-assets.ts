import type { Plugin } from 'vite'

export function inlineAllAssetsPlugin(): Plugin {
  return {
    name: 'inline-all-assets',
    apply: 'build',
    generateBundle(_, bundle) {
      // Find the HTML file
      const htmlFile = Object.keys(bundle).find(fileName => fileName.endsWith('.html'))
      if (!htmlFile) return

      const htmlBundle = bundle[htmlFile]
      if (htmlBundle.type !== 'asset' || typeof htmlBundle.source !== 'string') return

      let html = htmlBundle.source

      // Remove favicon reference since we want a completely self-contained file
      html = html.replace(/<link[^>]*rel="icon"[^>]*>/gi, '')

      // Ensure all CSS and JS are inlined (vite-plugin-singlefile should handle this)
      // But let's also remove any remaining external references
      html = html.replace(/href="[^"]*vite\.svg"/g, '')
      html = html.replace(/src="[^"]*vite\.svg"/g, '')

      // Update the HTML content
      htmlBundle.source = html

      // Remove any asset files that shouldn't be in the final output
      Object.keys(bundle).forEach(fileName => {
        if (fileName !== htmlFile) {
          // Remove all non-HTML files since everything should be inlined
          if (fileName.endsWith('.svg') || 
              fileName.endsWith('.css') || 
              fileName.endsWith('.js') ||
              fileName.endsWith('.csv')) {
            delete bundle[fileName]
          }
        }
      })
    }
  }
}