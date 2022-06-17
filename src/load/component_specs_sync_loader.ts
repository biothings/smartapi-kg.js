import { SmartAPIQueryResult, apiListObject } from "../types";
import { SmartAPISpec } from "../parser/types";
import APIListSpecsSyncLoader from "./api_list_specs_sync_loader";

export default class ComponentSpecsSyncLoader extends APIListSpecsSyncLoader {
  private _component: string;

  constructor(component: string, apiList: apiListObject, path: string) {
    super(apiList, path);
    this._component = component;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits.filter(
      (item) =>
        "x-translator" in item.info &&
        item.info["x-translator"].component === this._component
    );
  }
}
