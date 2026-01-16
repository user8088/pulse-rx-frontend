'use client';

import { useEffect, useState, useRef } from 'react';

export default function MagicCursor() {
  const [cursorText, setCursorText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    // Add class to body to hide default cursor
    document.body.classList.add('magic-cursor-active');

    const ratio = 0.15;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (!isInitializedRef.current) {
        cursorPosRef.current = { x: e.clientX, y: e.clientY };
        isInitializedRef.current = true;
        setIsVisible(true);
      }
    };

    const updatePosition = () => {
      if (isInitializedRef.current) {
        if (!isHovering) {
          cursorPosRef.current.x += (mousePosRef.current.x - cursorPosRef.current.x) * ratio;
          cursorPosRef.current.y += (mousePosRef.current.y - cursorPosRef.current.y) * ratio;
        } else {
          cursorPosRef.current.x = mousePosRef.current.x;
          cursorPosRef.current.y = mousePosRef.current.y;
        }
        
        // Force re-render by updating a dummy state or use direct DOM manipulation
        const cursor = document.getElementById('magic-cursor');
        if (cursor) {
          cursor.style.left = `${cursorPosRef.current.x}px`;
          cursor.style.top = `${cursorPosRef.current.y}px`;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorElement = target.closest('[data-cursor]') as HTMLElement | null;
      
      if (cursorElement) {
        const text = cursorElement.getAttribute('data-cursor') || '';
        setCursorText(text);
        setIsHovering(true);
        setIsVisible(true);
        return;
      }
      
      // Hide cursor on links/buttons without data-cursor
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        if (!target.closest('[data-cursor]')) {
          setIsVisible(false);
          return;
        }
      }
      
      setIsVisible(true);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorElement = target.closest('[data-cursor]') as HTMLElement | null;
      
      if (cursorElement) {
        // Check if we're still within the cursor element
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        if (!relatedTarget || !cursorElement.contains(relatedTarget)) {
          setIsHovering(false);
          setCursorText('');
        }
      }
    };

    const handleDocumentMouseLeave = () => {
      setIsVisible(false);
    };

    const handleDocumentMouseEnter = () => {
      if (isInitializedRef.current) {
        setIsVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleDocumentMouseEnter);
    document.addEventListener('mouseleave', handleDocumentMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleDocumentMouseEnter);
      document.removeEventListener('mouseleave', handleDocumentMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.body.classList.remove('magic-cursor-active');
    };
  }, [isHovering]);

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  return (
    <div
      id="magic-cursor"
      className={`fixed pointer-events-none z-[99999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: 0,
        top: 0,
      }}
    >
      <div
        id="ball"
        className={`absolute rounded-full bg-black flex items-center justify-center transition-all duration-300 ${
          isHovering
            ? 'w-[110px] h-[110px] backdrop-blur-sm bg-black/90'
            : 'w-3.5 h-3.5 bg-black'
        }`}
        style={{
          transform: isHovering ? 'translate(-50%, -60%)' : 'translate(-50%, -50%)',
        }}
      >
        {isHovering && cursorText && (
          <div
            className="ball-view absolute text-white text-sm font-semibold text-center whitespace-nowrap leading-tight"
            dangerouslySetInnerHTML={{ __html: cursorText }}
          />
        )}
      </div>
    </div>
  );
}
