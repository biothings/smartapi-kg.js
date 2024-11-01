import BaseLoader from "./base_loader";
import { SmartAPIQueryResult } from "../types";
import { SmartAPISpec } from "../parser/types";
import fs from "fs";
import { Debug } from "@biothings-explorer/utils";
const debug = Debug("bte:smartapi-kg:AllSpecsSyncLoader");

export default class AllSpecsSyncLoader extends BaseLoader {
  private _file_path: string;
  private _smartapiSpecs?: SmartAPISpec | SmartAPIQueryResult;
  constructor(path: string, smartapiSpecs?: SmartAPISpec | SmartAPIQueryResult) {
    super();
    this._file_path = path;
    this._smartapiSpecs = smartapiSpecs;
  }
  protected fetch(): SmartAPIQueryResult {
    let data: SmartAPIQueryResult | SmartAPISpec;
    if (this._smartapiSpecs) {
        data = this._smartapiSpecs;
    } else {
        debug(`Fetching from file path: ${this._file_path}`);
        const file = fs.readFileSync(this._file_path, "utf-8");
        data = JSON.parse(file) as SmartAPIQueryResult | SmartAPISpec;
    }

    let result;
    if (!("hits" in data)) {
      result = {
        hits: [data],
      };
    } else {
      result = data;
    }
    debug(`Hits in inputs: ${"hits" in data}`);
    return result;
  }

  protected parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits;
  }

  load(): SmartAPISpec[] {
    const specs = this.fetch();
    return this.parse(specs);
  }
}
