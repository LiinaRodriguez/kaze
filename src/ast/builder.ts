import type { ASTNode } from "../ast/ASTBuilder.ts";

type ReactFlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string };
};

type ReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

let nodeIdCounter = 0;
let positionY = 0;

function generateNodeId(name: string): string {
  return `${name}-${nodeIdCounter++}`;
}

export function buildReactFlowGraph(root: ASTNode): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
} {
  const nodes: ReactFlowNode[] = [];
  const edges: ReactFlowEdge[] = [];

  function traverse(
    current: ASTNode,
    parentId: string | null,
    depth: number,
    siblingIndex: number
  ) {
    const id = generateNodeId(current.name);
    const position = { x: depth * 250, y: siblingIndex * 120 + positionY };

    nodes.push({
      id,
      type: "default",
      position,
      data: { label: current.label },
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: true,
      });
    }

    current.children.forEach((child, index) => {
      traverse(child, id, depth + 1, index);
    });
  }

  traverse(root, null, 0, 0);
  return { nodes, edges };
}
