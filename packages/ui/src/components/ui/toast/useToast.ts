import { ref } from 'vue';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant: 'default' | 'success' | 'error';
  duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function addToast(options: Omit<Toast, 'id'>) {
  const id = String(nextId++);
  toasts.value.push({ ...options, id });
  return id;
}

function removeToast(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id);
}

export function useToast() {
  function toast(title: string, options?: { description?: string; variant?: Toast['variant']; duration?: number }) {
    return addToast({
      title,
      description: options?.description,
      variant: options?.variant ?? 'default',
      duration: options?.duration ?? 4000,
    });
  }

  toast.success = (title: string, optionsOrDesc?: string | { description?: string; action?: { label: string; onClick: () => void } }) => {
    const opts = typeof optionsOrDesc === 'string' ? { description: optionsOrDesc } : optionsOrDesc;
    return addToast({ title, description: opts?.description, action: opts?.action, variant: 'success', duration: 4000 });
  };

  toast.error = (title: string, optionsOrDesc?: string | { description?: string; action?: { label: string; onClick: () => void } }) => {
    const opts = typeof optionsOrDesc === 'string' ? { description: optionsOrDesc } : optionsOrDesc;
    return addToast({ title, description: opts?.description, action: opts?.action, variant: 'error', duration: 6000 });
  };

  return { toast, toasts, removeToast };
}
