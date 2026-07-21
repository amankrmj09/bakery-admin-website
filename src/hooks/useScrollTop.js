import { useState, useEffect } from 'react';

export const useScrollTop = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('main-scroll-container');
    if (!el) return;

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 10);
    };

    // Check initial state
    handleScroll();

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
};
