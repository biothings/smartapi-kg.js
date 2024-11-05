import BaseOperationsBuilder from "./base_operations_builder";
import { syncLoaderFactory } from "../load/sync_loader_factory";
import { BuilderOptions } from "../types";
import { lockWithActionSync } from "@biothings-explorer/utils";
import { SmartAPISpec } from "../parser/types";
const debug = require("debug")("bte:smartapi-kg:SyncOperationsBuilder");

export default class SyncOperationsBuilder extends BaseOperationsBuilder {
  private _file_path: string;

  constructor(options: BuilderOptions, path: string) {
    super(options);
    this._file_path = path;
  }

  build() {
    let specs: SmartAPISpec[] = lockWithActionSync(this._file_path, () => {
      return syncLoaderFactory(
        this._options.smartAPIID,
        this._options.teamName,
        this._options.tag,
        this._options.component,
        this._options.apiList,
        this._file_path,
        this._options.smartapiSpecs
      );
    }, debug);

    return this.loadOpsFromSpecs(specs);
  }
}
