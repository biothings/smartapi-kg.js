import BaseLoader from "./base_loader";
import { SmartAPIQueryResult } from "../types";
import { SmartAPISpec } from "../parser/types";
import fs from "fs";
import Debug from "debug";
const debug = Debug("bte:smartapi-kg:AllSpecsSyncLoader");
const { redisClient } = require("@biothings-explorer/utils");

export default class AllSpecsSyncLoader extends BaseLoader {
  private _file_path: string;
  constructor(path: string) {
    super();
    this._file_path = path;
  }
  protected async fetch(): Promise<SmartAPIQueryResult> {
    debug(`Fetching from file path: ${this._file_path} ${redisClient.clientEnabled}`);
    let data: SmartAPIQueryResult | SmartAPISpec;

    if (redisClient.clientEnabled) {
        const redisData = await redisClient.client.getTimeout(`bte:smartapi:smartapi`).catch(console.log)
        if (redisData) {
            data = (JSON.parse(redisData))?.smartapi as SmartAPIQueryResult | SmartAPISpec;
        }
    }
    
    if (!data) {
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

  async load(): Promise<SmartAPISpec[]> {
    const specs = await this.fetch();
    return this.parse(specs);
  }
}
