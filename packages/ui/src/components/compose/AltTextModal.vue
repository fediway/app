<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import CharacterCounter from './CharacterCounter.vue';

interface Props {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 1500,
});

const emit = defineEmits<{
  'update:altText': [value: string];
  'close': [];
}>();

const localAlt = ref(props.altText);

watch(() => props.isOpen, (open) => {
  if (open) {
    localAlt.value = props.altText;
  }
});

const charCount = computed(() => localAlt.value.length);

function handleSave() {
  emit('update:altText', localAlt.value);
  emit('close');
}

function handleOpenChange(open: boolean) {
  if (!open)
    emit('close');
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="md" :show-close="false">
      <div class="p-4">
        <DialogTitle class="mb-4 text-lg font-bold">
          Edit alt text
        </DialogTitle>

        <!-- Image preview -->
        <div class="mb-4 overflow-hidden rounded-xl bg-muted">
          <img
            :src="imageUrl"
            alt=""
            decoding="async"
            class="max-h-48 w-full object-contain"
          >
        </div>

        <!-- Alt text input -->
        <textarea
          v-model="localAlt"
          placeholder="Describe this image for people who can't see it..."
          rows="3"
          class="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
          :maxlength="limit"
        />

        <!-- Footer: counter + save -->
        <div class="mt-3 flex items-center justify-between">
          <CharacterCounter :current="charCount" :limit="limit" />
          <div class="flex gap-2">
            <Button variant="muted" size="sm" @click="emit('close')">
              Cancel
            </Button>
            <Button size="sm" @click="handleSave">
              Save
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
