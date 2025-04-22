import type { Node } from "../parser/Parser.js";

export type ASTNode = {
  name: string;
  label: string;
  color?: string;
  bgcolor?: string;
  children: ASTNode[];
};

export class ASTBuilder {
  private astMap: Map<string, Node>;

  constructor(astMap: Map<string, Node>) {
    this.astMap = astMap;
  }

  public build(rootName = "root"): ASTNode {
    const root = this.astMap.get(rootName);
    if (!root) throw new Error(`Root node "${rootName}" not found`);
    return this.buildNode(root);
  }

  private buildNode(node: Node): ASTNode {
    return {
      name: node.name,
      label: node.label,
      color: node.style?.color ?? undefined,
      bgcolor: node.style?.bgcolor ?? undefined,
      children: node.children.map((childName: string) => {
        const childNode = this.astMap.get(childName);
        if (!childNode) {
          throw new Error(`Missing child node: ${childName}`);
        }
        return this.buildNode(childNode);
      })
    };
  }
}
