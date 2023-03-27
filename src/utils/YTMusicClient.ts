import { interpreter as py, PyModule, PyObject } from "node-calls-python";
import { SearchOptions, SearchResult } from "./search";
import type { SearchParams } from "./search";
import { z } from "zod";

export class YTMusicClient {
  #pyMod: PyModule;
  #pyYT: PyObject;

  constructor() {
    this.#pyMod = py.importSync("src/utils/ytmusicconnect.py");
    this.#pyYT = py.createSync(this.#pyMod, "YTMusic");
  }

  #pythonCall(functionName: string, ...args: unknown[]) {
    try {
      const result = py.callSync(this.#pyYT, functionName, ...args);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async search(options: SearchParams): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      const safeOptions = SearchOptions.safeParse(options);
      if (!safeOptions.success) {
        reject(new Error("Options passed were not valid options"));
        return;
      }
      const pythonResult = this.#pythonCall(
        "search",
        safeOptions.data.query,
        safeOptions.data.filter,
        safeOptions.data.scope,
        safeOptions.data.limit,
        safeOptions.data.ignore_spelling
      );
      if (!pythonResult.success) {
        reject(new Error(pythonResult.error));
        return;
      }
      const safeResult = z.array(SearchResult).safeParse(pythonResult.data);
      if (!safeResult.success) {
        reject(new Error("Response data couldn't be verified"));
        return;
      }
      resolve(safeResult.data);
    });
  }
}
