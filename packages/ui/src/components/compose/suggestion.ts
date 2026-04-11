import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import type { Instance } from 'tippy.js';
import type { Component } from 'vue';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';

/**
 * Creates a Tiptap suggestion renderer that mounts a Vue component inside a tippy.js popup.
 *
 * The component must:
 * - Accept `suggestions` prop (the items array)
 * - Accept `command` prop (function to call when user selects an item)
 * - Expose `onKeyDown(event: KeyboardEvent): boolean` via defineExpose
 */
export function createSuggestionRenderer(component: Component): SuggestionOptions['render'] {
  return () => {
    let renderer: VueRenderer;
    let popup: Instance;

    // Store command in closure — the stable wrapper always reads the latest value
    let latestCommand: SuggestionProps['command'] | undefined;
    function stableCommand(item: any) {
      latestCommand?.(item);
    }

    return {
      onStart(props: SuggestionProps) {
        latestCommand = props.command;

        renderer = new VueRenderer(component, {
          props: {
            suggestions: props.items,
            command: stableCommand,
            loading: false,
          },
          editor: props.editor,
        });

        if (!props.clientRect)
          return;

        const editorEl = props.editor.view.dom;
        const container = editorEl.closest('[role="dialog"]') || document.body;

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => container,
          content: renderer.element!,
          showOnCreate: true,
          interactive: true,
          interactiveBorder: 20,
          trigger: 'manual',
          placement: 'bottom-start',
          maxWidth: 'none',
          offset: [0, 8],
        });
      },

      onUpdate(props: SuggestionProps) {
        latestCommand = props.command;

        renderer?.updateProps({
          suggestions: props.items,
          command: stableCommand,
          loading: false,
        });

        if (props.clientRect) {
          popup?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }): boolean {
        if (props.event.key === 'Escape') {
          popup?.hide();
          return true;
        }
        return renderer?.ref?.onKeyDown?.(props.event) ?? false;
      },

      onExit() {
        latestCommand = undefined;
        popup?.destroy();
        renderer?.destroy();
      },
    };
  };
}
