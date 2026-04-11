<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { EmojiSuggestion } from './EmojiList.vue';
import type { HashtagSuggestion } from './HashtagList.vue';
import type { MentionSuggestion } from './MentionList.vue';
import CharacterCount from '@tiptap/extension-character-count';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, Extension, useEditor } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, watch } from 'vue';
import { cn } from '../../lib/utils';
import { countCharacters, countReplyCharacters, HASHTAG_RE, MENTION_RE } from './charcount';
import EmojiList from './EmojiList.vue';
import HashtagList from './HashtagList.vue';
import MentionList from './MentionList.vue';
import { createSuggestionRenderer } from './suggestion';

interface Props {
  /** Placeholder text */
  placeholder?: string;
  /** Character limit (from instance config) */
  limit?: number;
  /** Search function for @mention autocomplete (injected by shell) */
  searchMentions?: (query: string) => Promise<MentionSuggestion[]>;
  /** Search function for #hashtag autocomplete (injected by shell) */
  searchHashtags?: (query: string) => Promise<HashtagSuggestion[]>;
  /** Search function for :emoji: autocomplete (injected by shell) */
  searchEmoji?: (query: string) => Promise<EmojiSuggestion[]>;
  /** Reply target acct — leading @mention excluded from character count */
  replyToAcct?: string;
  /** Auto-focus on mount */
  autofocus?: boolean;
  /** Disabled state (during submission) */
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'What\'s on your mind?',
  limit: 500,
  autofocus: false,
  disabled: false,
});

const emit = defineEmits<{
  /** User pressed Cmd/Ctrl+Enter */
  submit: [];
  /** User pasted image data from clipboard */
  pasteMedia: [files: File[]];
  /** Content changed (for draft saving — debounce in consumer) */
  update: [];
}>();

// Custom extension for Cmd/Ctrl+Enter submit and Tab focus-out
const KeymapExtension = Extension.create({
  name: 'fediwayKeymap',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        emit('submit');
        return true;
      },
      'Tab': () => {
        // Move focus out of editor instead of inserting tab
        const editorEl = this.editor.view.dom;
        const focusable = editorEl.closest('[data-slot="compose-textarea"]')
          ?.parentElement
          ?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
          const editorIndex = Array.from(focusable).indexOf(editorEl);
          const next = focusable[editorIndex + 1] as HTMLElement;
          if (next) {
            next.focus();
            return true;
          }
        }
        return true; // Prevent tab character regardless
      },
    };
  },
});

