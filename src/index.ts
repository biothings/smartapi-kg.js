import { asyncBuilderFactory } from "./operations_builder/async_builder_factory";
import { syncBuilderFactory } from "./operations_builder/sync_builder_factory";
import { SmartAPIKGOperationObject, SmartAPIKGOperationMapping } from "./parser/types";
import { BuilderOptions, FilterCriteria } from "./types";
import { ft } from "./filter";
import path from "path";
import Debug from "debug";
const debug = Debug("bte:smartapi-kg:MetaKG");

export default class MetaKG {
  private _ops: SmartAPIKGOperationObject[];
  private _mapped_ops: SmartAPIKGOperationMapping;
  private _file_path: string;
  private _predicates_path: string;
  /**
   * constructor to build meta knowledge graph from SmartAPI Specifications
   */
  constructor(path: string = undefined, predicates_path: string = undefined) {
    // store all meta-kg operations
    this._ops = [];
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
  async constructMetaKG(
    includeReasoner: boolean = false,
    options: BuilderOptions = {}
  ): Promise<SmartAPIKGOperationObject[]> {
    this._ops = await asyncBuilderFactory(options, includeReasoner);
    return this.ops;
  }

  /**
   * Construct API Meta Knowledge Graph based on SmartAPI Specifications.
   * @param {string} tag - the SmartAPI tag to be filtered on
   */
  constructMetaKGSync(
    includeReasoner: boolean = false,
    options: BuilderOptions = {}
  ): SmartAPIKGOperationObject[] {
    this._ops = syncBuilderFactory(
      options,
      includeReasoner,
      this._file_path,
      this._predicates_path
    );
    return this.ops;
  }

  /**
   * Construct Meta Knowledge Graph mapped to nodes (after original Meta Knowledge Graph constructed)
   */
  constructMappedMetaKG(): SmartAPIKGOperationMapping {
    if (!this.ops) return {};
    this._mapped_ops = {};
    for (let op of this.ops) {
        if (!this._mapped_ops[op.association.input_type]) this._mapped_ops[op.association.input_type] = [];
        this._mapped_ops[op.association.input_type].push(op);
    }
    return this._mapped_ops;
  }

  /**
   * Finds a path between two nodes
   */
  findPath(startNode: string, endNode: string, minLength: number, maxLength: number, repeatedNodes: boolean): string[][] {
    if (!this._mapped_ops) this.constructMappedMetaKG();
    if (!this._mapped_ops[startNode] || !this._mapped_ops[endNode]) return null;

    const stack: [string[], number][] = [[[startNode], 0]];
    const answers: string[][] = [];

    while (stack.length) {
        const [curPath, hops] = stack.pop();
        if (hops >= minLength && curPath[curPath.length-1] === endNode) {answers.push(curPath);console.log(curPath);}
        if (hops >= maxLength) continue;

        const predicateOuptutPairs: Set<string> = new Set();
        for (const op of (this._mapped_ops[curPath[curPath.length-1]] ?? [])) {
            if (curPath.includes(op.association.output_type) && !repeatedNodes) continue;
            if (predicateOuptutPairs.has(`${op.association.predicate}-${op.association.output_type}`)) continue;
            predicateOuptutPairs.add(`${op.association.predicate}-${op.association.output_type}`);

            stack.push([[...curPath, op.association.predicate, op.association.output_type], hops+1]);
        }
    }

    return answers;
  }

  /**
   * Filter the Meta-KG operations based on specific criteria
   * @param {Object} - filtering criteria, each key represents the field to be quried
   */
  filter(criteria: FilterCriteria): SmartAPIKGOperationObject[] {
    return ft(this.ops, criteria);
  }
}
