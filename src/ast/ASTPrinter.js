import chalk from "chalk";
export class ASTPrinter {
    static print(node) {
        this.printNode(node, "", true);
    }
    static printNode(node, prefix, isLast) {
        const connector = isLast ? "└── " : "├── ";
        const labelText = `${node.name} (${node.label})`;
        let styledText = labelText;
        // Aplica color de texto y fondo si están definidos
        try {
            if (node.color && node.bgcolor) {
                styledText = chalk.hex(node.color).bgHex(node.bgcolor)(labelText);
            }
            else if (node.color) {
                styledText = chalk.hex(node.color)(labelText);
            }
            else if (node.bgcolor) {
                styledText = chalk.bgHex(node.bgcolor)(labelText);
            }
        }
        catch {
            // Si el color no es válido, se deja sin estilos
        }
        console.log(`${prefix}${connector}${styledText}`);
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        const childCount = node.children.length;
        node.children.forEach((child, index) => {
            const isChildLast = index === childCount - 1;
            this.printNode(child, newPrefix, isChildLast);
        });
    }
}
