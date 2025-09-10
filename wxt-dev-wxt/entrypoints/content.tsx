import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { HighlightToolbar } from './content/components/HighlightToolbar';
import { getSelection, calculateToolbarPosition, clearSelection } from './content/utils/selection';
import { applyHighlight, createHighlightData, addHighlightListeners } from './content/utils/highlight-manager';
import { HighlightColor } from '@/lib/types/highlight';
import './content/styles/toolbar.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Create container for React components
    const reactRoot = document.createElement('div');
    reactRoot.id = 'hilightr-react-root';
    
    // Apply styles immediately and forcefully to prevent any layout interference
    const rootStyles = {
      position: 'fixed',
      top: '0',
      left: '0', 
      width: '0',
      height: '0',
      overflow: 'visible',
      zIndex: '2147483647',
      pointerEvents: 'none',
      margin: '0',
      padding: '0',
      border: 'none',
      outline: 'none',
      boxSizing: 'content-box',
      display: 'block'
    };
    
    // Apply styles with !important
    Object.entries(rootStyles).forEach(([property, value]) => {
      reactRoot.style.setProperty(property, value, 'important');
    });
    
    document.body.appendChild(reactRoot);

    // Initialize React
    const root = ReactDOM.createRoot(reactRoot);

    // Content script app component
    function ContentApp() {
      const [showToolbar, setShowToolbar] = useState(false);
      const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
      const [currentSelection, setCurrentSelection] = useState<ReturnType<typeof getSelection>>(null);

      useEffect(() => {
        // Show toolbar when user finishes selecting text
        const handleMouseUp = () => {
          // Small delay to ensure selection is complete
          setTimeout(() => {
            const selection = getSelection();
            
            if (selection && selection.text.length > 0) {
              const position = calculateToolbarPosition(selection.rect);
              setToolbarPosition(position);
              setCurrentSelection(selection);
              setShowToolbar(true);
            }
          }, 10);
        };

        // Hide toolbar when selection is cleared
        const handleSelectionChange = () => {
          const selectedText = window.getSelection()?.toString() || '';
          if (selectedText.length === 0) {
            setShowToolbar(false);
            setCurrentSelection(null);
          }
        };

        // Hide toolbar on scroll
        const handleScroll = () => {
          setShowToolbar(false);
          setCurrentSelection(null);
        };

        // Hide toolbar when clicking elsewhere (but not on the toolbar itself)
        const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.hilightr-toolbar')) {
            setShowToolbar(false);
            setCurrentSelection(null);
          }
        };

        // Add event listeners
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll);

        // Add listeners to existing highlights
        addHighlightListeners();

        return () => {
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('selectionchange', handleSelectionChange);
          document.removeEventListener('click', handleClick);
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);

      const handleColorSelect = (color: HighlightColor) => {
        if (!currentSelection) return;

        // Create highlight data
        const highlightData = createHighlightData(
          currentSelection.text,
          currentSelection.range,
          color,
          '' // Empty note for now
        );

        // Debug the selection and range
        console.log('🔍 Selection details:', {
          text: currentSelection.text,
          rangeStartContainer: currentSelection.range.startContainer,
          rangeEndContainer: currentSelection.range.endContainer,
          rangeStartOffset: currentSelection.range.startOffset,
          rangeEndOffset: currentSelection.range.endOffset,
          rangeCommonAncestor: currentSelection.range.commonAncestorContainer
        });

        // Apply highlight to DOM
        try {
          applyHighlight(currentSelection.range, highlightData.id, color);
          console.log('✅ Highlight applied successfully');
        } catch (error) {
          console.error('❌ Error applying highlight:', error);
        }

        // Log the highlight data (will be sent to background script later)
        console.log('🎨 Highlight created:', {
          url: highlightData.url,
          highlightedText: highlightData.highlightedText,
          color: highlightData.color,
          note: highlightData.note,
          id: highlightData.id,
          timestamp: highlightData.createdAt
        });

        // Clear selection and hide toolbar
        clearSelection();
        setShowToolbar(false);
        setCurrentSelection(null);

        // Add listeners to the new highlight
        setTimeout(() => addHighlightListeners(), 100);

        // TODO: Send to background script for storage
        // chrome.runtime.sendMessage({
        //   type: 'CREATE_HIGHLIGHT',
        //   data: highlightData
        // });
      };

      const handleToolbarClose = () => {
        setShowToolbar(false);
        setCurrentSelection(null);
      };


      return (
        <>
          {showToolbar && createPortal(
            <HighlightToolbar
              position={toolbarPosition}
              onColorSelect={handleColorSelect}
              onClose={handleToolbarClose}
            />,
            document.body
          )}
        </>
      );
    }

    // Render the app
    root.render(<ContentApp />);

    console.log('✨ Hilightr content script loaded');
  },
});