// Custom extension for paste interception (images)
const PasteExtension = Extension.create({
  name: 'fediwayPaste',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            paste(_view, event) {
              const files = Array.from(event.clipboardData?.files ?? []);
              const mediaFiles = files.filter(f =>
                f.type.startsWith('image/') || f.type.startsWith('video/'),
              );
              if (mediaFiles.length > 0) {
                event.preventDefault();
                emit('pasteMedia', mediaFiles);
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});

// Decoration plugin: highlights #hashtags and @mentions in plain text
// This handles the case where users type hashtags/mentions manually without autocomplete
const highlightPluginKey = new PluginKey('fediwayHighlight');

const HighlightExtension = Extension.create({
  name: 'fediwayHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: highlightPluginKey,
        state: {
          init(_, state) {
            return buildDecorations(state.doc);
          },
          apply(tr, oldDecorations) {
            if (tr.docChanged) {
              return buildDecorations(tr.doc);
            }
            return oldDecorations;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function buildDecorations(doc: any): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node: any, pos: number) => {
    if (!node.isText)
      return;

    const text = node.text!;

    // Skip nodes that are already mention/hashtag nodes (handled by Tiptap)
    // We only decorate plain text

    for (const re of [HASHTAG_RE, MENTION_RE]) {
      re.lastIndex = 0;
      let match: RegExpExecArray | null = re.exec(text);
      while (match !== null) {
        const fullMatch = match[1]!;
        // Calculate the start position: match.index + leading whitespace
        const start = pos + match.index + (match[0].length - fullMatch.length);
        const end = start + fullMatch.length;
        decorations.push(
          Decoration.inline(start, end, { class: 'compose-inline-highlight' }),
        );
        match = re.exec(text);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // Disable features we don't need for social posts
      bold: false,
      italic: false,
      strike: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      heading: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      horizontalRule: false,
      dropcursor: false,
      gapcursor: false,
      undoRedo: { depth: 10 },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    CharacterCount.configure({
      limit: props.limit,
    }),
    // @mention autocomplete
    Mention.configure({
      HTMLAttributes: { class: 'compose-mention' },
      deleteTriggerWithBackspace: true,
      suggestion: {
        char: '@',
        allowSpaces: false,
        items: async ({ query }) => {
          if (!query || !props.searchMentions)
            return [];
          return props.searchMentions(query);
        },
        render: createSuggestionRenderer(MentionList),
      },
      renderLabel({ node }) {
        return `@${node.attrs.id ?? node.attrs.label}`;
      },
    }),
    Mention.extend({ name: 'hashtag' }).configure({
      HTMLAttributes: { class: 'compose-hashtag' },
      deleteTriggerWithBackspace: true,
      suggestion: {
        char: '#',
        allowSpaces: false,
        items: async ({ query }) => {
          if (!query || !props.searchHashtags)
            return [];
          const results = await props.searchHashtags(query);
          return results.map(t => ({ ...t, id: t.name }));
        },
        render: createSuggestionRenderer(HashtagList),
      },
      renderLabel({ node }) {
        return `#${node.attrs.id}`;
      },
    }),
    // :emoji: autocomplete (reuse Mention extension with different name)
    Mention.extend({ name: 'emoji' }).configure({
      HTMLAttributes: { class: 'compose-emoji' },
      deleteTriggerWithBackspace: true,
      suggestion: {
        char: ':',
        allowSpaces: false,
        items: async ({ query }) => {
          if (!query || query.length < 2 || !props.searchEmoji)
            return [];
          const results = await props.searchEmoji(query);
          // Map shortcode → id (Tiptap Mention expects item.id for node attrs)
          return results.map(e => ({ ...e, id: e.shortcode }));
        },
        render: createSuggestionRenderer(EmojiList),
      },
      renderLabel({ node }) {
        return `:${node.attrs.id}:`;
      },
    }),
    KeymapExtension,
    PasteExtension,
    HighlightExtension,
  ],
  editorProps: {
    attributes: {
      'class': 'min-h-[150px] w-full font-content text-lg leading-relaxed text-foreground outline-none',
      'role': 'textbox',
      'aria-multiline': 'true',
      'aria-label': props.placeholder,
    },
  },
  autofocus: props.autofocus ? 'end' : false,
  editable: !props.disabled,
  onUpdate() {
    emit('update');
  },
});

// Sync disabled state
watch(() => props.disabled, (disabled) => {
  editor.value?.setEditable(!disabled);
});

// URL-aware character count, excluding leading reply @mention
const characterCount = computed(() => {
  if (!editor.value)
    return 0;
  const text = editor.value.getText({ blockSeparator: '\n' });
  return props.replyToAcct
    ? countReplyCharacters(text, props.replyToAcct)
    : countCharacters(text);
});

const isEmpty = computed(() => {
  return editor.value?.isEmpty ?? true;
});

// Expose imperative API
defineExpose({
  /** Get plain text for API submission. Mentions render as @acct, hashtags as #tag. */
  getPlainText(): string {
    if (!editor.value)
      return '';
    // getText() with blockSeparator handles paragraph breaks
    // Mention nodes use renderLabel which outputs @acct / #tag
    return editor.value.getText({ blockSeparator: '\n' });
  },
  /** Set content (for draft restoration, reply @mention). Call once on mount. */
  setContent(text: string) {
    // Escape HTML entities before inserting as HTML (defense against malicious content)
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
    editor.value?.commands.setContent(`<p>${escaped}</p>`);
  },
  /** Whether the editor has any content */
  get isEmpty() {
    return isEmpty.value;
  },
  /** Current character count (URL-aware) */
  get characterCount() {
    return characterCount.value;
  },
  /** Clear the editor */
  clear() {
    editor.value?.commands.clearContent();
  },
  /** Focus the editor */
  focus() {
    editor.value?.commands.focus('end');
  },
  /** Insert text at current cursor position */
  insertText(text: string) {
    editor.value?.commands.insertContent(text);
    editor.value?.commands.focus();
  },
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div
    data-slot="compose-textarea"
    :class="cn('compose-textarea', props.class)"
  >
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
/* Tiptap placeholder */
.compose-textarea .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--muted-foreground);
  opacity: 0.7;
  pointer-events: none;
  float: left;
  height: 0;
}

/* Remove default ProseMirror focus outline */
.compose-textarea .ProseMirror:focus {
  outline: none;
}

/* Ensure paragraphs have proper spacing */
.compose-textarea .ProseMirror p {
  margin: 0;
}

.compose-textarea .ProseMirror p + p {
  margin-top: 0.5em;
}

/* Inline mention/hashtag highlighting — both node-based (from autocomplete) and text-based (typed manually) */
.compose-textarea .compose-mention,
.compose-textarea .compose-hashtag,
.compose-textarea .compose-inline-highlight {
  color: var(--galaxy-500);
}

:where(.dark) .compose-textarea .compose-mention,
:where(.dark) .compose-textarea .compose-hashtag,
:where(.dark) .compose-textarea .compose-inline-highlight {
  color: var(--galaxy-400);
}
</style>
