import { SmartAPIQueryResult, apiListObject } from "../types";
import { SmartAPISpec } from "../parser/types";
import AllSpecsSyncLoader from "./all_specs_sync_loader";

export default class ComponentSpecsSyncLoader extends AllSpecsSyncLoader {
  private _component: string;

  constructor(component: string, path: string, smartapiSpecs?: SmartAPISpec | SmartAPIQueryResult) {
    super(path, smartapiSpecs);
    this._component = component;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits.filter(
      item => "x-translator" in item.info && item.info["x-translator"].component === this._component,
    );
  }
}
