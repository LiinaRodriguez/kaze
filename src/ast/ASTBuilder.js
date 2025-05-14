export class ASTBuilder {
    constructor(astMap) {
        this.astMap = astMap;
    }
    build(rootName = "root") {
        const root = this.astMap.get(rootName);
        if (!root)
            throw new Error(`Root node "${rootName}" not found`);
        return this.buildNode(root);
    }
    buildNode(node) {
        return {
            name: node.name,
            label: node.label,
            color: node.style?.color ?? undefined,
            bgcolor: node.style?.bgcolor ?? undefined,
            children: node.children.map((childName) => {
                const childNode = this.astMap.get(childName);
                if (!childNode) {
                    throw new Error(`Missing child node: ${childName}`);
                }
                return this.buildNode(childNode);
            })
        };
    }
}
