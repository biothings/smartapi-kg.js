import { asyncBuilderFactory } from "./operations_builder/async_builder_factory";
import { syncBuilderFactory } from "./operations_builder/sync_builder_factory";
import { SmartAPIKGOperationObject } from "./parser/types";
import { BuilderOptions, FilterCriteria } from "./types";
import { ft } from "./filter";
import path from "path";
import Debug from "debug";
import QueryOperationObject from "./parser/query_operation";
import { lockWithActionAsync } from "@biothings-explorer/utils";
const debug = Debug("bte:smartapi-kg:MetaKG");

export * from "./types";
export * from "./parser/types";

export default class MetaKG {
  private _ops: SmartAPIKGOperationObject[];
  private _file_path: string;
  private _predicates_path: string;
  /**
   * constructor to build meta knowledge graph from SmartAPI Specifications
   */
  constructor(path: string = undefined, predicates_path: string = undefined, ops: SmartAPIKGOperationObject[] = []) {
    // store all meta-kg operations
    ops.forEach(op => {
      op.query_operation = QueryOperationObject.unfreeze(op.query_operation);
    });
    this._ops = ops;
    this.path = path;
    this.predicates_path = predicates_path;
  }

  set path(file_path: string) {
    if (typeof file_path === "undefined") {
      this._file_path = path.resolve(__dirname, "./data/smartapi_specs.json");
    } else {
      this._file_path = file_path;
    }
  }

  set predicates_path(file_path: string) {
    if (typeof file_path === "undefined") {
      this._predicates_path = path.resolve(__dirname, "./data/predicates.json");
    } else {
      this._predicates_path = file_path;
    }
  }

  get ops(): SmartAPIKGOperationObject[] {
    return this._ops;
  }

  /**
   * Construct API Meta Knowledge Graph based on SmartAPI Specifications.
   * @param {boolean} includeReasoner - specify whether to include reasonerStdAPI into meta-kg
   */
  async constructMetaKG(includeReasoner = false, options: BuilderOptions = {}): Promise<SmartAPIKGOperationObject[]> {
    this._ops = await asyncBuilderFactory(options, includeReasoner);
    return this.ops;
  }

  /**
   * Construct API Meta Knowledge Graph based on SmartAPI Specifications.
   * @param {string} tag - the SmartAPI tag to be filtered on
   */
  constructMetaKGSync(includeReasoner = false, options: BuilderOptions = {}): SmartAPIKGOperationObject[] {
    this._ops = syncBuilderFactory(options, includeReasoner, this._file_path, this._predicates_path);
    return this.ops;
  }

  /* Async wrapper for using constructMetaKGSync to enable using async file locking */
  async constructMetaKGWithFileLock(includeReasoner = false, options: BuilderOptions = {}): Promise<SmartAPIKGOperationObject[]> {
    this._ops = await lockWithActionAsync(
      [this._file_path, this._predicates_path],
      async () => {
        return syncBuilderFactory(options, includeReasoner, this._file_path, this._predicates_path);
      },
      debug
    );
    return this.ops;
  }

  /**
   * Filters the whole meta kg based on apiList, teamName, tag or component
   * @param {Object} options - filtering options
   */
  filterKG(options: BuilderOptions = {}) {
    if (options.smartAPIID) {
      this._ops = this._ops.filter(op => op.association.smartapi.id === options.smartAPIID);
    } else if (options.teamName) {
      this._ops = this._ops.filter(op => op.association?.["x-translator"]?.teamName === options.teamName);
    } else if (options.tag) {
      this._ops = this._ops.filter(op => op.tags?.includes(options.tag));
    } else if (options.component) {
      this._ops = this._ops.filter(op => op.association?.["x-translator"]?.component === options.component);
    }
  }


  /**
   * Filter the Meta-KG operations based on specific criteria
   * @param {Object} - filtering criteria, each key represents the field to be quried
   */
  filter(criteria: FilterCriteria): SmartAPIKGOperationObject[] {
    return ft(this.ops, criteria);
  }
}
