export type Result<T> = { success: true; data: T } | { success: false; error: string };

export type Header = {
  "user-agent": string;
  accept: string;
  "accept-encoding": string;
  "content-type": string;
  "content-encoding": string;
  origin: string;
  "x-goog-visitor-id"?: string;
};

export type Context = {
  context: {
    client: {
      clientName: "WEB_REMIX";
      clientVersion: string;
      hl?: string;
    };
    user: Record<string, unknown>;
  };
};
