import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useBackButton } from '../useBackButton';

let backButton: ReturnType<typeof useBackButton>;
let cleanups: (() => void)[];

beforeEach(() => {
  backButton = useBackButton();
  cleanups = [];
});

afterEach(() => {
  cleanups.forEach(fn => fn());
});

describe('useBackButton', () => {
  it('calls highest priority handler first', () => {
    const order: number[] = [];
    cleanups.push(backButton.register(50, () => {
      order.push(50);
      return false;
    }));
    cleanups.push(backButton.register(100, () => {
      order.push(100);
      return true;
    }));

    backButton.handleBackButton();
    expect(order).toEqual([100]);
  });

  it('stops after first handler returns true', () => {
    const called: number[] = [];
    cleanups.push(backButton.register(50, () => {
      called.push(50);
      return true;
    }));
    cleanups.push(backButton.register(100, () => {
      called.push(100);
      return true;
    }));

    backButton.handleBackButton();
    expect(called).toEqual([100]);
  });

  it('falls through to next handler when handler returns false', () => {
    const called: number[] = [];
    cleanups.push(backButton.register(50, () => {
      called.push(50);
      return true;
    }));
    cleanups.push(backButton.register(100, () => {
      called.push(100);
      return false;
    }));

    backButton.handleBackButton();
    expect(called).toEqual([100, 50]);
  });

  it('returns false when no handlers handle the event', () => {
    cleanups.push(backButton.register(50, () => false));
    expect(backButton.handleBackButton()).toBe(false);
  });

  it('unregister removes handler', () => {
    const called: number[] = [];
    const unregister = backButton.register(100, () => {
      called.push(100);
      return true;
    });
    cleanups.push(backButton.register(50, () => {
      called.push(50);
      return true;
    }));

    unregister();
    backButton.handleBackButton();
    expect(called).toEqual([50]);
  });

  it('modal (100) fires before route (50)', () => {
    const order: string[] = [];
    cleanups.push(backButton.register(50, () => {
      order.push('route');
      return true;
    }));
    cleanups.push(backButton.register(100, () => {
      order.push('modal');
      return true;
    }));

    backButton.handleBackButton();
    expect(order).toEqual(['modal']);
  });

  it('sidebar (90) fires before route (50)', () => {
    const order: string[] = [];
    cleanups.push(backButton.register(50, () => {
      order.push('route');
      return true;
    }));
    cleanups.push(backButton.register(90, () => {
      order.push('sidebar');
      return true;
    }));

    backButton.handleBackButton();
    expect(order).toEqual(['sidebar']);
  });

  it('returns false with no handlers registered', () => {
    expect(backButton.handleBackButton()).toBe(false);
  });

  it('same-priority handlers both run if first returns false', () => {
    const called: string[] = [];
    // First registered runs first (stable sort preserves insertion order)
    cleanups.push(backButton.register(50, () => {
      called.push('a');
      return false;
    }));
    cleanups.push(backButton.register(50, () => {
      called.push('b');
      return true;
    }));

    backButton.handleBackButton();
    expect(called).toEqual(['a', 'b']);
  });

  it('double unregister does not crash', () => {
    const unregister = backButton.register(50, () => true);
    unregister();
    unregister();
    expect(backButton.handleBackButton()).toBe(false);
  });
});
