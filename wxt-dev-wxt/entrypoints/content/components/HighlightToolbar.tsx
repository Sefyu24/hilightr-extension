import React, { useState, useEffect } from 'react';
import { HighlightColor, HIGHLIGHT_COLORS } from '@/lib/types/highlight';

interface HighlightToolbarProps {
  position: { x: number; y: number };
  onColorSelect: (color: HighlightColor) => void;
  onClose: () => void;
}

export function HighlightToolbar({ position, onColorSelect, onClose }: HighlightToolbarProps) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Close toolbar when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.hilightr-toolbar')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleColorClick = (color: HighlightColor) => {
    onColorSelect(color);
    setIsHovered(false); // Close colors after selection
  };

  const colors: HighlightColor[] = ['yellow', 'pink', 'lime'];

  // Modern color palette matching the design
  const colorStyles: Record<HighlightColor, string> = {
    yellow: '#FDE047', // bright yellow
    pink: '#F472B6',   // bright pink  
    lime: '#84CC16'    // bright lime
  };


  return (
    <div 
      className="hilightr-toolbar"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        pointerEvents: 'auto',
        
        // Smaller pill design (2x smaller)
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '0px', // No gap initially for perfect centering
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', // Slower, smoother easing
        overflow: 'hidden',
        
        // Dynamic width based on hover state
        width: isHovered ? 'auto' : '32px',
        minWidth: '32px',
        height: '32px', // Fixed height for perfect circle
      }}
    >
      {/* Highlight Icon - Always visible and perfectly centered */}
      <div style={{ 
        width: '24px',
        height: '24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#D1D5DB',
        flexShrink: 0,
        cursor: 'pointer',
        // Perfect centering when collapsed
        margin: isHovered ? '0' : 'auto',
        marginLeft: isHovered ? '0' : 'auto',
        marginRight: isHovered ? '0' : 'auto',
      }}>
        <svg
          width="12" // smaller icon
          height="12" // smaller icon
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>

      {/* Color Options - Slide in from right on hover */}
      <div style={{ 
        display: 'flex', 
        gap: '3px',
        alignItems: 'center',
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateX(0)' : 'translateX(15px)',
        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Single smooth transition
        visibility: isHovered ? 'visible' : 'hidden',
        width: isHovered ? 'auto' : '0',
        overflow: 'hidden',
        marginLeft: isHovered ? '6px' : '0',
        transitionDelay: isHovered ? '0.1s' : '0.1s', // Same delay for both directions
      }}>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            style={{
              width: '16px', // smaller color dots
              height: '16px', // smaller color dots
              borderRadius: '50%',
              backgroundColor: colorStyles[color],
              border: '1px solid rgba(255, 255, 255, 0.2)', // thinner border
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={`Highlight in ${color}`}
          />
        ))}
      </div>

      {/* Close button - Appears on hover */}
      <button
        onClick={onClose}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Single smooth transition
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(15px)',
          visibility: isHovered ? 'visible' : 'hidden',
          marginLeft: isHovered ? '6px' : '0',
          flexShrink: 0,
          transitionDelay: isHovered ? '0.2s' : '0.1s', // Consistent delay
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#D1D5DB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9CA3AF';
        }}
        title="Close"
      >
        <svg
          width="10" // smaller close icon
          height="10" // smaller close icon
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}