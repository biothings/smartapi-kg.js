import BaseOperationsBuilder from "./base_operations_builder";
import { syncLoaderFactory } from "../load/sync_loader_factory";
import { BuilderOptions } from "../types";
import fs from "fs";
import { SmartAPIKGOperationObject } from "../parser/types";
import { PredicatesMetadata } from "../types";

export default class SyncOperationsBuilderWithReasoner extends BaseOperationsBuilder {
  private _file_path: string;
  private _predicates_file_path: string;

  constructor(
    options: BuilderOptions,
    path: string,
    predicates_file_path: string
  ) {
    super(options);
    this._file_path = path;
    this._predicates_file_path = predicates_file_path;
  }

  private removeBioLinkPrefix(input: string): string {
    if (!(typeof input === "string")) {
      return undefined;
    }
    if (input.startsWith("biolink:")) {
      return input.slice(8);
    }
    return input;
  }

  private parsePredicateEndpoint(
    metadata: PredicatesMetadata
  ): SmartAPIKGOperationObject[] {
    let ops = [] as SmartAPIKGOperationObject[];
    if (!("predicates" in metadata)) {
      return ops;
    }
    Object.keys(metadata.predicates).map((sbj) => {
      Object.keys(metadata.predicates[sbj]).map((obj) => {
        if (Array.isArray(metadata.predicates[sbj][obj])) {
          metadata.predicates[sbj][obj].map((pred) => {
            ops.push({
              association: {
                input_type: this.removeBioLinkPrefix(sbj),
                output_type: this.removeBioLinkPrefix(obj),
                predicate: this.removeBioLinkPrefix(pred),
                api_name: metadata.association.api_name,
                smartapi: metadata.association.smartapi,
                "x-translator": metadata.association["x-translator"],
              },
              tags: [...metadata.tags, ...["bte-trapi"]],
              query_operation: {
                path: "/query",
                method: "post",
                server: metadata.query_operation.server,
                path_params: undefined,
                params: undefined,
                request_body: undefined,
                supportBatch: true,
                inputSeparator: ",",
                tags: [...metadata.tags, ...["bte-trapi"]],
              },
            });
          });
        }
      });
    });
    if (!(typeof this._options.apiNames === "undefined")) {
      return ops.filter((op) =>
        this._options.apiNames.includes(op.association.api_name)
      );
    }
    return ops;
  }

  private fetch(): PredicatesMetadata[] {
    const file = fs.readFileSync(this._predicates_file_path, "utf-8");
    const data = JSON.parse(file) as PredicatesMetadata[];
    return data;
  }

  build() {
    const specs = syncLoaderFactory(
      this._options.smartAPIID,
      this._options.teamName,
      this._options.tag,
      this._options.component,
      this._options.apiNames,
      this._file_path
    );
    const nonTRAPIOps = this.loadOpsFromSpecs(specs);
    const predicatesMetada = this.fetch();
    let TRAPIOps = [] as SmartAPIKGOperationObject[];
    predicatesMetada.map((metadata) => {
      TRAPIOps = [...TRAPIOps, ...this.parsePredicateEndpoint(metadata)];
    });
    return [...nonTRAPIOps, ...TRAPIOps];
  }
}
