export class HttpError extends Error {
  public readonly response: Response;
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;

  constructor(response: Response) {
    const message = `HTTP error ${response.status} (${response.statusText}) for URL: ${response.url}`;
    super(message);
    this.name = 'HttpError';
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

export class FetchAbortedError extends Error {
  constructor(message: string = 'Request aborted', options?: ErrorOptions) {
    super(message, options);
    this.name = 'FetchAbortedError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchAbortedError);
    }
  }
}
