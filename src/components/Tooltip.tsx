import React, { useState, useRef } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left + 10,
        y: e.clientY - rect.top + 10,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            backgroundColor: '#ffffe1',
            border: '1px solid #000',
            padding: '4px 8px',
            fontSize: '11px',
            fontFamily: 'Tahoma, sans-serif',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
            zIndex: 10000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            maxWidth: '250px',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
