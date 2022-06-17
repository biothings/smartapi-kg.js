import { SmartAPIQueryResult, apiListObject } from "../types";
import { SmartAPISpec } from "../parser/types";
import APIListSpecsSyncLoader from "./api_list_specs_sync_loader";

export default class TeamSpecsSyncLoader extends APIListSpecsSyncLoader {
  private _teamName: string;

  constructor(teamName: string, apiList: apiListObject, path: string) {
    super(apiList, path);
    this._teamName = teamName;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits.filter(
      (item) =>
        "x-translator" in item.info &&
        "team" in item.info["x-translator"] &&
        Array.isArray(item.info["x-translator"].team) &&
        item.info["x-translator"].team.includes(this._teamName)
    );
  }
}
