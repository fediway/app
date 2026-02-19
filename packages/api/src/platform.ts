export interface PlatformAdapter {
  secureGet: (key: string) => Promise<string | null>;
  secureSet: (key: string, value: string) => Promise<void>;
  secureRemove: (key: string) => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  isNative: () => boolean;
}

class WebPlatformAdapter implements PlatformAdapter {
  async secureGet(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined')
      return null;
    return localStorage.getItem(key);
  }

  async secureSet(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined')
      return;
    localStorage.setItem(key, value);
  }

  async secureRemove(key: string): Promise<void> {
    if (typeof localStorage === 'undefined')
      return;
    localStorage.removeItem(key);
  }

  async openUrl(url: string): Promise<void> {
    window.open(url, '_self');
  }

  isNative(): boolean {
    return false;
  }
}

let adapter: PlatformAdapter = new WebPlatformAdapter();

export function setPlatformAdapter(a: PlatformAdapter): void {
  adapter = a;
}

export function getPlatformAdapter(): PlatformAdapter {
  return adapter;
}
