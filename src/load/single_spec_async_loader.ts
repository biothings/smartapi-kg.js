import BaseAsyncLoader from "./base_async_loader";
import { SINGLE_API_SMARTAPI_QUERY_TEMPLATE } from "../config";
import { SmartAPISpec } from "../parser/types";

export default class SingleSpecAsyncLoader extends BaseAsyncLoader {
  private _smartapi_id: string;
  constructor(smartAPIID: string) {
    super(SINGLE_API_SMARTAPI_QUERY_TEMPLATE.replace("{smartapi_id}", smartAPIID));
    this._smartapi_id = smartAPIID;
  }

  protected async fetch(): Promise<SmartAPISpec> {
    return super.fetch() as Promise<SmartAPISpec>;
  }

  protected parse(input: SmartAPISpec): SmartAPISpec[] {
    input._id = this._smartapi_id;
    return [input];
  }
}
