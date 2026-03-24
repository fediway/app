export function useScrollDirection(threshold = 56) {
  const hidden = ref(false);
  let lastScrollY = 0;

  function onScroll() {
    const y = window.scrollY;
    hidden.value = y > lastScrollY && y > threshold;
    lastScrollY = y;
  }

  if (typeof window !== 'undefined') {
    onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
    onUnmounted(() => window.removeEventListener('scroll', onScroll));
  }

  return { hidden };
}
