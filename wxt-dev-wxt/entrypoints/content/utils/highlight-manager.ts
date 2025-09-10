import { HighlightData, HighlightColor, HIGHLIGHT_COLORS } from '@/lib/types/highlight';
import { getXPath } from './selection';


/**
 * Apply highlight to selected range
 */
export function applyHighlight(
  range: Range,
  highlightId: string,
  color: HighlightColor
): void {
  console.log('🎯 Applying highlight:', { highlightId, color, range });
  
  const highlightClass = `hilightr-highlight hilightr-highlight-${color}`;
  const highlightElement = document.createElement('span');
  
  highlightElement.className = highlightClass;
  highlightElement.setAttribute('data-highlight-id', highlightId);
  highlightElement.setAttribute('data-highlight-color', color);
  
  // Let CSS handle the colors and text color automatically
  highlightElement.style.cursor = 'pointer';
  highlightElement.style.position = 'relative';

  try {
    // Check if the range is valid and not collapsed
    if (range.collapsed) {
      console.error('❌ Range is collapsed, cannot highlight');
      return;
    }

    // Try the simple approach first
    range.surroundContents(highlightElement);
    console.log('✅ Applied highlight using surroundContents');
  } catch (error) {
    console.log('⚠️ surroundContents failed, trying safer text-only method:', error);
    
    try {
      // For cross-element selections, use a safer approach that doesn't break document structure
      const selectedText = range.toString();
      
      if (!selectedText || selectedText.trim().length === 0) {
        console.error('❌ No text content in selection');
        return;
      }
      
      // Don't extract contents for cross-element selections - just replace with highlighted text
      highlightElement.textContent = selectedText;
      range.deleteContents();
      range.insertNode(highlightElement);
      
      // Debug the actual DOM structure created
      console.log('🔍 DEBUG extractContents result:');
      console.log('- Element tag:', highlightElement.tagName);
      console.log('- Element classes:', highlightElement.className);
      console.log('- Element innerHTML:', highlightElement.innerHTML);
      console.log('- Element outerHTML:', highlightElement.outerHTML);
      console.log('- Contents childNodes:', contents.childNodes);
      console.log('- Parent element:', highlightElement.parentElement);
      
      // Force a reflow to ensure CSS classes are applied
      highlightElement.offsetHeight;
      
      console.log('✅ Applied highlight using text-only method (preserves document structure)');
    } catch (secondError) {
      console.error('❌ Both highlight methods failed:', secondError);
      
      // Last resort: clone the range and try again
      try {
        const clonedRange = range.cloneRange();
        const text = clonedRange.toString();
        
        if (text.length > 0) {
          highlightElement.textContent = text;
          
          range.deleteContents();
          range.insertNode(highlightElement);
          console.log('✅ Applied highlight using fallback method - CSS classes will handle styling');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback highlight method failed:', fallbackError);
      }
    }
  }
}

/**
 * Remove highlight by ID
 */
export function removeHighlight(highlightId: string): void {
  const highlights = document.querySelectorAll(`[data-highlight-id="${highlightId}"]`);
  
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    while (highlight.firstChild) {
      parent?.insertBefore(highlight.firstChild, highlight);
    }
    parent?.removeChild(highlight);
  });
}

/**
 * Create highlight data object for storage
 */
export function createHighlightData(
  text: string,
  range: Range,
  color: HighlightColor,
  note: string = ''
): HighlightData {
  return {
    id: crypto.randomUUID(),
    url: window.location.href,
    domain: window.location.hostname,
    title: document.title,
    highlightedText: text,
    color,
    note,
    position: {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainer: getXPath(range.startContainer),
      endContainer: getXPath(range.endContainer)
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Get all highlights on the current page
 */
export function getAllHighlights(): NodeListOf<HTMLElement> {
  return document.querySelectorAll('.hilightr-highlight');
}

/**
 * Restore highlights from stored data (for future use)
 */
export function restoreHighlights(highlights: HighlightData[]): void {
  highlights.forEach(highlight => {
    try {
      // This is a simplified version - full implementation would need to
      // reconstruct the range from XPath and offsets
      const elements = document.querySelectorAll(`[data-highlight-id="${highlight.id}"]`);
      if (elements.length === 0) {
        // Highlight doesn't exist, would need to recreate it
        console.log('Would restore highlight:', highlight.id);
      }
    } catch (error) {
      console.error('Error restoring highlight:', error);
    }
  });
}

/**
 * Add hover effect to highlights
 */
export function addHighlightListeners(): void {
  const highlights = getAllHighlights();
  
  highlights.forEach(highlight => {
    highlight.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.8';
    });
    
    highlight.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement;
      target.style.opacity = '1';
    });
    
    highlight.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const highlightId = target.getAttribute('data-highlight-id');
      console.log('Clicked highlight:', highlightId);
      // Future: Show note or edit options
    });
  });
}