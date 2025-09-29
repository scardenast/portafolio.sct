
import { useState, useEffect, RefObject } from 'react';

function useOnScreen(ref: RefObject<HTMLElement>, threshold: number = 0.1): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          // observer.unobserve(entry.target); // Optional: uncomment if you want to trigger animation only once
        } else {
            setIntersecting(false); // Optional: allows re-triggering animation
        }
      },
      {
        rootMargin: '0px',
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold]);

  return isIntersecting;
}

export default useOnScreen;