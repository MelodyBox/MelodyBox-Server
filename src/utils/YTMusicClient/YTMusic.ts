import { interpreter as py, PyModule, PyObject } from "node-calls-python";

export class _YTMusic {
  #pyMod: PyModule;
  #pyYT: PyObject;

  constructor() {
    this.#pyMod = py.importSync("src/utils/YTMusicClient/ytmusicconnect.py");
    this.#pyYT = py.createSync(this.#pyMod, "YTMusic");
  }

  protected pythonCall(functionName: string, ...args: unknown[]) {
    try {
      const result = py.callSync(this.#pyYT, functionName, ...args);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
