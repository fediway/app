// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock state
const mockUpdateProps = vi.fn();
const mockDestroy = vi.fn();
const mockOnKeyDown = vi.fn();
let capturedProps: any = null;

class MockVueRenderer {
  element = document.createElement('div');
  ref = { onKeyDown: mockOnKeyDown };
  updateProps = mockUpdateProps;
  destroy = mockDestroy;

  constructor(_component: any, opts: any) {
    capturedProps = opts.props;
  }
}

vi.mock('@tiptap/vue-3', () => ({
  VueRenderer: MockVueRenderer,
}));

const mockSetProps = vi.fn();
const mockTippyDestroy = vi.fn();
const mockTippyHide = vi.fn();
const tippyMock = vi.fn().mockImplementation(() => ({
  setProps: mockSetProps,
  destroy: mockTippyDestroy,
  hide: mockTippyHide,
}));

vi.mock('tippy.js', () => ({ default: tippyMock }));

// Import after mocks are configured
const { createSuggestionRenderer } = await import('../suggestion');

const DummyComponent = {};

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ id: '1', label: 'Test' }],
    command: vi.fn(),
    clientRect: () => new DOMRect(0, 0, 100, 20),
    editor: { view: { dom: document.createElement('div') } },
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  capturedProps = null;
});

describe('createSuggestionRenderer', () => {
  describe('lifecycle', () => {
    it('onStart creates tippy with correct options', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());

      expect(tippyMock).toHaveBeenCalledWith(
        document.body,
        expect.objectContaining({
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
        }),
      );
    });

    it('onStart with null clientRect does not create tippy', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps({ clientRect: null }));

      expect(tippyMock).not.toHaveBeenCalled();
    });

    it('onUpdate updates suggestions', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());
      handlers.onUpdate!(makeProps({ items: [{ id: '2' }] }));

      expect(mockUpdateProps).toHaveBeenCalledWith(expect.objectContaining({
        suggestions: [{ id: '2' }],
      }));
    });

    it('onExit destroys popup and renderer', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());
      handlers.onExit!(makeProps());

      expect(mockTippyDestroy).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('escape hides popup', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());

      const result = handlers.onKeyDown!({ event: new KeyboardEvent('keydown', { key: 'Escape' }) });

      expect(mockTippyHide).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('delegates other keys to component', () => {
      mockOnKeyDown.mockReturnValue(true);
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const result = handlers.onKeyDown!({ event });

      expect(mockOnKeyDown).toHaveBeenCalledWith(event);
      expect(result).toBe(true);
    });

    it('returns false for unhandled keys', () => {
      mockOnKeyDown.mockReturnValue(false);
      const handlers = createSuggestionRenderer(DummyComponent)();
      handlers.onStart!(makeProps());

      const result = handlers.onKeyDown!({ event: new KeyboardEvent('keydown', { key: 'a' }) });
      expect(result).toBe(false);
    });
  });

  describe('stableCommand', () => {
    it('always calls the latest command', () => {
      const handlers = createSuggestionRenderer(DummyComponent)();

      const command1 = vi.fn();
      const command2 = vi.fn();

      handlers.onStart!(makeProps({ command: command1 }));
      const stableCommand = capturedProps.command;

      handlers.onUpdate!(makeProps({ command: command2 }));

      stableCommand({ id: 'test' });

      expect(command1).not.toHaveBeenCalled();
      expect(command2).toHaveBeenCalledWith({ id: 'test' });
    });
  });
});
