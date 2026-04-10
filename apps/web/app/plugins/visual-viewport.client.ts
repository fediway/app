export default defineNuxtPlugin(() => {
  function update() {
    const vh = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--dvh', `${vh}px`);
  }

  update();
  window.visualViewport?.addEventListener('resize', update);
  window.addEventListener('resize', update);
});
