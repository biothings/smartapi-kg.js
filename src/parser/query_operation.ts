import { QueryOperationInterface, XBTEKGSOperationObject, XBTEParametersObject } from "./types";

export default class QueryOperationObject implements QueryOperationInterface {
  params: XBTEParametersObject;
  request_body: any;
  requestBodyType: string;
  supportBatch: boolean;
  batchSize: number;
  useTemplating: boolean;
  inputSeparator: string;
  path: string;
  method: string;
  server: string;
  tags: string[];
  path_params: string[];
  templateInputs: any;

  static unfreeze(obj: any) {
    const newObj = new QueryOperationObject();
    newObj.params = obj.params;
    newObj.request_body = obj.request_body;
    newObj.requestBodyType = obj.requestBodyType;
    newObj.supportBatch = obj.supportBatch;
    newObj.batchSize = obj.batchSize;
    newObj.useTemplating = obj.useTemplating;
    newObj.inputSeparator = obj.inputSeparator;
    newObj.path = obj.path;
    newObj.method = obj.method;
    newObj.server = obj.server;
    newObj.tags = obj.tags;
    newObj.path_params = obj.path_params;
    newObj.templateInputs = obj.templateInputs;
    return newObj;
  }

  set xBTEKGSOperation(newOp: XBTEKGSOperationObject) {
    this.params = newOp.parameters;
    this.request_body = newOp.requestBody;
    this.requestBodyType = newOp.requestBodyType;
    this.supportBatch = newOp.supportBatch;
    this.useTemplating = newOp.useTemplating;
    this.inputSeparator = newOp.inputSeparator;
    this.templateInputs = newOp.templateInputs;
    this.batchSize = newOp.batchSize;
  }
}
