export class FediwayAPIError extends Error {
  readonly status: number;
  readonly type: string;
  readonly code: string;

  constructor(opts: { status: number; type?: string; code?: string; message: string }) {
    super(opts.message);
    this.name = 'FediwayAPIError';
    this.status = opts.status;
    this.type = opts.type ?? 'unknown';
    this.code = opts.code ?? 'unknown';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }
}

export class FediwayNetworkError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'FediwayNetworkError';
    this.cause = cause;
  }
}

export function isFediwayAPIError(err: unknown): err is FediwayAPIError {
  return err instanceof FediwayAPIError;
}

export function isFediwayNetworkError(err: unknown): err is FediwayNetworkError {
  return err instanceof FediwayNetworkError;
}
