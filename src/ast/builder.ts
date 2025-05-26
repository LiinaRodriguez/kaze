
import type { ASTNode } from "../ast/ASTBuilder.ts"; 

type CustomNodeData = {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string; 
};

type ReactFlowNode = {
  id: string;
  type: string; 
  position: { x: number; y: number };
  data: CustomNodeData;
};

type ReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
};

let nodeIdCounter = 0;

function generateNodeId(name: string): string {
  return `${name.replace(/\s+/g, '_')}-${nodeIdCounter++}`;
}

export function buildReactFlowGraph(root: ASTNode): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
} {
  const nodes: ReactFlowNode[] = [];
  const edges: ReactFlowEdge[] = [];
  nodeIdCounter = 0; 
  const levelYOffset: { [key: number]: number } = {};


  function traverse(
    current: ASTNode,
    parentId: string | null,
    depth: number,
   
    siblingOrder: number
  ) {
    const id = generateNodeId(current.name || "node");

    if (levelYOffset[depth] === undefined) {
        levelYOffset[depth] = 0;
    }
    const position = { x: depth * 250, y: levelYOffset[depth] };
    levelYOffset[depth] += 150;


    nodes.push({
      id,
      type: "custom",
      position,
      data: {
        label: current.label,
        backgroundColor: current.bgcolor,
        textColor: current.color,
        borderColor: current.bgcolor,
      },
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