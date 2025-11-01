"use client";

import { useState, useEffect } from 'react';

interface JoystickProps {
  mapInstance: any;
  isActive: boolean;
}

export default function Joystick({ mapInstance, isActive }: JoystickProps) {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [zoomSpeed, setZoomSpeed] = useState(1);

  // Joystick movement effect
  useEffect(() => {
    if (!joystickActive || !mapInstance) return;

    const panInterval = setInterval(() => {
      if (mapInstance && (joystickPosition.x !== 0 || joystickPosition.y !== 0)) {
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        
        // Smart speed formula with adjustable sensitivity
        const baseSpeed = 0.005 * Math.pow(zoomSpeed, 1.5);
        const zoomFactor = Math.pow(2, 12 - zoom);
        const moveAmount = baseSpeed * zoomFactor;
        
        // Limit speed based on sensitivity
        const maxSpeed = 0.05 * zoomSpeed;
        const clampedMoveAmount = Math.max(0.0001, Math.min(maxSpeed, moveAmount));
        
        // Move map (in joystick direction)
        const newLat = center.lat - (joystickPosition.y * clampedMoveAmount);
        const newLng = center.lng + (joystickPosition.x * clampedMoveAmount);
        
        mapInstance.panTo([newLat, newLng], {
          animate: true,
          duration: 0.1,
          easeLinearity: 1
        });
      }
    }, 50);

    return () => clearInterval(panInterval);
  }, [joystickActive, joystickPosition, mapInstance, zoomSpeed]);

  if (!isActive || !mapInstance) return null;

  return (
    <div 
      className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[9998] flex flex-col gap-1 select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="relative">
        {/* Joystick Base */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 dark:from-blue-600/40 dark:to-purple-700/40 shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white/20 dark:border-white/10 flex items-center justify-center">
          {/* Joystick Handle */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:shadow-xl cursor-pointer transition-all duration-200 flex items-center justify-center ${
              joystickActive ? 'scale-90' : 'scale-100 hover:scale-105'
            }`}
            style={{
              transform: `translate(${joystickPosition.x * 20}px, ${joystickPosition.y * 20}px)`,
              transition: joystickActive ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              touchAction: 'none',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setJoystickActive(true);
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
                if (!rect) return;
                
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                let deltaX = (moveEvent.clientX - centerX) / 40;
                let deltaY = (moveEvent.clientY - centerY) / 40;
                
                // Limit to circle
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 1) {
                  deltaX /= distance;
                  deltaY /= distance;
                }
                
                setJoystickPosition({ x: deltaX, y: deltaY });
              };
              
              const handleMouseUp = () => {
                setJoystickActive(false);
                setJoystickPosition({ x: 0, y: 0 });
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };
              
              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
            onTouchStart={(e) => {
              setJoystickActive(true);
              
              const handleTouchMove = (moveEvent: TouchEvent) => {
                const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
                if (!rect) return;
                
                const touch = moveEvent.touches[0];
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                let deltaX = (touch.clientX - centerX) / 40;
                let deltaY = (touch.clientY - centerY) / 40;
                
                // Limit to circle
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 1) {
                  deltaX /= distance;
                  deltaY /= distance;
                }
                
                setJoystickPosition({ x: deltaX, y: deltaY });
              };
              
              const handleTouchEnd = () => {
                setJoystickActive(false);
                setJoystickPosition({ x: 0, y: 0 });
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
              };
              
              window.addEventListener('touchmove', handleTouchMove);
              window.addEventListener('touchend', handleTouchEnd);
            }}
          >
            {/* Direction Icon */}
            <div className="text-white/90 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            
            {/* Light Ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-lg transition-opacity duration-200 ${
              joystickActive ? 'opacity-60' : 'opacity-0'
            }`}></div>
          </div>
        </div>
      </div>
      
      {/* Speed Slider */}
      <div className="mt-0.5">
        <input
          type="range"
          min="1"
          max="5"
          value={zoomSpeed}
          onChange={(e) => setZoomSpeed(Number(e.target.value))}
          className="w-12 sm:w-16 md:w-20 lg:w-24 h-1 sm:h-1.5 md:h-2 bg-blue-200/80 dark:bg-blue-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500 backdrop-blur-sm shadow-lg"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>
    </div>
  );
}
