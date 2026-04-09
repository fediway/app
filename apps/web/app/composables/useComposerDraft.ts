import type { Status } from '@repo/types';
import type { ComposeTextarea } from '@repo/ui';
import type { Ref } from 'vue';
import { useDraft } from '@repo/api';
import { computed, nextTick, ref, watch } from 'vue';
import { useSettings } from '~/composables/useSettings';
import { useNavigationStore } from '~/stores/navigation';

interface DraftDeps {
  isOpen: () => boolean;
  replyTo: () => Status | null | undefined;
  editorRef: Ref<InstanceType<typeof ComposeTextarea> | undefined>;
  spoilerText: Ref<string>;
  showContentWarning: Ref<boolean>;
  visibility: Ref<'public' | 'unlisted' | 'private' | 'direct'>;
  showPoll: Ref<boolean>;
  pollOptions: Ref<string[]>;
  pollDuration: Ref<number>;
  pollMultiple: Ref<boolean>;
  hasUnsavedContent: () => boolean;
  onResetMedia: () => void;
}

export function useComposerDraft(deps: DraftDeps) {
  const { settings: appSettings } = useSettings();
  const navigation = useNavigationStore();

  const draftKey = computed(() => {
    const acct = navigation.currentUser?.acct ?? 'anon';
    const reply = deps.replyTo();
    return reply ? `${acct}:reply:${reply.id}` : acct;
  });
  const draft = useDraft(draftKey.value);

  const draftStatus = ref<'idle' | 'saving' | 'saved'>('idle');

  function saveDraft() {
    if (!deps.isOpen() || !deps.hasUnsavedContent())
      return;
    draftStatus.value = 'saving';
    draft.save({
      content: deps.editorRef.value?.getPlainText() ?? '',
      spoilerText: deps.spoilerText.value,
      visibility: deps.visibility.value,
      inReplyToId: deps.replyTo()?.id,
      ...(deps.showPoll.value
        ? {
            pollOptions: deps.pollOptions.value,
            pollDuration: deps.pollDuration.value,
            pollMultiple: deps.pollMultiple.value,
          }
        : {}),
    });
    setTimeout(() => {
      if (draftStatus.value === 'saving')
        draftStatus.value = 'saved';
    }, 1200);
  }

  watch(
    [deps.spoilerText, deps.visibility, deps.pollOptions, deps.pollDuration, deps.pollMultiple, deps.showPoll],
    saveDraft,
  );

  watch(deps.isOpen, async (isOpen) => {
    if (isOpen) {
      deps.spoilerText.value = '';
      deps.showContentWarning.value = false;
      deps.visibility.value = appSettings.privacy.defaultVisibility;
      deps.showPoll.value = false;
      deps.pollOptions.value = ['', ''];
      deps.pollMultiple.value = false;
      deps.pollDuration.value = 86400;
      draftStatus.value = 'idle';
      deps.onResetMedia();

      await nextTick();

      const saved = await draft.load();
      if (saved && saved.content.trim()) {
        deps.editorRef.value?.setContent(saved.content);
        deps.spoilerText.value = saved.spoilerText;
        deps.showContentWarning.value = saved.spoilerText.length > 0;
        deps.visibility.value = saved.visibility;
        if (saved.pollOptions && saved.pollOptions.length >= 2) {
          deps.showPoll.value = true;
          deps.pollOptions.value = saved.pollOptions;
          deps.pollDuration.value = saved.pollDuration ?? 86400;
          deps.pollMultiple.value = saved.pollMultiple ?? false;
        }
        draftStatus.value = 'saved';
      }
      else if (deps.replyTo()) {
        deps.editorRef.value?.setContent(`@${deps.replyTo()!.account.acct} `);
      }
      else {
        deps.editorRef.value?.clear();
      }

      deps.editorRef.value?.focus();
    }
    else {
      deps.onResetMedia();
    }
  });

  async function flushDraft() {
    await draft.flush();
  }

  async function discardDraft() {
    await draft.discard();
  }

  return {
    draftStatus,
    saveDraft,
    flushDraft,
    discardDraft,
  };
}
