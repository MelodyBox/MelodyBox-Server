import { interpreter as py, PyModule, PyObject } from "node-calls-python";
import path from "path";
import fs from "fs";

export class _YTMusic {
  #pyMod: PyModule;
  #pyYT: PyObject;

  constructor() {
    // ensures the python file always exist for build
    const pyFile = path.resolve(__dirname, "ytmusicconnect.py");
    fs.writeFileSync(pyFile, "from ytmusicapi import YTMusic", { encoding: "utf-8" });
    this.#pyMod = py.importSync(pyFile);
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
