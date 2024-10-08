import BaseOperationsBuilder from "./base_operations_builder";
import { syncLoaderFactory } from "../load/sync_loader_factory";
import { BuilderOptions } from "../types";
import fs from "fs";
import { SmartAPIKGOperationObject } from "../parser/types";
import { PredicatesMetadata } from "../types";
import Debug from "debug";
const debug = Debug("bte:smartapi-kg:SyncOperationsBuilderWithReasoner");
import { SmartAPISpec } from "../parser/types";
import { biolink } from "@biothings-explorer/utils";

declare global {
  var missingAPIs: SmartAPISpec[];
}

export default class SyncOperationsBuilderWithReasoner extends BaseOperationsBuilder {
  private _file_path: string;
  private _predicates_file_path: string;

  constructor(
    options: BuilderOptions,
    path: string,
    predicates_file_path: string,
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
    metadata: PredicatesMetadata,
  ): SmartAPIKGOperationObject[] {
    const ops = [] as SmartAPIKGOperationObject[];
    if (!("predicates" in metadata)) {
      return ops;
    }
    //predicates are store as OBJ:{SUBJ:[predicates]}
    //parses each layer accordingly
    let injectedOps = 0;
    Object.keys(metadata.predicates).map(obj => {
      Object.keys(metadata.predicates[obj]).map(sbj => {
        if (Array.isArray(metadata.predicates[obj][sbj])) {
          metadata.predicates[obj][sbj].map(pred => {
            const op = {
              association: {
                input_type: this.removeBioLinkPrefix(sbj),
                input_id: metadata?.nodes?.[sbj]?.id_prefixes,
                output_type: this.removeBioLinkPrefix(obj),
                output_id: metadata?.nodes?.[obj]?.id_prefixes,
                predicate: this.removeBioLinkPrefix(
                  typeof pred === "string" ? pred : pred.predicate,
                ),
                api_name: metadata.association.api_name,
                smartapi: metadata.association.smartapi,
                qualifiers:
                  typeof pred === "string" || !pred.qualifiers
                    ? undefined
                    : Object.fromEntries(
                      pred.qualifiers.map((q: any) => [
                        this.removeBioLinkPrefix(q.qualifier_type_id),
                        q.applicable_values.map(this.removeBioLinkPrefix),
                      ]),
                    ),
                "x-translator": metadata.association["x-translator"],
                "x-trapi": metadata.association["x-trapi"],
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
            };
            ops.push(op);
            if (
              !this._options.apiList ||
              !this._options.apiList.include.find(
                api => api.id === metadata.association.smartapi.id,
              )?.includeFlipped
            ) {
              return;
            }
            // Add inverse metaEdge if includeFlipped is true
            const inverse_op = {
              ...op,
              association: {
                ...op.association,
                input_type: this.removeBioLinkPrefix(obj),
                input_id: metadata?.nodes?.[obj]?.id_prefixes,
                output_type: this.removeBioLinkPrefix(sbj),
                output_id: metadata?.nodes?.[sbj]?.id_prefixes,
                predicate: biolink.reverse(
                  this.removeBioLinkPrefix(
                    typeof pred === "string" ? pred : pred.predicate,
                  ),
                ),
                qualifiers:
                  typeof pred === "string" || !pred.qualifiers
                    ? undefined
                    : Object.fromEntries(
                      pred.qualifiers.map((q: any) => {
                        let newQualifierType: string = q.qualifier_type_id;
                        let newQualifier: string[] = q.applicable_values.map(
                          this.removeBioLinkPrefix,
                        );
                        if (newQualifierType.includes("predicate")) {
                          newQualifier = newQualifier.map(biolink.reverse);
                        }
                        if (newQualifierType.includes("subject")) {
                          newQualifierType = newQualifierType.replace(
                            "subject",
                            "object",
                          );
                        } else if (newQualifierType.includes("object")) {
                          newQualifierType = newQualifierType.replace(
                            "object",
                            "subject",
                          );
                        }

                        return [newQualifierType, newQualifier];
                      }),
                    ),
              },
            };
            if (inverse_op.association.predicate) {
              ops.push(inverse_op);
              injectedOps += 1;
            }
          });
        }
      });
    });
    if (injectedOps) {
      debug(`Injected ${injectedOps} inverse operations for ${metadata.association.api_name}`);
    }
    if (!(typeof this._options.apiList === "undefined")) {
      return ops.filter(op => {
        const includeSmartAPI = this._options.apiList.include.find(
          api => api.id === op.association.smartapi.id && api.id !== undefined,
        );
        const includeInfoRes = this._options.apiList.include.find(
          api =>
            api.infores === op.association?.["x-translator"]?.infores &&
            api.infores !== undefined,
        );
        const excludeSmartAPI = this._options.apiList.exclude.find(
          api => api.id === op.association.smartapi.id && api.id !== undefined,
        );
        const excludeInfoRes = this._options.apiList.exclude.find(
          api =>
            api.infores === op.association?.["x-translator"]?.infores &&
            api.infores !== undefined,
        );

        let willBeIncluded;
        let apiValue;
        if (excludeSmartAPI) {
          willBeIncluded = false;
          apiValue = excludeSmartAPI;
        } else if (includeSmartAPI) {
          willBeIncluded = true;
          apiValue = includeSmartAPI;
        } else if (excludeInfoRes) {
          willBeIncluded = false;
          apiValue = excludeInfoRes;
        } else if (includeInfoRes) {
          apiValue = includeInfoRes;
          willBeIncluded = true;
        } else {
          apiValue = undefined;
          willBeIncluded = false;
        }

        if (apiValue && apiValue.name !== op.association.api_name) {
          debug(
            `Expected to get '${apiValue.name}' with smartapi-id:${apiValue.id} but instead got '${op.association.api_name}'`,
          );
        }

        return willBeIncluded;
      });
      // .filter(op => {
      //   let api = this._options.apiList.exclude.find(api => api.id === op.association.smartapi.id);
      //   if (api && api.name !== op.association.api_name) {
      //     debug(
      //       `Expected to get '${api.name}' with smartapi-id:${api.id} but instead got '${op.association.api_name}'`,
      //     );
      //   }
      //   return !api;
      // });
    }
    return ops;
  }

  private fetch(): PredicatesMetadata[] {
    if (this._options.predicates) {
      return this._options.predicates;
    }

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
      this._options.apiList,
      this._file_path,
      this._options.smartapiSpecs,
    );
    const nonTRAPIOps = this.loadOpsFromSpecs(specs);
    const predicatesMetadata = this.fetch();
    global.missingAPIs = syncLoaderFactory(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this._file_path,
      this._options.smartapiSpecs,
    ).filter(
      spec =>
        "info" in spec &&
        "x-translator" in spec.info &&
        spec.info["x-translator"].component === "KP" &&
        "paths" in spec &&
        "/query" in spec.paths &&
        "x-trapi" in spec.info &&
        spec.servers.length &&
        "/meta_knowledge_graph" in spec.paths &&
        !predicatesMetadata
          .map(m => m.association.smartapi.id)
          .includes(spec._id),
    );
    let TRAPIOps = [] as SmartAPIKGOperationObject[];
    predicatesMetadata.map(metadata => {
      TRAPIOps.push.apply(TRAPIOps, this.parsePredicateEndpoint(metadata));
    });
    const returnValue = [...nonTRAPIOps, ...TRAPIOps];
    return returnValue;
  }
}
