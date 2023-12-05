import { QueryOperationInterface, XBTEKGSOperationObject, XBTEParametersObject } from "./types";

export default class QueryOperationObject implements QueryOperationInterface {
  private _params: XBTEParametersObject;
  private _requestBody: any;
  private _requestBodyType: string;
  private _supportBatch: boolean;
  private _batchSize: number;
  private _useTemplating: boolean;
  private _inputSeparator: string;
  private _path: string;
  private _method: string;
  private _server: string;
  private _tags: string[];
  private _pathParams: string[];
  private _templateInputs: any;
  private _inputType: string;
  private _outputType: string;
  private _refResolver: (input: any) => any;

  set inputType(inputType: string) {
    this._inputType = inputType;
  }

  set outputType(outputType: string) {
    this._outputType = outputType;
  }

  set refResolver(refResolver: (input: any) => any) {
    this._refResolver = refResolver;
  }

  set xBTEKGSOperation(newOp: XBTEKGSOperationObject) {
    if (newOp.requestInfo.differsByInputNamespace && this._inputType in newOp.requestInfo.byInputNamespace) {
        this._params = newOp.requestInfo.byInputNamespace[this._inputType].parameters;
        this._requestBody = newOp.requestInfo.byInputNamespace[this._inputType].requestBody;
        this._requestBodyType = newOp.requestInfo.byInputNamespace[this._inputType].requestBodyType;
    } else if (newOp.requestInfo.differsByOutputNamespace && this._outputType in newOp.requestInfo.byOutputNamespace) {
        this._params = newOp.requestInfo.byOutputNamespace[this._outputType].parameters;
        this._requestBody = newOp.requestInfo.byOutputNamespace[this._outputType].requestBody;
        this._requestBodyType = newOp.requestInfo.byOutputNamespace[this._outputType].requestBodyType;
    } else {
        this._params = newOp.requestInfo.parameters;
        this._requestBody = newOp.requestInfo.requestBody;
        this._requestBodyType = newOp.requestInfo.requestBodyType;
    }

    // resolve refs
    if (this._refResolver) {
        this._params = this._refResolver(this._params);
        this._requestBody = this._refResolver(this._requestBody);
    }

    this._supportBatch = newOp.supportBatch;
    this._useTemplating = newOp.useTemplating;
    this._inputSeparator = newOp.inputSeparator;
    this._templateInputs = newOp.templateInputs;
    this._batchSize = newOp.batchSize;
  }

  get templateInputs(): any {
    return this._templateInputs;
  }

  get params(): XBTEParametersObject {
    return this._params;
  }

  get request_body(): any {
    return this._requestBody;
  }

  get requestBodyType(): string {
    return this._requestBodyType;
  }

  get supportBatch(): boolean {
    return this._supportBatch;
  }

  get batchSize(): number {
    return this._batchSize;
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
