<script setup lang="ts">
import { PhCamera, PhPlus, PhX } from '@phosphor-icons/vue';
import { useAccountStore, useAuth, useClient } from '@repo/api';
import { Avatar, Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input, Textarea, useToast } from '@repo/ui';
import { VisuallyHidden } from 'reka-ui';
import { ref, watch } from 'vue';

interface ProfileField {
  name: string;
  value: string;
}

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const { currentUser } = useAuth();
const { toast } = useToast();

const displayName = ref('');
const bio = ref('');
const fields = ref<ProfileField[]>([]);
const avatarPreview = ref('');
const avatarFile = ref<File | null>(null);
const headerPreview = ref('');
const headerFile = ref<File | null>(null);
const isSaving = ref(false);
const errorMessage = ref('');

const NAME_LIMIT = 30;
const BIO_LIMIT = 500;
const MAX_FIELDS = 4;
const FIELD_LIMIT = 255;

// Reset form when modal opens
watch(() => props.isOpen, (open) => {
  if (open && currentUser.value) {
    displayName.value = currentUser.value.displayName || '';
    bio.value = (currentUser.value as any).source?.note || currentUser.value.note?.replace(/<[^>]*>/g, '') || '';
    avatarPreview.value = currentUser.value.avatar || '';
    avatarFile.value = null;
    headerPreview.value = currentUser.value.header || '';
    headerFile.value = null;
    isSaving.value = false;
    errorMessage.value = '';

    // Load profile fields
    const sourceFields = (currentUser.value as any).source?.fields
      ?? currentUser.value.fields
      ?? [];
    fields.value = sourceFields.map((f: any) => ({ name: f.name || '', value: f.value?.replace(/<[^>]*>/g, '') || '' }));
  }
});

function pickFile(onFile: (file: File) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (file)
      onFile(file);
  };
  input.click();
}

function handleHeaderChange() {
  pickFile((file) => {
    headerFile.value = file;
    headerPreview.value = URL.createObjectURL(file);
  });
}

function handleAvatarChange() {
  pickFile((file) => {
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  });
}

function addField() {
  if (fields.value.length < MAX_FIELDS)
    fields.value.push({ name: '', value: '' });
}

function removeField(index: number) {
  fields.value.splice(index, 1);
}

async function handleSave() {
  if (isSaving.value)
    return;

  isSaving.value = true;
  errorMessage.value = '';

  try {
    const client = useClient();
    const params: Record<string, any> = {
      displayName: displayName.value,
      note: bio.value,
      fieldsAttributes: fields.value.map(f => ({
        name: f.name,
        value: f.value,
      })),
    };

    if (avatarFile.value)
      params.avatar = avatarFile.value;
    if (headerFile.value)
      params.header = headerFile.value;

    const updated = await client.rest.v1.accounts.updateCredentials(params);

    const store = useAccountStore();
    store.currentUser.value = updated;

    toast.success('Profile updated');
    emit('close');
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to update profile';
  }
  finally {
    isSaving.value = false;
  }
}

function handleOpenChange(open: boolean) {
  if (!open)
    emit('close');
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="md" :show-close="false" full-screen-mobile>
      <div class="flex h-full flex-col">
        <!-- Header -->
        <header class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Button variant="muted" size="sm" @click="emit('close')">
            Cancel
          </Button>
          <Button size="sm" :disabled="isSaving || !displayName.trim()" @click="handleSave">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </header>

        <VisuallyHidden>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your display name, bio, and avatar</DialogDescription>
        </VisuallyHidden>

        <!-- Error -->
        <div
          v-if="errorMessage"
          role="alert"
          class="mx-4 mt-3 rounded-xl border border-red-200 bg-red-background p-3 text-sm text-red"
        >
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <!-- Header banner -->
          <button
            type="button"
            class="group relative w-full cursor-pointer"
            aria-label="Change header image"
            @click="handleHeaderChange"
          >
            <div class="h-32 w-full bg-muted">
              <img
                v-if="headerPreview"
                :src="headerPreview"
                alt=""
                class="h-full w-full object-cover"
              >
            </div>
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <div class="flex size-10 items-center justify-center rounded-full bg-black/50">
                <PhCamera :size="20" class="text-white" />
              </div>
            </div>
          </button>

          <!-- Avatar (overlapping the banner) -->
          <div class="relative -mt-12 mb-4 px-4">
            <button
              type="button"
              class="group relative cursor-pointer"
              aria-label="Change avatar"
              @click="handleAvatarChange"
            >
              <Avatar :src="avatarPreview" :alt="displayName" size="xl" class="ring-4 ring-card" />
              <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <PhCamera :size="20" class="text-white" />
              </div>
            </button>
          </div>

          <!-- Text fields -->
          <div class="space-y-4 px-4">
            <!-- Display name -->
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label for="profile-name" class="text-sm font-medium text-foreground">
                  Display name
                </label>
                <span class="text-xs text-muted-foreground" :class="{ 'text-red': displayName.length > NAME_LIMIT }">
                  {{ displayName.length }} / {{ NAME_LIMIT }}
                </span>
              </div>
              <Input
                id="profile-name"
                v-model="displayName"
                placeholder="Your display name"
                :maxlength="NAME_LIMIT"
              />
            </div>

            <!-- Bio -->
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label for="profile-bio" class="text-sm font-medium text-foreground">
                  Bio
                </label>
                <span class="text-xs text-muted-foreground" :class="{ 'text-red': bio.length > BIO_LIMIT }">
                  {{ bio.length }} / {{ BIO_LIMIT }}
                </span>
              </div>
              <Textarea
                id="profile-bio"
                v-model="bio"
                placeholder="Tell people about yourself"
                rows="3"
                class="resize-none"
                :maxlength="BIO_LIMIT"
              />
            </div>

            <!-- Extra info — shown on your profile -->
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label class="text-sm font-medium text-foreground">
                  Extra info
                </label>
                <span class="text-xs text-muted-foreground">{{ fields.length }} / {{ MAX_FIELDS }}</span>
              </div>
              <p class="mb-3 text-xs text-muted-foreground">
                Add links, pronouns, location, or anything else. These show on your profile.
              </p>

              <div v-if="fields.length > 0" class="space-y-3">
                <div
                  v-for="(field, index) in fields"
                  :key="index"
                  class="flex items-center gap-2 rounded-xl bg-muted/50 p-3"
                >
                  <div class="min-w-0 flex-1 space-y-2">
                    <Input
                      v-model="field.name"
                      :placeholder="['Website', 'Pronouns', 'Location', 'Joined'][index] ?? 'Label'"
                      :maxlength="FIELD_LIMIT"
                      class="text-sm"
                    />
                    <Input
                      v-model="field.value"
                      :placeholder="['https://...', 'they/them', 'Berlin, Germany', '2024'][index] ?? 'Value'"
                      :maxlength="FIELD_LIMIT"
                      class="text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Remove field"
                    @click="removeField(index)"
                  >
                    <PhX :size="16" />
                  </button>
                </div>
              </div>

              <button
                v-if="fields.length < MAX_FIELDS"
                type="button"
                class="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                @click="addField"
              >
                <PhPlus :size="16" />
                Add info
              </button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
