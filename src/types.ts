import { SmartAPISpec, SmartAPIRegistryRecordObject } from "./parser/types";

export interface SmartAPIQueryResult {
  hits: SmartAPISpec[];
}

export interface apiListItem {
  primarySource?: boolean;
  id?: string;
  infores?: string;
  name: string;
}

export interface XTRAPIObject {
  batch_size_limit?: number;
  rate_limit?: number;
}

export interface apiListObject {
  include: apiListItem[];
  exclude: apiListItem[];
}

export interface BuilderOptions {
  tag?: string;
  teamName?: string;
  smartAPIID?: string;
  component?: string;
  apiList?: apiListObject;
}

interface PredicatesQueryOperationInterface {
  path: string;
  server: string;
  method: string;
}

interface PredicatesAssociationInterface {
  api_name: string;
  smartapi: SmartAPIRegistryRecordObject;
  "x-translator": any;
  "x-trapi"?: XTRAPIObject;
}

export interface PredicatesMetadata {
  association: PredicatesAssociationInterface;
  tags: string[];
  query_operation: PredicatesQueryOperationInterface;
  predicates: ReasonerPredicatesResponse;
  nodes?: PredicatesNodes;
}

interface PredicatesNodes {
  [propName: string]: PredicatesNode
}

interface PredicatesNode {
  id_prefixes?: string[]
}

interface ReasonerSubjectAndPredicate {
  [propName: string]: (string | any)[];
}

export interface ReasonerPredicatesResponse {
  [propName: string]: ReasonerSubjectAndPredicate;
}

export interface FilterCriteria {
  input_type?: undefined | string | string[];
  output_type?: undefined | string | string[];
  predicate?: undefined | string | string[];
  api_name?: undefined | string | string[];
  source?: undefined | string | string[];
  component?: undefined | string | string[];
  [propName: string]: undefined | string | string[];
}

export interface ObjectWithValueAsSet {
  [propName: string]: Set<any>;
}
