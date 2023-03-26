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

  async search(options: SearchParams): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      const safeOptions = SearchOptions.parse(options);
      try {
        const pythonResult = py.callSync(
          this.#pyYT,
          "search",
          safeOptions.query,
          safeOptions.filter,
          safeOptions.scope,
          safeOptions.limit,
          safeOptions.ignore_spelling
        );
        const safeResult = z.array(SearchResult).safeParse(pythonResult);
        if (!safeResult.success) {
          throw new Error("Couldn't verify search result from python");
        }
        resolve(safeResult.data);
      } catch (err) {
        reject((err as Error).message);
      }
    });
  }
}
