
import { useRef, useEffect, useState } from 'react';

interface AnimationOptions {
  duration?: number;
  delay?: number;
  easingFn?: (t: number) => number;
}

// Easing functions
const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

/**
 * A hook for animating number values with smooth transitions
 */
export function useCountAnimation(
  endValue: number, 
  options: AnimationOptions = {}
) {
  const {
    duration = 2000,
    delay = 0,
    easingFn = easing.easeOutCubic
  } = options;
  
  const [value, setValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);
  
  useEffect(() => {
    // If there's a delay, set a timeout
    const timeoutId = setTimeout(() => {
      startValueRef.current = value;
      
      // Cancel any existing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start animation
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);
        
        const currentValue = startValueRef.current + (endValue - startValueRef.current) * easedProgress;
        setValue(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }, delay);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endValue, duration, delay, easingFn]);
  
  return Math.round(value);
}

/**
 * Hook for animating a progress value from 0 to 1
 */
export function useProgressAnimation(
  options: AnimationOptions = {}
) {
  const {
    duration = 1000,
    delay = 0,
    easingFn = easing.easeOutCubic
  } = options;
  
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Cancel any existing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start animation
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const rawProgress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(rawProgress);
        
        setProgress(easedProgress);
        
        if (rawProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }, delay);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, delay, easingFn]);
  
  return progress;
}
