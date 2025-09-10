export interface SelectionInfo {
  text: string;
  range: Range;
  rect: DOMRect;
}

/**
 * Get the current text selection if it exists and is valid
 */
export function getSelection(): SelectionInfo | null {
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const text = selection.toString().trim();

  // Minimum 1 character required
  if (text.length < 1) {
    return null;
  }

  // Get the bounding rectangle of the selection
  const rect = range.getBoundingClientRect();

  return {
    text,
    range,
    rect
  };
}

/**
 * Calculate the position for the toolbar based on selection
 */
export function calculateToolbarPosition(selectionRect: DOMRect): { x: number; y: number } {
  // Get scroll positions
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  // Position at top-right of selection, properly above the text
  const absoluteX = selectionRect.right + scrollX - 16; // 16px from right edge (half toolbar width)
  const absoluteY = selectionRect.top + scrollY;
  
  // Position toolbar well above selection to avoid overlapping text
  let toolbarY = absoluteY - 50; // 50px above the top of selection
  
  // If toolbar would be above the viewport (considering scroll), position it below
  if (toolbarY - scrollY < 10) {
    toolbarY = absoluteY + selectionRect.height + 10;
  }

  // Ensure toolbar stays within viewport horizontally
  const padding = 10;
  const viewportWidth = window.innerWidth;
  const toolbarX = Math.min(Math.max(padding + scrollX, absoluteX), viewportWidth + scrollX - padding - 100); // 100px estimated max toolbar width
  

  return {
    x: toolbarX,
    y: toolbarY
  };
}

/**
 * Get XPath of a node for persistent storage
 */
export function getXPath(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return getXPath(node.parentNode!) + '/text()';
  }

  const paths: string[] = [];
  
  for (; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentNode!) {
    const element = node as Element;
    let index = 0;
    let hasFollowingSiblings = false;

    for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
      if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) {
        continue;
      }
      if (sibling.nodeName === element.nodeName) {
        ++index;
      }
    }

    for (let sibling = element.nextSibling; sibling && !hasFollowingSiblings; sibling = sibling.nextSibling) {
      if (sibling.nodeName === element.nodeName) {
        hasFollowingSiblings = true;
      }
    }

    const tagName = element.nodeName.toLowerCase();
    const pathIndex = index || hasFollowingSiblings ? `[${index + 1}]` : '';
    paths.unshift(`${tagName}${pathIndex}`);
  }

  return paths.length ? '/' + paths.join('/') : '';
}

/**
 * Clear the current selection
 */
export function clearSelection(): void {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}