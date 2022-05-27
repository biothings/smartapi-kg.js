import BaseOperationsBuilder from "./base_operations_builder";
import { syncLoaderFactory } from "../load/sync_loader_factory";
import { BuilderOptions } from "../types";
import Debug from "debug";
const debug = Debug("bte:smartapi-kg:SyncOperationsBuilder");

export default class SyncOperationsBuilder extends BaseOperationsBuilder {
  private _file_path: string;

  constructor(options: BuilderOptions, path: string) {
    super(options);
    this._file_path = path;
  }

  build() {
    const specs = syncLoaderFactory(
      this._options.smartAPIID,
      this._options.teamName,
      this._options.tag,
      this._options.component,
      this._options.apiList,
      this._file_path,
    );
    const ops = this.loadOpsFromSpecs(specs);
    if (!(typeof this._options.apiList === "undefined")) {
      return ops.filter(op => {
        let api = this._options.apiList.find(api => api.id === op.association.smartapi.id);
        if (api && api.name !== op.association.api_name) {
          debug(
            `Expected to get '${api.name}' with smartapi-id:${api.id} but instead got '${op.association.api_name}'`,
          );
        }
        return api;
      });
    }
  }
}
