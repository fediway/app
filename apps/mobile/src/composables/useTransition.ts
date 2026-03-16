import { ref } from 'vue';

export type TransitionType = 'fade' | 'slide-left' | 'slide-right';

const transitionName = ref<TransitionType>('fade');

export function useTransition() {
  function setFade() {
    transitionName.value = 'fade';
  }

  function setSlideLeft() {
    transitionName.value = 'slide-left';
  }

  function setSlideRight() {
    transitionName.value = 'slide-right';
  }

  return {
    transitionName,
    setFade,
    setSlideLeft,
    setSlideRight,
  };
}
