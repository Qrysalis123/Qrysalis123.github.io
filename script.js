async function loadMarkdown() {
  try {
    const response = await fetch('page.md');
    const markdown = await response.text();
    
    // Wait for marked to be available
    if (typeof marked === 'undefined') {
      console.error('Marked library not loaded');
      document.getElementById('content').innerHTML = '<p>Error: Markdown library not loaded</p>';
      return;
    }
    
    // Custom renderer for videos and images
    const renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
      console.log('Image renderer called with:', { href, title, text, type: typeof href });
      
      // Handle different parameter formats - href might be an object or string
      let hrefStr = '';
      if (typeof href === 'string') {
        hrefStr = href;
      } else if (href && typeof href === 'object') {
        // If href is an object, try to extract the URL
        hrefStr = href.href || href.url || href.src || '';
      } else {
        hrefStr = String(href || '');
      }
      
      console.log('Processed href:', hrefStr);
      
      // Check if it's a video file
      if (hrefStr.endsWith('.mp4')) {
        return `<video class="markdown-video" src="${hrefStr}" autoplay loop muted playsinline></video>`;
      }
      
      // Regular image
      return `<img class="markdown-image" src="${hrefStr}" alt="${text || ''}" title="${title || ''}">`;
    };
    
    // Configure marked with custom renderer
    marked.setOptions({
      breaks: true,
      gfm: true,
      renderer: renderer
    });
    
    const html = marked.parse(markdown);
    console.log('Generated HTML:', html);
    document.getElementById('content').innerHTML = html;
  } catch (error) {
    console.error('Error loading markdown:', error);
    document.getElementById('content').innerHTML = '<p>Error loading content</p>';
  }
}

// Wait for both DOM and marked library to be ready
function initializeApp() {
  if (typeof marked !== 'undefined') {
    loadMarkdown();
  } else {
    // If marked isn't loaded yet, wait a bit and try again
    setTimeout(initializeApp, 100);
  }
}

// Load content when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
