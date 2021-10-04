import {
  XBTEKGSOperationObject,
  QueryOperationInterface,
  XBTEParametersObject,
} from "./types";

export default class QueryOperationObject implements QueryOperationInterface {
  private _params: XBTEParametersObject;
  private _requestBody: object;
  private _requestBodyType: string;
  private _supportBatch: boolean;
  private _useTemplating: boolean;
  private _inputSeparator: string;
  private _path: string;
  private _method: string;
  private _server: string;
  private _tags: string[];
  private _pathParams: string[];
  private _templateInputs: object;

  set xBTEKGSOperation(newOp: XBTEKGSOperationObject) {
    this._params = newOp.parameters;
    this._requestBody = newOp.requestBody;
    this._requestBodyType = newOp.requestBodyType;
    this._supportBatch = newOp.supportBatch;
    this._useTemplating = newOp.useTemplating;
    this._inputSeparator = newOp.inputSeparator;
    this._templateInputs = newOp.templateInputs;
  }

  get templateInputs(): object {
    return this._templateInputs;
  }

  get params(): XBTEParametersObject {
    return this._params;
  }

  get request_body(): object {
    return this._requestBody;
  }

  get requestBodyType(): string {
    return this._requestBodyType;
  }

  get supportBatch(): boolean {
    return this._supportBatch;
  }

  get useTemplating(): boolean {
    return this._useTemplating;
  }

  get inputSeparator(): string {
    return this._inputSeparator;
  }

  set path(newPath: string) {
    this._path = newPath;
  }

  get path(): string {
    return this._path;
  }

  get method(): string {
    return this._method;
  }

  set method(newMethod: string) {
    this._method = newMethod;
  }

  get server(): string {
    return this._server;
  }

  set server(newServer: string) {
    this._server = newServer;
  }

  get tags(): string[] {
    return this._tags;
  }

  set tags(newTags: string[]) {
    this._tags = newTags;
  }

  get path_params(): string[] {
    return this._pathParams;
  }

  set path_params(newPathParams: string[]) {
    this._pathParams = newPathParams;
  }
}
