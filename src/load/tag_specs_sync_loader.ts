import { SmartAPIQueryResult, apiListObject } from "../types";
import { SmartAPISpec } from "../parser/types";
import APIListSpecsSyncLoader from "./api_list_specs_sync_loader";

export default class TagSpecsSyncLoader extends APIListSpecsSyncLoader {
  private _tag: string;

  constructor(tag: string, apiList: apiListObject, path: string) {
    super(apiList, path);
    this._tag = tag;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits.filter((item) =>
      item.tags.map((t) => t.name).includes(this._tag)
    );
  }
}
