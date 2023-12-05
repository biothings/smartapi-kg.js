import {
  SmartAPIPathItemObject,
  ParsedAPIMetadataObject,
  SmartAPIKGOperationObject,
  SmartAPIOperationObject,
  XBTEKGSOperationObject,
  SmartAPIReferenceObject,
  XBTEKGSInputNamespace,
  XBTEKGSOutputNamespace,
} from "./types";
import QueryOperationObject from "./query_operation";

export default class Endpoint {
  pathItemObject: SmartAPIPathItemObject;
  apiMetadata: ParsedAPIMetadataObject;
  path: string;

  constructor(pathItemObject: SmartAPIPathItemObject, apiMetadata: ParsedAPIMetadataObject, path: string) {
    this.pathItemObject = pathItemObject;
    this.apiMetadata = apiMetadata;
    this.path = path;
  }

  private fetchPathParams(OperationObject: SmartAPIOperationObject): string[] {
    const params: string[] = [];
    if (!("parameters" in OperationObject)) {
      return params;
    }
    for (const param of OperationObject.parameters) {
      if (param.in === "path") {
        params.push(param.name);
      }
    }
    return params;
  }

  private constructQueryOperation({
    op,
    method,
    pathParams,
    inputType,
    outputType
  }: {
    op: XBTEKGSOperationObject;
    method: string;
    pathParams: string[];
    inputType: string;
    outputType: string;
  }) {
    const server = this.apiMetadata.url;
    const queryOperation = new QueryOperationObject();
    queryOperation.refResolver = this.resolveRefIfProvided.bind(this);
    queryOperation.inputType = inputType;
    queryOperation.outputType = outputType;
    queryOperation.xBTEKGSOperation = op;
    queryOperation.method = method;
    queryOperation.path_params = pathParams;
    queryOperation.server = server;
    queryOperation.path = this.path;
    queryOperation.tags = this.apiMetadata.tags;
    return queryOperation;
  }

  private removeBioLinkPrefix(input: string | undefined) {
    if (typeof input === "undefined") {
      return input;
    }
    if (input.startsWith("biolink:")) {
      return input.replace(/biolink:/gi, "");
    }
    return input;
  }

  private resolveRefIfProvided(rec: SmartAPIReferenceObject) {
    return "$ref" in rec ? this.apiMetadata.components.fetchComponentByRef(rec.$ref) : rec;
  }

  private constructAssociation(
    input: XBTEKGSInputNamespace,
    output: XBTEKGSOutputNamespace,
    op: XBTEKGSOperationObject
  ) {
    return {
      input_id: this.removeBioLinkPrefix(input.prefix),
      input_type: this.removeBioLinkPrefix(op.inputs.semanticType),
      input_name_field: input.name_field,
      output_id: this.removeBioLinkPrefix(output.prefix),
      output_type: this.removeBioLinkPrefix(op.outputs.semanticType),
      output_id_field: output.id_field,
      output_name_field: output.name_field,
      predicate: this.removeBioLinkPrefix(op.predicate),
      qualifiers: op.qualifiers
        ? Object.fromEntries(
            Object.entries(op.qualifiers).map(([qualifierType, qualifier]) => [
              this.removeBioLinkPrefix(qualifierType),
              qualifier,
            ]),
          )
        : undefined,
      source: op.source,
      api_name: this.apiMetadata.title,
      smartapi: this.apiMetadata.smartapi,
      "x-translator": this.apiMetadata["x-translator"],
    };
  }

  private constructResponseMapping(op: XBTEKGSOperationObject, output: string, output_name: string, input_name: string) {
    if ("responseMapping" in op) {
      op.response_mapping = op.responseMapping;
    }
    if (!op.response_mapping) {
        op.response_mapping = {}
    }
    return {
      [op.predicate]: { ...this.resolveRefIfProvided(op.response_mapping), output, ...(output_name && { output_name }), ...(input_name && { input_name }) },
    };
  }

  private parseIndividualOperation({
    op,
    method,
    pathParams,
  }: {
    op: XBTEKGSOperationObject;
    method: string;
    pathParams: string[];
  }) {
    const res = [];
    for (const input of op.inputs.namespaces) {
      for (const output of op.outputs.namespaces) {
        let updateInfo = {} as SmartAPIKGOperationObject;
        const responseMapping = this.constructResponseMapping(op, output.id_field, input.name_field, output.name_field);
        const association = this.constructAssociation(input, output, op);
        const queryOperation = this.constructQueryOperation({
            op,
            method,
            pathParams,
            inputType: input.prefix,
            outputType: output.prefix
        });
        updateInfo = {
          query_operation: queryOperation,
          association,
          response_mapping: responseMapping,
          tags: queryOperation.tags,
        };
        res.push(updateInfo);
      }
    }
    return res;
  }

  constructEndpointInfo(): SmartAPIKGOperationObject[] {
    let res = [] as SmartAPIKGOperationObject[];
    ["get", "post"].map(method => {
      if (method in this.pathItemObject) {
        const pathParams = this.fetchPathParams(this.pathItemObject[method]);
        if (
          "x-bte-kgs-operations" in this.pathItemObject[method] &&
          Array.isArray(this.pathItemObject[method]["x-bte-kgs-operations"])
        ) {
          let operation;
          let op;
          for (const rec of this.pathItemObject[method]["x-bte-kgs-operations"]) {
            operation = this.resolveRefIfProvided(rec);
            operation = Array.isArray(operation) ? operation : [operation];
            for (op of operation) {
              res = [...res, ...this.parseIndividualOperation({ op, method, pathParams })];
            }
          }
        }
      }
    });
    return res;
  }
}
