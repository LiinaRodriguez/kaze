let nodeIdCounter = 0;
function generateNodeId(name) {
    return `${name.replace(/\s+/g, '_')}-${nodeIdCounter++}`;
}
export function buildReactFlowGraph(root) {
    const nodes = [];
    const edges = [];
    nodeIdCounter = 0;
    const levelYOffset = {};
    function traverse(current, parentId, depth, siblingOrder) {
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
