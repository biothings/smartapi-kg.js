import AllSpecsSyncLoader from "./all_specs_sync_loader";
import { apiListObject, SmartAPIQueryResult } from "../types";
import { SmartAPISpec } from "../parser/types";
import Debug from "debug";
const debug = Debug("bte:smartapi-kg:SingleSpecSyncLoader");

export default class SingleSpecSyncLoader extends AllSpecsSyncLoader {
  private _smartAPIID: string;
  private _apiList: apiListObject;

  constructor(smartAPIID: string, apiList: apiListObject, path: string) {
    super(path);
    this._smartAPIID = smartAPIID;
    this._apiList = apiList;
  }

  parse(input: SmartAPIQueryResult): SmartAPISpec[] {
    return input.hits
      .filter(item => {
        let api = this._apiList.exclude.find(api => api.id === item._id);
        if (api && api.name !== item.info.title) {
          debug(`Expected to get '${api.name}' with smartapi-id:${api.id} but instead got '${item.info.title}'`);
        }
        return !api;
      })
      .filter(item => item._id === this._smartAPIID);
  }
}
