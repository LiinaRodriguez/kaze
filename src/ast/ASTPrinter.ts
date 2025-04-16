import chalk from "chalk";
import type { ASTNode } from "./ASTBuilder.js";

export class ASTPrinter {
  public static print(node: ASTNode): void {
    this.printNode(node, "", true);
  }

  private static printNode(node: ASTNode, prefix: string, isLast: boolean): void {
    const connector = isLast ? "└── " : "├── ";
    const labelText = `${node.name} (${node.label})`;
    
    let styledText = labelText;

    // Aplica color de texto y fondo si están definidos
    try {
      if (node.color && node.bgcolor) {
        styledText = chalk.hex(node.color).bgHex(node.bgcolor)(labelText);
      } else if (node.color) {
        styledText = chalk.hex(node.color)(labelText);
      } else if (node.bgcolor) {
        styledText = chalk.bgHex(node.bgcolor)(labelText);
      }
    } catch {
      // Si el color no es válido, se deja sin estilos
    }

    console.log(`${prefix}${connector}${styledText}`);

    const newPrefix = prefix + (isLast ? "    " : "│   ");
    const childCount = node.children.length;

    node.children.forEach((child: ASTNode, index: number) => {
      const isChildLast = index === childCount - 1;
      this.printNode(child, newPrefix, isChildLast);
    });
  }
}
