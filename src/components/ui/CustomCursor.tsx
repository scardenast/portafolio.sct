
import React, { useState, useEffect } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      
      setIsHovering(!!target.closest('a, button'));
      setIsHidden(!!target.closest('.group.relative.cursor-none'));
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${isHidden ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
        <div
            className={`w-8 h-8 rounded-full border-2 border-white/80 transition-transform duration-300 ease-in-out -translate-x-1/2 -translate-y-1/2 ${isHovering ? 'scale-150' : 'scale-100'}`}
        ></div>
    </div>
  );
};

export default CustomCursor;