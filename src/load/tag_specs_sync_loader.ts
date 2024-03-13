import { SmartAPIQueryResult, apiListObject } from "../types";
import { SmartAPISpec } from "../parser/types";
import AllSpecsSyncLoader from "./all_specs_sync_loader";

export default class TagSpecsSyncLoader extends AllSpecsSyncLoader {
  private _tag: string;

  constructor(tag: string, path: string, smartapiSpecs?: SmartAPISpec | SmartAPIQueryResult) {
    super(path, smartapiSpecs);
    this._tag = tag;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits.filter(item => item.tags.map(t => t.name).includes(this._tag));
  }
}
