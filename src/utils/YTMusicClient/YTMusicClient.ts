import { YTM_BASE_API, YTM_PARAMS } from "./constants";
import * as helper from "./helpers";
import { Result, Header, Context } from "./types";
import axios, { AxiosError } from "axios";

export class _YTMusicClient {
  _cookies;
  _headers: Header;
  _context: Context;

  constructor() {
    this._cookies = { CONSENT: "YES+1" } as const;
    void this._cookies;
    // * WARN: Auth not implemented
    this._headers = helper.initializeHeaders();

    if (!this._headers?.["x-goog-visitor-id"]) {
      let helpersGetVisitorId: Record<string, string> = {};
      (async () => {
        helpersGetVisitorId = await helper.getVisitorId(this._sendGetRequest.bind(this));
      })();

      this._headers = {
        ...this._headers,
        ...helpersGetVisitorId,
      };
    }

    // prepare context
    this._context = helper.initializeContext();
    this._context["context"]["client"]["hl"] = "en";
  }

  async _sendRequest(endpoint: string, body: Record<string, unknown>, additionalParams = ""): Promise<Result<string>> {
    return new Promise((resolve, reject) => {
      body = { ...body, ...this._context };
      // * WARN: Auth not implemented
      const URL = YTM_BASE_API + endpoint + YTM_PARAMS + additionalParams;
      axios
        .post<string>(URL, JSON.stringify(body))
        .then((response) => resolve({ success: true, data: response.data }))
        .catch((err: AxiosError) => {
          const message = `Server returned HTTP ${err.response?.status}: ${err.cause?.message}.\n`;
          const error = err.message;
          reject({ success: false, error: message + error });
        });
    });
  }

  async _sendGetRequest(url: string, params?: Record<string, unknown>) {
    const response = await axios.get<string>(url, {
      params: params,
      headers: this._headers,
    });
    return response.data;
  }
}
