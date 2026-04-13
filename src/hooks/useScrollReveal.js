import { useEffect } from 'react';

/**
 * useScrollReveal Hook
 * Automatically handles adding the 'active' class to elements with the 'reveal' class
 * as they enter the viewport.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15, // Trigger when 15% of the element is visible
    };

    const handleReveal = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleReveal, observerOptions);
    
    // Find all elements with the reveal class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []); // Run once on mount
};
